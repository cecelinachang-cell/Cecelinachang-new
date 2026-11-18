import { Check } from 'lucide-react';
import type { Course } from '@/lib/courses';
import type { LandingCopy, PlainCopy } from '@/app/data/landing-pages';
import { POLICIES } from '@/lib/policies';
import { parseIdr } from '@/lib/pixels';
import { showStudents } from '@/lib/course-stats';
import { ViewContentPing } from '@/components/ViewContentPing';
import { LandingFooter } from './LandingFooter';
import { LpArmTracker } from './LpArmTracker';
import { PayNowCta } from './PayNowCta';
import { ScrollDepthPing } from './ScrollDepthPing';
import { SelfHostedPreview } from './SelfHostedPreview';
import { StickyQuizBar } from './StickyQuizBar';
import { StudentProof } from './StudentProof';
import { WhatsAppAsk } from './WhatsAppAsk';
import { YouTubePreview } from './YouTubePreview';

// Same red apron band as LandingHero and LandingHeroB.
const apronStripes = {
  backgroundColor: 'var(--color-sambal)',
  backgroundImage:
    'repeating-linear-gradient(90deg, transparent 0 14px, rgba(255,255,255,0.08) 14px 16px)',
};

const h2 = 'font-display text-[1.625rem] font-extrabold leading-tight tracking-[-0.015em] sm:text-3xl';
const waLink =
  'w-full border-0 bg-transparent px-1 text-lg text-seledri underline decoration-seledri/40 underline-offset-4 hover:bg-transparent sm:w-auto';

interface PlainLandingBodyProps {
  course: Course;
  copy: LandingCopy & { plain: PlainCopy };
  /** Already resolved for the ad the visitor came from (copy.adVariants). */
  hook: string;
}

/**
 * Arm C of the /lp/[slug] split test (lib/lpSplit.ts): the whole
 * page rewritten for women 40-60 on a phone, who have just watched Cece's
 * video ad.
 *
 * Why it exists (Meta pixel, 14-18 Nov 2026): about 1 visitor in 3 scrolls
 * past the first quarter of the long page, 7% play the video, and 3 in 4 of
 * those who tap "Bayar Sekarang" leave the Lynk form without sending it. So
 * this page is about a third of the length, and its first screen says in
 * plain large text what the class is, what it costs and what the form will
 * ask. No handwriting font, no quiz, no accordion: nothing to work out.
 *
 * Tracking is the same as the other arms (ViewContent, LP_Scroll*,
 * LP_View_C / LP_Checkout_C, InitiateCheckout, Contact).
 */
