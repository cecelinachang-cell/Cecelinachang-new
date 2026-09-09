import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { SITE_NAME, SITE_URL, breadcrumbJsonLd } from '@/lib/seo';

const PAGE_TITLE = 'Kebijakan Pengiriman';
const PAGE_DESCRIPTION =
  'Wilayah pengiriman, pengemasan, dan estimasi waktu kirim alat baking Signora dari toko Cece Lina Chang.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/pengiriman' },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/pengiriman`,
    type: 'website',
  },
};

const structuredData = breadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: PAGE_TITLE, path: '/pengiriman' },
]);

export default function ShippingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LegalPage
        title={PAGE_TITLE}
        updated="9 September 2026"
        intro="Toko kami berbasis di Jakarta Barat dan hanya melayani pengiriman online ke seluruh Indonesia."
        sections={[
          {
            heading: 'Wilayah & Kurir',
            body: [
              'Kami mengirim ke seluruh kota di Indonesia menggunakan jasa kurir pihak ketiga. Ongkos kirim dihitung berdasarkan berat dan tujuan, dikonfirmasi oleh admin sebelum pembayaran.',
            ],
          },
          {
            heading: 'Pengemasan',
            body: [
              'Setiap alat baking dikemas dengan bubble wrap tebal dan kardus khusus agar loyang dan peralatan lain sampai dengan aman tanpa penyok.',
            ],
          },
          {
            heading: 'Estimasi Waktu Kirim',
            body: [
              'Pesanan diproses 1–2 hari kerja setelah pembayaran dikonfirmasi. Estimasi tiba mengikuti jadwal kurir yang dipilih dan dapat dicek langsung via admin WhatsApp.',
            ],
          },
        ]}
      />
    </>
  );
}
