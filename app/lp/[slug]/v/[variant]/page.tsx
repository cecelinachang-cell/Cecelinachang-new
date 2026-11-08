import { landingPages } from '@/app/data/landing-pages';
import { LandingBody } from '@/components/landing/LandingBody';

// Same page as /lp/[slug] with the headline of the ad the visitor came from
// (copy.adVariants). Visitors never see this URL: middleware.ts rewrites
// /lp/[slug]?utm_content=<ad name> here, so the address bar, the ad tags and
// the canonical stay on /lp/[slug].
export { generateMetadata } from '../../page';

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams(): { slug: string; variant: string }[] {
  return Object.entries(landingPages).flatMap(([slug, copy]) =>
    (copy.adVariants ?? []).map((v) => ({ slug, variant: v.key }))
  );
}

export default async function LandingVariantPage({ params }: { params: Promise<{ slug: string; variant: string }> }) {
  const { slug, variant } = await params;
  return <LandingBody slug={slug} variantKey={variant} />;
}
