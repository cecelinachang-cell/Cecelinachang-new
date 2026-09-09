import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { SITE_NAME, SITE_URL, breadcrumbJsonLd } from '@/lib/seo';
import { POLICIES } from '@/lib/policies';

const PAGE_TITLE = 'Kebijakan Pengembalian Dana';
const PAGE_DESCRIPTION =
  'Kapan produk Signora bisa diganti dan bagaimana ketentuan refund kelas baking online Cece Lina Chang.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/pengembalian-dana' },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/pengembalian-dana`,
    type: 'website',
  },
};

const structuredData = breadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: PAGE_TITLE, path: '/pengembalian-dana' },
]);

export default function RefundPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LegalPage
        title={PAGE_TITLE}
        updated="9 September 2026"
        intro="Ketentuan penggantian dan refund berbeda untuk produk fisik (alat baking Signora) dan kelas online (produk digital)."
        sections={[
          {
            heading: 'Alat Baking Signora',
            body: [POLICIES.PRODUCT_RETURN, POLICIES.PRODUCT_WARRANTY],
          },
          {
            heading: 'Kelas Baking Online',
            body: [POLICIES.COURSE_REFUND],
          },
          {
            heading: 'Cara Melaporkan',
            body: [
              'Hubungi admin via WhatsApp atau email halo@cecelinachang.com disertai foto/video bukti dan nomor pesanan. Kami akan proses penggantian setelah verifikasi.',
            ],
          },
        ]}
      />
    </>
  );
}
