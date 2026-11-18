import { hasPlainPage, landingPages } from '@/app/data/landing-pages';
import { LandingBody } from '@/components/landing/LandingBody';
import { isSplitActive } from '@/lib/lpSplit';

// The plain page (arm C) with the ad-matched headline (copy.adVariants).
// Visitors never see this URL: middleware.ts rewrites /lp/[slug] here.
export { generateMetadata } from '../../../page';

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams(): { slug: string; variant: string }[] {
  return Object.entries(landingPages)
    .filter(([slug, copy]) => isSplitActive(slug) && hasPlainPage(copy))
    .flatMap(([slug, copy]) => (copy.adVariants ?? []).map((v) => ({ slug, variant: v.key })));
}

export default async function LandingArmCVariantPage({ params }: { params: Promise<{ slug: string; variant: string }> }) {
  const { slug, variant } = await params;
  return <LandingBody slug={slug} variantKey={variant} arm="c" />;
}
