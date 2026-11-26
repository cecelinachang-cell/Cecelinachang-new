import type { Metadata } from 'next';
import { getBundleLanding } from '@/app/data/bundle-landing';
import { CLASS_BUNDLES } from '@/lib/bundles';
import { SITE_URL } from '@/lib/links';
import { BundleLandingBody } from '@/components/landing/BundleLandingBody';

const SLUG = 'semua-kelas';

export const revalidate = 60;

export function generateMetadata(): Metadata {
  const copy = getBundleLanding(SLUG);
  const bundle = CLASS_BUNDLES.find((b) => b.key === copy?.bundleKey);
  // Ads and social only, like the other /lp pages.
  const robots = { index: false, follow: true, googleBot: { index: false, follow: true } };
  if (!copy || !bundle) return { title: 'Paket Tidak Ditemukan', robots };

  return {
    title: bundle.title,
    description: copy.what,
    robots,
    alternates: { canonical: `/lp/${SLUG}` },
    openGraph: {
      title: copy.hook,
      description: copy.what,
      url: `${SITE_URL}/lp/${SLUG}`,
      siteName: 'Cece Lina Chang',
      locale: 'id_ID',
      type: 'website',
    },
  };
}

// A static route, so it wins over /lp/[slug] (which only knows class pages).
export default function SemuaKelasLandingPage() {
  return <BundleLandingBody slug={SLUG} />;
}
