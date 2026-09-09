import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, breadcrumbJsonLd } from '@/lib/seo';

const PAGE_TITLE = 'Hubungi Cece Lina Chang';
const PAGE_DESCRIPTION =
  'Tanya resep, konsultasi alat baking, atau daftar kelas online. Chat WhatsApp admin di jam kerja 09:00–17:00 atau kirim email ke halo@cecelinachang.com.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/kontak' },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/kontak`,
    type: 'website',
  },
};

const structuredData = [
  breadcrumbJsonLd([
    { name: 'Beranda', path: '/' },
    { name: 'Hubungi Saya', path: '/kontak' },
  ]),
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${SITE_URL}/kontak`,
    name: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    inLanguage: 'id-ID',
    mainEntity: { '@id': `${SITE_URL}/#organization` },
  },
];

// Kontak's page.tsx is a client component (contact form state), so its
// metadata lives in this layout — see app/tentang/layout.tsx for the same
// pattern.
export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
