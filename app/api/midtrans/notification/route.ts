import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import {
  getMidtransConfig,
  isValidNotificationSignature,
  mapTransactionStatus,
  parseGrossAmount,
  paymentLabel,
  type OrderStatus,
} from '@/lib/midtrans';
import { resend, isResendConfigured, FROM_ADDRESS, REPLY_TO_ADDRESS } from '@/lib/resend';
import { buildAdminPaidEmail, buildBuyerPaidEmail, type PaidOrder } from '@/lib/emails/order-emails';

// Midtrans' server-to-server HTTP notification. Checkout passes this URL per
// transaction (X-Override-Notification); set it in the dashboard too
// (Settings > Payment > Notification URL). Midtrans retries any non-2xx, so
// every path that has dealt with the event -- duplicates included -- returns 200.

// Which current statuses each incoming status may replace. A late "expire"
// must never overwrite a PAID, and a re-delivered settlement is a no-op.
const ALLOWED_FROM: Record<OrderStatus, readonly string[]> = {
  UNPAID: [],
  PAID: ['UNPAID', 'EXPIRED', 'FAILED'],
  EXPIRED: ['UNPAID'],
  FAILED: ['UNPAID'],
  REFUND: ['PAID'],
};

const ack = () => NextResponse.json({ ok: true });

export async function POST(req: NextRequest) {
  const midtrans = getMidtransConfig();
  const admin = createAdminClient();
  if (!midtrans || !admin) {
    console.error('Midtrans notification received but MIDTRANS_SERVER_KEY or SUPABASE_SERVICE_ROLE_KEY is not set.');
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const n = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!n || !isValidNotificationSignature(midtrans.serverKey, n)) {
    return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 401 });
  }

  const orderId = n.order_id as string;
  const status = mapTransactionStatus(n.transaction_status, n.fraud_status);

  const { data: order, error } = await admin.from('orders').select('*').eq('merchant_ref', orderId).maybeSingle();
  if (error) {
    console.error('Midtrans notification: order lookup failed:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  if (!order) {
    // The dashboard's "Test notification" button and other sites sharing the
    // account land here; nothing to do.
    console.warn(`Midtrans notification for unknown order ${orderId}`);
    return ack();
  }

  if (status === 'PAID') {
    const gross = parseGrossAmount(n.gross_amount);
    if (gross === null || gross < order.amount) {
      console.error(`Midtrans notification underpaid for ${orderId}: ${n.gross_amount} < ${order.amount}`);
      return NextResponse.json({ ok: false, message: 'Amount mismatch' }, { status: 400 });
    }
  }

  const method = paymentLabel(n);
  const transactionId = typeof n.transaction_id === 'string' ? n.transaction_id : null;

  if (status && ALLOWED_FROM[status].includes(order.status)) {
    const now = new Date().toISOString();
    // Conditional on the status we read, so two concurrent deliveries can't both win.
    const { data: updated, error: updateError } = await admin
      .from('orders')
      .update({
        status,
        updated_at: now,
        payment_method: method ?? order.payment_method,
        gateway_transaction_id: transactionId ?? order.gateway_transaction_id,
        ...(status === 'PAID'
          ? { paid_at: now, amount_received: parseGrossAmount(n.gross_amount) }
          : {}),
      })
      .eq('id', order.id)
      .eq('status', order.status)
      .select('id');

    if (updateError) {
      console.error('Midtrans notification: order update failed:', updateError.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    if (!updated?.length) return ack();
  } else if (!status && method && !order.payment_method) {
    // "pending": the buyer picked a method but hasn't paid yet. Record it so
    // abandoned checkouts in /admin/orders show what they chose.
    await admin.from('orders').update({ payment_method: method, updated_at: new Date().toISOString() }).eq('id', order.id);
  }

  if (status === 'PAID' && !order.paid_email_sent_at) {
    await sendPaidEmails(admin, {
      merchantRef: order.merchant_ref,
      courseTitle: order.course_title,
      amount: order.amount,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      paymentMethod: method ?? order.payment_method ?? 'Midtrans',
    });
  }

  return ack();
}

// Best-effort: an email failure never fails the notification -- the order is
// already PAID and shows in /admin/orders either way.
async function sendPaidEmails(admin: NonNullable<ReturnType<typeof createAdminClient>>, order: PaidOrder) {
  if (!isResendConfigured()) return;
  try {
    const buyer = buildBuyerPaidEmail(order);
    const seller = buildAdminPaidEmail(order);
    const [buyerRes] = await Promise.all([
      resend.emails.send(
        { from: FROM_ADDRESS, replyTo: REPLY_TO_ADDRESS, to: [order.customerEmail], subject: buyer.subject, html: buyer.html },
        { idempotencyKey: `order-paid-buyer/${order.merchantRef}` },
      ),
      resend.emails.send(
        { from: FROM_ADDRESS, replyTo: order.customerEmail, to: [REPLY_TO_ADDRESS], subject: seller.subject, html: seller.html },
        { idempotencyKey: `order-paid-admin/${order.merchantRef}` },
      ),
    ]);
    if (buyerRes.error) {
      console.error('Error sending order paid email:', buyerRes.error.message);
      return;
    }
    await admin
      .from('orders')
      .update({ paid_email_sent_at: new Date().toISOString() })
      .eq('merchant_ref', order.merchantRef);
  } catch (err) {
    console.error('Unexpected order paid email error:', err);
  }
}