export function PlainLandingBody({ course, copy, hook }: PlainLandingBodyProps) {
  const { plain } = copy;
  const cta = { courseSlug: course.slug, courseTitle: course.title, price: course.price };
  const faq = [
    ...plain.faqQuestions.flatMap((q) => copy.faq.filter((item) => item.question === q)),
    { question: 'Kalau sudah bayar, bisa refund?', answer: POLICIES.COURSE_REFUND },
  ];
  const benefits = course.benefits ?? [];

  return (
    <div data-lp-plain>
      <ViewContentPing
        contentId={course.slug}
        contentName={course.title}
        contentType="course"
        value={parseIdr(course.price)}
      />
      <ScrollDepthPing contentId={course.slug} />
      <LpArmTracker arm="c" contentId={course.slug} />

      <section id="lp-hero">
        <div style={apronStripes} className="px-4 pb-7 pt-6 text-white sm:px-6 sm:pb-10 sm:pt-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-[2.05rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-balance sm:text-5xl sm:leading-[1.08]">
              {hook}
            </h1>
            <p className="mt-4 max-w-[36ch] text-xl font-medium leading-snug">{plain.what}</p>
            {showStudents(course.students) && (
              <p className="mt-3 text-lg font-bold">{course.students.toLocaleString('id-ID')} murid sudah ikut kelas ini</p>
            )}
          </div>
        </div>

        <div className="px-4 pt-6 sm:px-6 sm:pt-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-xl leading-snug">
              <strong className="font-display text-[1.75rem] font-extrabold tracking-[-0.02em]">{course.price}</strong>
              <span className="ml-2">{plain.priceNote}</span>
            </p>
            <PayNowCta {...cta} className="mt-4 min-h-16 w-full text-lg sm:w-auto sm:text-xl" />
            <WhatsAppAsk {...cta} label="Tanya Cece dulu lewat WhatsApp" className={`mt-3 ${waLink}`} />

            {copy.heroTestimonial && (
              <figure className="mt-7 border-y border-steel-line py-5">
                <blockquote className="max-w-[38ch] text-xl leading-relaxed">“{copy.heroTestimonial.text}”</blockquote>
                <figcaption className="mt-2 text-lg text-steel">{copy.heroTestimonial.source}</figcaption>
              </figure>
            )}

            <h2 className={`mt-9 ${h2}`}>Cara daftar</h2>
            <ol className="mt-4 max-w-[44ch] space-y-4">
              {plain.steps.map((step, i) => (
                <li key={step} className="flex gap-4 text-lg leading-relaxed">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kecap font-display text-lg font-extrabold text-white"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {copy.heroStepsHelp && <p className="mt-5 max-w-[44ch] text-lg leading-relaxed">{copy.heroStepsHelp}</p>}
          </div>
        </div>
      </section>

      <StudentProof testimonials={copy.testimonials} />

      <section className="px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>Yang kamu dapat</h2>
          <ul className="mt-4 space-y-3">
            {copy.offerIncludes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-lg leading-snug">
                <Check className="mt-0.5 h-6 w-6 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {benefits.length > 0 && (
            <>
              <h2 className={`mt-12 ${h2}`}>Yang diajarkan di video</h2>
              <ul className="mt-4 max-w-[44ch] list-disc space-y-3 pl-6 text-lg leading-relaxed marker:text-sambal">
                {benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {(copy.previewVideo || copy.previewVideoId) && (
        <section className="px-4 pb-12 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className={h2}>Kenalan dulu sama Cece</h2>
            {copy.heroTrustLine && <p className="mb-5 mt-3 max-w-[44ch] text-lg leading-relaxed">{copy.heroTrustLine}</p>}
            {copy.previewVideo ? (
              <SelfHostedPreview video={copy.previewVideo} title={`Cuplikan ${course.title}`} courseSlug={course.slug} />
            ) : copy.previewVideoId ? (
              <YouTubePreview videoId={copy.previewVideoId} title={`Cuplikan ${course.title}`} courseSlug={course.slug} />
            ) : null}
          </div>
        </section>
      )}

      <section className="px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>Pertanyaan yang sering masuk</h2>
          <dl className="mt-2 divide-y divide-steel-line">
            {faq.map((item) => (
              <div key={item.question} className="py-5">
                <dt className="text-lg font-bold leading-snug">{item.question}</dt>
                <dd className="mt-2 max-w-[46ch] text-lg leading-relaxed">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* data-sticky-hide: the sticky bar steps aside while this button is on screen. */}
      <section data-sticky-hide className="border-t border-steel-line bg-white px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>{course.title}</h2>
          <p className="mt-3 text-xl leading-snug">
            <strong className="font-display text-[1.75rem] font-extrabold tracking-[-0.02em]">{course.price}</strong>
            <span className="ml-2">{plain.priceNote}</span>
          </p>
          <PayNowCta {...cta} className="mt-4 min-h-16 w-full text-lg sm:w-auto sm:text-xl" />
          <WhatsAppAsk {...cta} label="Tanya Cece dulu lewat WhatsApp" className={`mt-3 ${waLink}`} />
        </div>
      </section>

      <LandingFooter />
      <StickyQuizBar {...cta} />
    </div>
  );
}
