import type { Metadata } from 'next';
import { getCourseBySlug } from '@/lib/courses';
import { getLandingCopy, landingPages } from '@/app/data/landing-pages';
import { SITE_URL } from '@/lib/links';
import { LandingBody } from '@/components/landing/LandingBody';

export const revalidate = 60;
// Only slugs with hand-written copy in app/data/landing-pages.ts exist.
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return Object.keys(landingPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const copy = getLandingCopy(slug);
  // Ads and social only: Google traffic keeps going to /kursus/[slug].
  const robots = { index: false, follow: true, googleBot: { index: false, follow: true } };

  if (!course || !copy) {
    return { title: 'Kelas Tidak Ditemukan', robots };
  }

  const image = new URL(course.imageUrl, SITE_URL).toString();
  return {
    title: course.title,
    description: copy.subhook,
    robots,
    // Its own URL, not the homepage canonical inherited from the root layout.
    alternates: { canonical: `/lp/${slug}` },
    openGraph: {
      title: copy.hook,
      description: copy.subhook,
      url: `${SITE_URL}/lp/${slug}`,
      siteName: 'Cece Lina Chang',
      images: [{ url: image, width: 1200, height: 630, alt: course.title }],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: copy.hook, description: copy.subhook, images: [image] },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LandingBody slug={slug} />;
}
