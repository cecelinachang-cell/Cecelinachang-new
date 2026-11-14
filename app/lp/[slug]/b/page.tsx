import { landingPages } from '@/app/data/landing-pages';
import { LandingBody } from '@/components/landing/LandingBody';
import { isSplitActive } from '@/lib/lpSplit';

// Arm B of the first-screen split test (lib/lpSplit.ts). Visitors never see
// this URL: middleware.ts rewrites /lp/[slug] here for half of them.
export { generateMetadata } from '../page';

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return Object.keys(landingPages)
    .filter(isSplitActive)
    .map((slug) => ({ slug }));
}

export default async function LandingArmBPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LandingBody slug={slug} arm="b" />;
}
