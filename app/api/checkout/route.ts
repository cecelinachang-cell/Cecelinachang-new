import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';
import { getCourseBySlug } from '@/lib/courses';
import { parseIdr } from '@/lib/pixels';
import { parseCheckoutBody } from '@/lib/checkout';
import { createSnapTransaction, getMidtransConfig, newMerchantRef } from '@/lib/midtrans';

// Unpaid VA numbers / QR codes expire after this long; Midtrans then sends an
// "expire" notification and the buyer can simply start a new checkout.
const PAYMENT_WINDOW_HOURS = 24;

export async function POST(req: NextRequest) {
  if (isRateLimited(`checkout:${getClientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Terlalu banyak percobaan, coba lagi sebentar.' }, { status: 429 });
  }

  const input = parseCheckoutBody(await req.json().catch(() => null));
  if ('error' in input) {
    return NextResponse.json({ ok: false, error: input.error }, { status: 400 });
  }

  const midtrans = getMidtransConfig();
  const admin = createAdminClient();
  if (!midtrans || !admin) {
    console.error('Checkout unavailable: MIDTRANS_SERVER_KEY or SUPABASE_SERVICE_ROLE_KEY not set.');
    return NextResponse.json(
      { ok: false, error: 'Pembayaran online belum aktif. Silakan daftar lewat WhatsApp.' },
      { status: 503 },
    );
  }

  // Price always comes from the catalog, never from the client.
  const course = await getCourseBySlug(input.courseSlug);
  const amount = parseIdr(course?.price);
  if (!course || !amount) {
    return NextResponse.json({ ok: false, error: 'Kelas tidak ditemukan.' }, { status: 404 });
  }

  const merchantRef = newMerchantRef();
  const origin = req.nextUrl.origin;

  // Save the order before calling Midtrans, so even an abandoned or failed
  // checkout leaves the buyer's contact details behind for a follow-up.
  const { error: insertError } = await admin.from('orders').insert({
    merchant_ref: merchantRef,
    course_slug: course.slug,
    course_title: course.title,
    amount,
    customer_name: input.name,
    customer_email: input.email,
    customer_phone: input.phone,
  });
  if (insertError) {
    console.error('Error inserting order:', insertError.message);
    return NextResponse.json({ ok: false, error: 'Gagal membuat pesanan, coba lagi.' }, { status: 500 });
  }

  const result = await createSnapTransaction(midtrans, {
    orderId: merchantRef,
    amount,
    customerName: input.name,
    customerEmail: input.email,
    customerPhone: input.phone,
    item: { id: course.slug, name: course.title, price: amount },
    finishUrl: `${origin}/pembayaran/${merchantRef}`,
    notificationUrl: `${origin}/api/midtrans/notification`,
    expiryHours: PAYMENT_WINDOW_HOURS,
  });

  if (!result.ok) {
    console.error(`Midtrans transaction failed for ${merchantRef}:`, result.message);
    await admin.from('orders').update({ status: 'FAILED', updated_at: new Date().toISOString() }).eq('merchant_ref', merchantRef);
    return NextResponse.json(
      { ok: false, error: 'Pembayaran sedang tidak tersedia. Coba lagi sebentar, atau daftar lewat WhatsApp.' },
      { status: 502 },
    );
  }

  await admin
    .from('orders')
    .update({ checkout_url: result.redirectUrl, updated_at: new Date().toISOString() })
    .eq('merchant_ref', merchantRef);

  return NextResponse.json({ ok: true, checkoutUrl: result.redirectUrl, merchantRef });
}
