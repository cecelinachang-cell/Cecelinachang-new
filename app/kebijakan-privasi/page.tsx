import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { SITE_NAME, SITE_URL, breadcrumbJsonLd } from '@/lib/seo';

const PAGE_TITLE = 'Kebijakan Privasi';
const PAGE_DESCRIPTION =
  'Data apa yang dikumpulkan Cece Lina Chang (email, nomor WhatsApp) saat Anda mendaftar kelas atau menghubungi kami, dan bagaimana data itu digunakan.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/kebijakan-privasi' },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/kebijakan-privasi`,
    type: 'website',
  },
};

const structuredData = breadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: PAGE_TITLE, path: '/kebijakan-privasi' },
]);

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LegalPage
        title={PAGE_TITLE}
        updated="9 September 2026"
        intro="Kami hanya mengumpulkan data yang benar-benar dibutuhkan untuk memproses pendaftaran kelas, pesanan alat baking, dan konsultasi Anda. Halaman ini menjelaskan data apa yang dikumpulkan dan bagaimana kami menggunakannya."
        sections={[
          {
            heading: 'Data yang Kami Kumpulkan',
            body: [
              'Saat Anda mengisi formulir daftar kelas, checkout produk, atau menghubungi admin, kami menyimpan nama, alamat email, dan/atau nomor WhatsApp yang Anda berikan.',
              'Kami juga mencatat data penggunaan situs secara agregat (halaman yang dikunjungi, jumlah sesi) untuk memahami produk dan kelas mana yang paling diminati.',
            ],
          },
          {
            heading: 'Bagaimana Data Digunakan',
            body: [
              'Data kontak Anda digunakan untuk mengirim link akses kelas, mengonfirmasi pesanan via WhatsApp, membalas pertanyaan, dan follow-up terkait pesanan atau pendaftaran yang belum selesai.',
              'Kami tidak menjual atau menyewakan data pribadi Anda ke pihak ketiga mana pun.',
            ],
          },
          {
            heading: 'Penyimpanan Data',
            body: [
              'Data disimpan pada penyedia layanan basis data pihak ketiga (Supabase) dengan akses dibatasi hanya untuk admin toko.',
            ],
          },
          {
            heading: 'Hak Anda',
            body: [
              'Anda dapat meminta salinan atau penghapusan data pribadi Anda kapan saja dengan menghubungi halo@cecelinachang.com.',
            ],
          },
        ]}
      />
    </>
  );
}
