import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, breadcrumbJsonLd } from '@/lib/seo';

const PAGE_TITLE = 'Tentang Cece Lina Chang';
const PAGE_DESCRIPTION =
  'Cerita di balik kelas baking Cece Lina Chang: 28 tahun mengelola pabrik bakso sapi sejak 1998, kini berbagi resep dan teknik anti gagal untuk pemula.';

// The About page is a client component (animation + live image asset), so its
// metadata lives in this layout.
export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/tentang' },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/tentang`,
    type: 'profile',
  },
};

const structuredData = [
  breadcrumbJsonLd([
    { name: 'Beranda', path: '/' },
    { name: PAGE_TITLE, path: '/tentang' },
  ]),
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${SITE_URL}/tentang`,
    name: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    inLanguage: 'id-ID',
    mainEntity: {
      '@type': 'Person',
      name: 'Cece Lina Chang',
      jobTitle: 'Pengajar baking',
      url: `${SITE_URL}/tentang`,
      worksFor: { '@id': `${SITE_URL}/#organization` },
      sameAs: ['https://instagram.com/cecelinachang', 'https://tiktok.com/@lina_chang2'],
    },
  },
];

export default function TentangLayout({ children }: { children: React.ReactNode }) {
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
