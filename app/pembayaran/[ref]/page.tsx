import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase-admin';
import { waLink } from '@/lib/links';
import { Button } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { RefreshWhileUnpaid } from './RefreshWhileUnpaid';

// Midtrans' finish URL (app/api/checkout). The merchant_ref in the URL is
// random, so it acts as the buyer's private link to their own order.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Status Pembayaran | Cece Lina Chang',
  robots: { index: false, follow: false },
};

const rupiah = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

export default async function PembayaranPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const admin = createAdminClient();
  if (!admin || !/^CLC-[A-Z0-9-]{8,40}$/.test(ref)) notFound();

  const { data: order } = await admin
    .from('orders')
    .select('merchant_ref, course_slug, course_title, amount, status, checkout_url, customer_email')
    .eq('merchant_ref', ref)
    .maybeSingle();

  if (!order) notFound();

  const wa = waLink(`Halo Cece, saya mau tanya soal pesanan ${order.merchant_ref} (${order.course_title}).`);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="bg-white rounded-3xl shadow-xl border border-butter/30 p-6 sm:p-8 text-center">
        {order.status === 'PAID' ? (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-3">Pembayaran berhasil!</h1>
            <p className="text-charcoal-brown/70 leading-relaxed mb-6">
              Terima kasih sudah bergabung di <strong>{order.course_title}</strong>. Cece akan membagikan akses video
              kelas ke <strong>{order.customer_email}</strong>. Bukti pembayaran juga sudah dikirim ke email tersebut.
            </p>
          </>
        ) : order.status === 'UNPAID' ? (
          <>
            <RefreshWhileUnpaid />
            <Clock className="w-14 h-14 text-terracotta mx-auto mb-4" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-3">Menunggu pembayaran</h1>
            <p className="text-charcoal-brown/70 leading-relaxed mb-6">
              Selesaikan pembayaran untuk <strong>{order.course_title}</strong>. Kalau sudah bayar, halaman ini akan
              berubah otomatis dalam beberapa detik.
            </p>
            {order.checkout_url && (
              <Button href={order.checkout_url} size="lg" fullWidth className="mb-4">
                Lanjutkan Pembayaran
              </Button>
            )}
          </>
        ) : (
          <>
            <XCircle className="w-14 h-14 text-charcoal-brown/40 mx-auto mb-4" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-3">
              {order.status === 'EXPIRED' ? 'Waktu pembayaran habis' : order.status === 'REFUND' ? 'Pembayaran dikembalikan' : 'Pembayaran gagal'}
            </h1>
            <p className="text-charcoal-brown/70 leading-relaxed mb-6">
              Tidak ada dana yang terpotong untuk pesanan ini. Silakan coba lagi dari halaman kelas.
            </p>
            <Button href={`/kursus/${order.course_slug}`} size="lg" fullWidth className="mb-4">
              Kembali ke Kelas
            </Button>
          </>
        )}

        <div className="bg-butter/15 rounded-xl p-4 text-sm text-charcoal-brown/70 mb-4">
          <div>No. pesanan: <strong className="text-charcoal-brown">{order.merchant_ref}</strong></div>
          <div>Total: <strong className="text-charcoal-brown">{rupiah(order.amount)}</strong></div>
        </div>

        <Button href={wa} external variant="whatsapp" size="md" fullWidth>
          <WhatsAppIcon className="w-5 h-5 mr-2" /> Tanya Cece di WhatsApp
        </Button>
        <Link href="/kursus" className="block mt-4 text-sm text-terracotta hover:text-rust-ink">
          Lihat kelas lainnya →
        </Link>
      </div>
    </div>
  );
}
