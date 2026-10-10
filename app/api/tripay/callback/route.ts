import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getTripayConfig, isValidCallbackSignature, parseTripayStatus, type TripayStatus } from '@/lib/tripay';
import { resend, isResendConfigured, FROM_ADDRESS, REPLY_TO_ADDRESS } from '@/lib/resend';
import { buildAdminPaidEmail, buildBuyerPaidEmail, type PaidOrder } from '@/lib/emails/order-emails';

// Tripay's server-to-server payment notification. Set this URL as the
// Callback URL in the Tripay dashboard too (checkout also sends it per
// transaction). Tripay retries until it gets {"success": true}, so every
// path that has dealt with the event -- including duplicates -- returns it.

// Which current statuses each incoming status may replace. A late EXPIRED
// must never overwrite a PAID, and a re-delivered PAID is a no-op.
const ALLOWED_FROM: Record<TripayStatus, readonly string[]> = {
  UNPAID: [],
  PAID: ['UNPAID', 'EXPIRED', 'FAILED'],
  EXPIRED: ['UNPAID'],
  FAILED: ['UNPAID'],
  REFUND: ['PAID'],
};

const ack = () => NextResponse.json({ success: true });

export async function POST(req: NextRequest) {
  const tripay = getTripayConfig();
  const admin = createAdminClient();
  if (!tripay || !admin) {
    console.error('Tripay callback received but TRIPAY_* or SUPABASE_SERVICE_ROLE_KEY is not set.');
    return NextResponse.json({ success: false }, { status: 503 });
  }

  const rawBody = await req.text();
  if (!isValidCallbackSignature(tripay.privateKey, rawBody, req.headers.get('x-callback-signature'))) {
    return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
  }

  if (req.headers.get('x-callback-event') !== 'payment_status') {
    return ack();
  }

  const event = JSON.parse(rawBody) as {
    reference?: string;
    merchant_ref?: string;
    status?: string;
    total_amount?: number;
    amount_received?: number;
    paid_at?: number | null;
  };

  const status = parseTripayStatus(event.status);
  if (!event.merchant_ref || !status) {
    return NextResponse.json({ success: false, message: 'Bad payload' }, { status: 400 });
  }

  const { data: order, error } = await admin
    .from('orders')
    .select('*')
    .eq('merchant_ref', event.merchant_ref)
    .maybeSingle();

  if (error) {
    console.error('Tripay callback: order lookup failed:', error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
  if (!order) {
    console.warn(`Tripay callback for unknown order ${event.merchant_ref}`);
    return ack();
  }

  if (order.tripay_reference && event.reference && order.tripay_reference !== event.reference) {
    console.error(`Tripay callback reference mismatch for ${order.merchant_ref}`);
    return NextResponse.json({ success: false, message: 'Reference mismatch' }, { status: 400 });
  }
  // total_amount includes any fee charged to the buyer, so it can only be >= our price.
  if (status === 'PAID' && typeof event.total_amount === 'number' && event.total_amount < order.amount) {
    console.error(`Tripay callback underpaid for ${order.merchant_ref}: ${event.total_amount} < ${order.amount}`);
    return NextResponse.json({ success: false, message: 'Amount mismatch' }, { status: 400 });
  }

  if (ALLOWED_FROM[status].includes(order.status)) {
    const now = new Date().toISOString();
    // Conditional on the status we read, so two concurrent deliveries can't both win.
    const { data: updated, error: updateError } = await admin
      .from('orders')
      .update({
        status,
        updated_at: now,
        tripay_reference: order.tripay_reference ?? event.reference ?? null,
        ...(status === 'PAID'
          ? {
              paid_at: event.paid_at ? new Date(event.paid_at * 1000).toISOString() : now,
              amount_received: typeof event.amount_received === 'number' ? event.amount_received : null,
            }
          : {}),
      })
      .eq('id', order.id)
      .eq('status', order.status)
      .select('id');

    if (updateError) {
      console.error('Tripay callback: order update failed:', updateError.message);
      return NextResponse.json({ success: false }, { status: 500 });
    }
    if (!updated?.length) return ack();
  }

  if (status === 'PAID' && !order.paid_email_sent_at) {
    await sendPaidEmails(admin, {
      merchantRef: order.merchant_ref,
      courseTitle: order.course_title,
      amount: order.amount,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      paymentMethod: order.payment_method,
    });
  }

  return ack();
}

// Best-effort: an email failure never fails the callback -- the order is
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
