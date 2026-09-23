import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/lib/courses';
import { getLandingCopy, landingPages } from '@/app/data/landing-pages';
import { products } from '@/app/data/products';
import { POLICIES } from '@/lib/policies';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';
import { LandingHero } from '@/components/landing/LandingHero';
import { PainSection } from '@/components/landing/PainSection';
import { RootCauseSection } from '@/components/landing/RootCauseSection';
import { FactoryStorySection } from '@/components/landing/FactoryStorySection';
import { TransformationSection } from '@/components/landing/TransformationSection';
import { EquipmentSection } from '@/components/landing/EquipmentSection';
import { OfferStack } from '@/components/landing/OfferStack';
import { CommitmentQuiz } from '@/components/landing/CommitmentQuiz';
import { LandingFaq } from '@/components/landing/LandingFaq';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { StickyQuizBar } from '@/components/landing/StickyQuizBar';
import { QuizCta } from '@/components/landing/QuizCta';

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

  const image = absoluteUrl(course.imageUrl);
  return {
    title: course.title,
    description: copy.subhook,
    robots,
    openGraph: {
      title: copy.hook,
      description: copy.subhook,
      url: `${SITE_URL}/lp/${slug}`,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: course.title }],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: copy.hook, description: copy.subhook, images: [image] },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const copy = getLandingCopy(slug);

  if (!course || !copy) {
    notFound();
  }

  const recommended = products.find((p) => p.id === copy.equipment.recommendedProductId);
  const faq = [
    ...copy.faq,
    { question: 'Kalau sudah bayar, bisa refund?', answer: POLICIES.COURSE_REFUND },
  ];

  return (
    <div className="pb-24 lg:pb-0">
      <LandingHero
        hook={copy.hook}
        subhook={copy.subhook}
        ctaLabel={copy.ctaLabel}
        proofPoints={copy.proofPoints}
        students={course.students}
        imageUrl={course.imageUrl}
        courseTitle={course.title}
        videoId={copy.previewVideoId}
        courseSlug={course.slug}
      />
      <PainSection title={copy.painTitle} pains={copy.pains} close={copy.painClose} />
      <RootCauseSection
        title={copy.rootCauseTitle}
        intro={copy.rootCauseIntro}
        causes={copy.rootCauses}
        line={copy.rootCauseLine}
        ctaLabel={copy.ctaLabel}
      />
      <FactoryStorySection title={copy.story.title} paragraphs={copy.story.paragraphs} note={copy.story.note} />
      <TransformationSection
        beforeAfter={copy.beforeAfter}
        benefits={course.benefits || []}
        benefitsNote={copy.benefitsNote}
        studentResults={copy.studentResults}
        students={course.students}
      />
      <EquipmentSection
        title={copy.equipment.title}
        answer={copy.equipment.answer}
        body={copy.equipment.body}
        product={recommended}
      />
      <OfferStack
        courseTitle={course.title}
        price={course.price}
        includes={copy.offerIncludes}
        valueLine={copy.offerValueLine}
        riskLine={copy.offerRiskLine}
        ctaLabel={copy.ctaLabel}
      />
      <CommitmentQuiz
        courseSlug={course.slug}
        courseTitle={course.title}
        coursePrice={course.price}
        intro={copy.quizIntro}
        questions={copy.quiz}
        resultNoPain={copy.resultNoPain}
      />
      <LandingFaq items={faq} />
      <div className="px-4 pb-14 sm:px-6">
        <div className="mx-auto max-w-3xl">
        <QuizCta label={copy.ctaLabel} className="w-full sm:w-auto" />
        </div>
      </div>
      <LandingFooter />
      <StickyQuizBar label="Cek kecocokanmu" price={course.price} />
    </div>
  );
}
