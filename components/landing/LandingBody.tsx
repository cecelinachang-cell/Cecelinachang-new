import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/lib/courses';
import { getLandingCopy } from '@/app/data/landing-pages';
import { products } from '@/app/data/products';
import { POLICIES } from '@/lib/policies';
import { parseIdr } from '@/lib/pixels';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingHeroB } from '@/components/landing/LandingHeroB';
import { LpArmTracker } from '@/components/landing/LpArmTracker';
import { isSplitActive, type LpArm } from '@/lib/lpSplit';
import { MateriSection } from '@/components/landing/MateriSection';
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
import { PayNowCta } from '@/components/landing/PayNowCta';
import { WhatsAppAsk } from '@/components/landing/WhatsAppAsk';
import { StudentProof } from '@/components/landing/StudentProof';
import { QuizQuote } from '@/components/landing/QuizQuote';
import { quizIntroText } from '@/lib/quizCopy';
import { ViewContentPing } from '@/components/ViewContentPing';
import { ScrollDepthPing } from '@/components/landing/ScrollDepthPing';

/**
 * The whole /lp/[slug] page. `variantKey` picks the ad-matched headline
 * (copy.adVariants); middleware.ts sends ad traffic to /lp/[slug]/v/[key].
 * `arm` is the first-screen split test (lib/lpSplit.ts): only the hero
 * differs between A and B. Pages in the test default to A.
 */
export async function LandingBody({ slug, variantKey, arm: armProp }: { slug: string; variantKey?: string; arm?: LpArm }) {
  const course = await getCourseBySlug(slug);
  const copy = getLandingCopy(slug);

  if (!course || !copy) {
    notFound();
  }

  const variant = variantKey ? copy.adVariants?.find((v) => v.key === variantKey) : undefined;
  if (variantKey && !variant) {
    notFound();
  }
  const arm: LpArm | undefined = armProp ?? (isSplitActive(slug) ? 'a' : undefined);
  const hook = variant?.hook ?? copy.hook;
  const subhook = variant?.subhook ?? copy.subhook;

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
      <ScrollDepthPing contentId={course.slug} />
      {arm && <LpArmTracker arm={arm} contentId={course.slug} />}
      {arm === 'b' ? (
        <LandingHeroB
          hook={hook}
          subhook={subhook}
          trustLine={copy.heroTrustLine}
          students={course.students}
          courseTitle={course.title}
          videoId={copy.previewVideoId}
          video={copy.previewVideo}
          courseSlug={course.slug}
          price={course.price}
          included={copy.offerIncludes}
          testimonial={copy.heroTestimonial}
          nextStep={copy.heroNext}
          steps={copy.heroSteps}
          stepsHelp={copy.heroStepsHelp}
        />
      ) : (
      <LandingHero
        hook={hook}
        subhook={subhook}
        proofPoints={copy.proofPoints}
        students={course.students}
        imageUrl={course.imageUrl}
        courseTitle={course.title}
        videoId={copy.previewVideoId}
        video={copy.previewVideo}
        courseSlug={course.slug}
        price={course.price}
        included={copy.offerIncludes}
        nextStep={copy.heroNext}
        steps={copy.heroSteps}
        stepsHelp={copy.heroStepsHelp}
        quote={copy.quizQuote}
      />
      )}
      <MateriSection
        title={copy.materiTitle}
        items={course.benefits || []}
        whyTitle={copy.whyTitle}
        why={copy.why}
        price={course.price}
        courseSlug={course.slug}
        courseTitle={course.title}
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
        students={course.students}
        courseSlug={course.slug}
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
        cta={<PayNowCta courseSlug={course.slug} courseTitle={course.title} price={course.price} className="mt-8 w-full sm:w-auto" />}
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
          <PayNowCta courseSlug={course.slug} courseTitle={course.title} price={course.price} className="w-full sm:w-auto" />
          <WhatsAppAsk courseSlug={course.slug} courseTitle={course.title} price={course.price} className="w-full sm:w-auto" />
        </div>
      </div>
      <LandingFooter />
      <StickyQuizBar price={course.price} courseSlug={course.slug} courseTitle={course.title} />
    </div>
  );
}
