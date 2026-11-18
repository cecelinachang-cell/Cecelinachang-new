import { getLandingCopy, hasPlainPage, landingPages } from '@/app/data/landing-pages';
import { LandingBody } from '@/components/landing/LandingBody';
import { isSplitActive } from '@/lib/lpSplit';

// The plain page for women 40-60 (components/landing/PlainLandingBody.tsx).
// Preview-only: middleware.ts rewrites /lp/[slug]?lp=c here, and nobody is
// dealt this version by the split test (lib/lpSplit.ts, LP_DEALT_ARMS).
export { generateMetadata } from '../page';

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return Object.keys(landingPages)
    .filter((slug) => isSplitActive(slug) && hasPlainPage(getLandingCopy(slug)))
    .map((slug) => ({ slug }));
}

export default async function LandingArmCPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LandingBody slug={slug} arm="c" />;
}
