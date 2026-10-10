import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';
import { getCourseBySlug } from '@/lib/courses';
import { parseIdr } from '@/lib/pixels';
import { parseCheckoutBody } from '@/lib/checkout';
import { createTransaction, getTripayConfig, newMerchantRef } from '@/lib/tripay';

// Unpaid VA numbers / QR codes expire after this long; Tripay then sends an
// EXPIRED callback and the buyer can simply start a new checkout.
const PAYMENT_WINDOW_SECONDS = 24 * 60 * 60;

export async function POST(req: NextRequest) {
  if (isRateLimited(`checkout:${getClientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Terlalu banyak percobaan, coba lagi sebentar.' }, { status: 429 });
  }

  const input = parseCheckoutBody(await req.json().catch(() => null));
  if ('error' in input) {
    return NextResponse.json({ ok: false, error: input.error }, { status: 400 });
  }

  const tripay = getTripayConfig();
  const admin = createAdminClient();
  if (!tripay || !admin) {
    console.error('Checkout unavailable: TRIPAY_* or SUPABASE_SERVICE_ROLE_KEY not set.');
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

  // Save the order before calling Tripay, so even an abandoned or failed
  // checkout leaves the buyer's contact details behind for a follow-up.
  const { error: insertError } = await admin.from('orders').insert({
    merchant_ref: merchantRef,
    course_slug: course.slug,
    course_title: course.title,
    amount,
    customer_name: input.name,
    customer_email: input.email,
    customer_phone: input.phone,
    payment_method: input.method,
  });
  if (insertError) {
    console.error('Error inserting order:', insertError.message);
    return NextResponse.json({ ok: false, error: 'Gagal membuat pesanan, coba lagi.' }, { status: 500 });
  }

  const result = await createTransaction(tripay, {
    method: input.method,
    merchantRef,
    amount,
    customerName: input.name,
    customerEmail: input.email,
    customerPhone: input.phone,
    item: { sku: course.slug, name: course.title, price: amount },
    returnUrl: `${origin}/pembayaran/${merchantRef}`,
    callbackUrl: `${origin}/api/tripay/callback`,
    expiresInSeconds: PAYMENT_WINDOW_SECONDS,
  });

  if (!result.ok) {
    console.error(`Tripay transaction failed for ${merchantRef}:`, result.message);
    await admin.from('orders').update({ status: 'FAILED', updated_at: new Date().toISOString() }).eq('merchant_ref', merchantRef);
    return NextResponse.json(
      { ok: false, error: 'Metode pembayaran ini sedang tidak tersedia. Coba metode lain.' },
      { status: 502 },
    );
  }

  await admin
    .from('orders')
    .update({ tripay_reference: result.reference, checkout_url: result.checkoutUrl, updated_at: new Date().toISOString() })
    .eq('merchant_ref', merchantRef);

  return NextResponse.json({ ok: true, checkoutUrl: result.checkoutUrl, merchantRef });
}
