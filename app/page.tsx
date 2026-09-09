import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

const title = 'Belajar Baking Anti Gagal dari Rumah';
const description =
  'Kelas baking online dan alat masak Signora pilihan Cece Lina Chang. Resep teruji, video langkah demi langkah, dan pendampingan sampai Anda berhasil.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: SITE_URL,
    type: 'website',
  },
};

// WebPage node for the homepage, tied to the site-wide graph declared in the
// root layout so Google can connect the page to the publisher.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: `${title} | ${SITE_NAME}`,
  description,
  inLanguage: 'id-ID',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  primaryImageOfPage: absoluteUrl('/images/meat-pie.png'),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
