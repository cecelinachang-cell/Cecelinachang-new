import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/lib/courses';
import { getLandingCopy, landingPages } from '@/app/data/landing-pages';
import { products } from '@/app/data/products';
import { POLICIES } from '@/lib/policies';
import { parseIdr } from '@/lib/pixels';
import { SITE_URL } from '@/lib/links';
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
import { WhatsAppAsk } from '@/components/landing/WhatsAppAsk';
import { StudentProof } from '@/components/landing/StudentProof';
import { QuizQuote } from '@/components/landing/QuizQuote';
import { quizIntroText } from '@/lib/quizCopy';
import { ViewContentPing } from '@/components/ViewContentPing';

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
  const course = await getCourseBySlug(slug);
  const copy = getLandingCopy(slug);

  if (!course || !copy) {
    notFound();
  }

  const recommended = products.find((p) => p.id === copy.equipment.recommendedProductId);
  const nearQuizFaq = copy.faq.filter((item) => item.nearQuiz);
  const faq = [
    ...copy.faq.filter((item) => !item.nearQuiz),
    { question: 'Kalau sudah bayar, bisa refund?', answer: POLICIES.COURSE_REFUND },
  ];

  return (
    <div>
      {/* Meta/TikTok ViewContent. The pixel scripts themselves load once in
          the root layout (components/Pixels.tsx) and fire PageView; this is
          the content-level event ads need to build an audience of people who
          actually read the landing page. Lead + Contact fire from the quiz,
          Contact also from the direct WhatsApp buttons. */}
      <ViewContentPing
        contentId={course.slug}
        contentName={course.title}
        contentType="course"
        value={parseIdr(course.price)}
      />
      <LandingHero
        hook={copy.hook}
        subhook={copy.subhook}
        proofPoints={copy.proofPoints}
        students={course.students}
        imageUrl={course.imageUrl}
        courseTitle={course.title}
        videoId={copy.previewVideoId}
        courseSlug={course.slug}
        price={course.price}
      />
      {/* Offer and quiz sit right after the pain and the proof: ad traffic
          reads two or three screens, and at the bottom of the long version
          the quiz got 1 start from ~1,400 visits. The deeper sections follow
          for anyone who wants more before deciding. */}
      <PainSection title={copy.painTitle} pains={copy.pains} close={copy.painClose} />
      <StudentProof testimonials={copy.testimonials} />
      <OfferStack
        courseTitle={course.title}
        price={course.price}
        includes={copy.offerIncludes}
        valueLine={copy.offerValueLine}
        riskLine={copy.offerRiskLine}
        ctaLabel={copy.ctaLabel}
      />
      {copy.quizQuote && <QuizQuote text={copy.quizQuote.text} source={copy.quizQuote.source} />}
      <LandingFaq items={nearQuizFaq} title="Masih ragu?" className="pb-14 sm:pb-20" />
      <CommitmentQuiz
        courseSlug={course.slug}
        courseTitle={course.title}
        coursePrice={course.price}
        intro={quizIntroText(copy.quizIntro, copy.quiz, course.price)}
        questions={copy.quiz}
        resultNoPain={copy.resultNoPain}
        onlineSummary={copy.offerIncludes.slice(0, 2).join(', ')}
        offlineClass={copy.offlineClass}
      />
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
      <LandingFaq items={faq} />
      <div className="px-4 pb-14 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
          <QuizCta href="#daftar" label={`Daftar kelasnya · ${course.price}`} className="w-full sm:w-auto" />
          <WhatsAppAsk courseSlug={course.slug} courseTitle={course.title} price={course.price} className="w-full sm:w-auto" />
        </div>
      </div>
      <LandingFooter />
      <StickyQuizBar label="Daftar sekarang" price={course.price} courseSlug={course.slug} courseTitle={course.title} />
    </div>
  );
}
