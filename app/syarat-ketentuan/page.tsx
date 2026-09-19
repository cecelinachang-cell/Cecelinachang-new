import type { Metadata } from 'next';
import { POLICIES } from '@/lib/policies';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Cece Lina Chang',
  description: 'Ketentuan pemesanan, pembayaran, pengiriman, garansi, dan refund di cecelinachang.com.',
  alternates: {
    canonical: '/syarat-ketentuan',
  },
};

export default function SyaratKetentuanPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-24">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-rust-ink mb-2">Syarat &amp; Ketentuan</h1>
      <p className="text-sm text-charcoal-brown/50 mb-10">Terakhir diperbarui: September 2026</p>

      <div className="space-y-8 text-charcoal-brown/80 leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Layanan yang kami jual</h2>
          <p>
            Website ini menjual dua jenis produk: kelas baking online (produk digital) dan alat baking
            fisik dari Signora. Dengan memesan lewat website ini atau WhatsApp, kamu setuju dengan
            ketentuan di halaman ini.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Pemesanan &amp; pembayaran</h2>
          <p>
            Pemesanan diproses lewat WhatsApp setelah kamu mengisi form atau chat admin. Pembayaran
            dilakukan via transfer bank; info rekening tujuan diberikan setelah pesananmu dikonfirmasi
            di WhatsApp — kami tidak meminta detail rekening di awal chat. Akses kelas atau pengiriman
            barang diproses setelah pembayaran diterima dan dikonfirmasi.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Pengiriman</h2>
          <p>
            Alat baking fisik dikirim ke alamat yang kamu berikan lewat kurir pilihan (termasuk lewat
            Shopee untuk pesanan via marketplace). Estimasi waktu kirim tergantung lokasi dan kurir;
            biaya kirim ditanggung pembeli kecuali disebutkan lain.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Pengembalian &amp; garansi produk</h2>
          <p>{POLICIES.PRODUCT_RETURN}</p>
          <p className="mt-3">{POLICIES.PRODUCT_WARRANTY}</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Kelas digital &amp; refund</h2>
          <p>{POLICIES.COURSE_REFUND}</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Perubahan ketentuan</h2>
          <p>
            Kami bisa memperbarui halaman ini dari waktu ke waktu. Perubahan berlaku sejak dipublikasikan
            di halaman ini, jadi ada baiknya kamu cek lagi sebelum memesan.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Pertanyaan?</h2>
          <p>
            Kalau ada pertanyaan soal pesanan, pembayaran, atau ketentuan ini, hubungi kami lewat halaman{' '}
            <a href="/kontak" className="text-terracotta font-semibold hover:text-rust-ink">Kontak</a>. Untuk
            info soal data dan cookie, lihat{' '}
            <a href="/kebijakan-privasi" className="text-terracotta font-semibold hover:text-rust-ink">Kebijakan Privasi</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
