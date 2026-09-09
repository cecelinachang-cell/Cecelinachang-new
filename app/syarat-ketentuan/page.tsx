import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { SITE_NAME, SITE_URL, breadcrumbJsonLd } from '@/lib/seo';

const PAGE_TITLE = 'Syarat & Ketentuan';
const PAGE_DESCRIPTION =
  'Ketentuan pembelian alat baking Signora dan pendaftaran kelas online Cece Lina Chang: pembayaran, akses kelas, dan tanggung jawab pengguna.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/syarat-ketentuan' },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/syarat-ketentuan`,
    type: 'website',
  },
};

const structuredData = breadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: PAGE_TITLE, path: '/syarat-ketentuan' },
]);

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LegalPage
        title={PAGE_TITLE}
        updated="9 September 2026"
        intro="Dengan memesan produk atau mendaftar kelas melalui website ini, Anda menyetujui ketentuan berikut."
        sections={[
          {
            heading: 'Pemesanan & Pembayaran',
            body: [
              'Pemesanan produk dan pendaftaran kelas diproses via WhatsApp admin setelah Anda klik tombol "Beli" atau "Daftar". Harga yang tampil di halaman produk/kelas adalah harga final sebelum ongkos kirim (untuk produk fisik).',
              'Pembayaran dilakukan via transfer bank dan dikonfirmasi langsung oleh admin melalui WhatsApp.',
            ],
          },
          {
            heading: 'Akses Kelas Online',
            body: [
              'Setelah pembayaran dikonfirmasi, Anda menerima link akses video dan konsultasi langsung dengan Cece Lina Chang. Akses berlaku seumur hidup dan dapat ditonton ulang kapan saja.',
              'Link akses bersifat pribadi. Membagikan atau menjual ulang materi kelas kepada pihak lain tidak diizinkan.',
            ],
          },
          {
            heading: 'Produk Fisik',
            body: [
              'Alat baking yang dijual adalah produk Signora asli dengan garansi resmi distributor 1 tahun. Ketentuan pengiriman dan pengembalian dijelaskan di halaman Pengiriman dan Pengembalian Dana.',
            ],
          },
          {
            heading: 'Perubahan Ketentuan',
            body: [
              'Kami dapat memperbarui halaman ini sewaktu-waktu. Perubahan berlaku sejak tanggal publikasi di halaman ini.',
            ],
          },
        ]}
      />
    </>
  );
}
