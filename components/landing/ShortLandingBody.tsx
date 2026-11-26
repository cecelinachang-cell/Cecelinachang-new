import { Fragment } from 'react';
import Image from 'next/image';
import { Check, MessageCircle } from 'lucide-react';
import type { Course } from '@/lib/courses';
import type { ShortLandingCopy } from '@/app/data/landing-pages';
import type { ClassBundleView } from '@/lib/bundles';
import { POLICIES } from '@/lib/policies';
import { parseIdr } from '@/lib/pixels';
import { showStudents } from '@/lib/course-stats';
import { Marginalia } from '@/components/Marginalia';
import { ViewContentPing } from '@/components/ViewContentPing';
import { BundleUpsell } from './BundleUpsell';
import { LandingHero } from './LandingHero';
import { LandingFaq } from './LandingFaq';
import { LandingFooter } from './LandingFooter';
import { PayNowCta } from './PayNowCta';
import { ScrollDepthPing } from './ScrollDepthPing';
import { StickyQuizBar } from './StickyQuizBar';
import { WhatsAppAsk } from './WhatsAppAsk';

/** Shows each "[CEK]" (text still waiting for the owner's answer) as a yellow marker. */
function Cek({ text }: { text: string }) {
  const parts = text.split('[CEK]');
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <mark className="rounded bg-mie px-1 font-bold text-kecap">[CEK]</mark>}
          {part}
        </Fragment>
      ))}
    </>
  );
}

/** "799.000" or "Rp 799.000" → "Rp 799.000". */
function rupiah(value: string): string {
  return /^rp/i.test(value.trim()) ? value.trim() : `Rp ${value.trim()}`;
}

interface ShortLandingBodyProps {
  course: Course;
  copy: ShortLandingCopy;
  /** Already resolved for the ad the visitor came from (copy.adVariants). */
  hook: string;
  subhook: string;
  /** The bundle named by copy.bundleKey, already built from the live catalog. */
  bundle?: ClassBundleView;
}

/**
 * The short /lp/[slug] page (copy.layout === 'short'): price and button on
 * the first screen, student photos straight after, then Cece's tips, what's
 * in the class, the tools, the price card, an optional bundle box and a short
 * FAQ. Same tracking as
 * the long page: ViewContent, LP_Scroll*, InitiateCheckout on "Bayar
 * Sekarang" (with the ad's utm tags carried to Lynk) and Contact on "Tanya
 * Cece", all keyed on the course slug.
 */
export function ShortLandingBody({ course, copy, hook, subhook, bundle }: ShortLandingBodyProps) {
  const cta = { courseSlug: course.slug, courseTitle: course.title, price: course.price };
  // Same refund answer the long page adds to its FAQ; never next to a buy button.
  const faq = [...copy.faq, { question: 'Kalau sudah bayar, bisa refund?', answer: POLICIES.COURSE_REFUND }];

  return (
    <div>
      <ViewContentPing
        contentId={course.slug}
        contentName={course.title}
        contentType="course"
        value={parseIdr(course.price)}
      />
      <ScrollDepthPing contentId={course.slug} />

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
        quote={copy.heroQuote}
      />

      {/* Student photos first: the result is what the ad promised. */}
      {copy.testimonials.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-2 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">{copy.proofTitle}</h2>
            <p className="mb-6 text-lg leading-relaxed text-kecap/75">{copy.proofIntro}</p>
          </div>
          <ul className="mx-auto grid max-w-3xl items-start gap-5 px-4 sm:grid-cols-3 sm:px-6">
            {copy.testimonials.map((t) => (
              <li key={t.src} className="mx-auto w-full max-w-sm sm:max-w-none">
                <figure className="overflow-hidden rounded-2xl border border-steel-line bg-[#EFE7DC] shadow-[0_12px_28px_-18px_rgba(34,26,23,0.5)]">
                  <Image
                    src={t.src}
                    alt={t.alt}
                    width={t.width}
                    height={t.height}
                    sizes="(max-width: 640px) 92vw, 240px"
                    className="h-auto w-full"
                  />
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">{copy.tips.title}</h2>
          <p className="mb-8 text-lg leading-relaxed text-kecap/75">{copy.tips.intro}</p>
          <ol className="space-y-6">
            {copy.tips.items.map((tip, i) => (
              <li key={tip.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kecap font-display text-lg font-extrabold text-white">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="mb-1 font-display text-xl font-bold leading-snug">{tip.title}</h3>
                  <p className="leading-relaxed text-kecap/75">{tip.body}</p>
                </div>
              </li>
            ))}
          </ol>
          {copy.tips.quote && (
            <Marginalia rotate={-2} className="mt-8 text-rust-ink">
              “{copy.tips.quote}” — Cece
            </Marginalia>
          )}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] bg-mie/25 px-5 py-7 sm:px-8 sm:py-10">
          <h2 className="mb-6 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.02em]">{copy.materiTitle}</h2>
          <ol className="space-y-5">
            {(course.benefits ?? []).map((item, i) => (
              <li key={item} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kecap font-display text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 text-lg leading-snug">{item.replace(/\s+/g, ' ')}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 border-t border-kecap/15 pt-6">
            <h3 className="mb-3 font-display text-xl font-extrabold">{copy.whyTitle}</h3>
            <ul className="space-y-2.5 text-base leading-relaxed text-kecap/80">
              {copy.why.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">{copy.tools.title}</h2>
          <p className="mb-6 text-lg leading-relaxed text-kecap/75">
            <Cek text={copy.tools.intro} />
          </p>
          <ul className="divide-y divide-steel-line overflow-hidden rounded-2xl border border-steel-line bg-enamel">
            {copy.tools.items.map((tool) => (
              <li key={tool.name} className="px-4 py-4 sm:px-5">
                <p className="font-bold leading-snug">
                  <Cek text={tool.name} />
                </p>
                <p className="mt-1 leading-relaxed text-kecap/75">
                  <Cek text={tool.note} />
                </p>
              </li>
            ))}
          </ul>
          {copy.tools.note && (
            <p className="mt-4 leading-relaxed text-kecap/75">
              <Cek text={copy.tools.note} />
            </p>
          )}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-steel-line bg-white shadow-[0_24px_48px_-28px_rgba(34,26,23,0.45)]">
          <div className="bg-kecap px-6 py-5 text-white sm:px-8">
            <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{course.title}</h2>
          </div>
          <div className="p-6 sm:p-8">
            <ul className="mb-7 space-y-3">
              {copy.offerIncludes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg leading-snug">
                  <Check className="mt-0.5 h-6 w-6 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mb-6 border-t border-dashed border-steel-line pt-5">
              {showStudents(course.students) && (
                <Marginalia rotate={-1} className="mb-2 text-rust-ink">
                  {course.students.toLocaleString('id-ID')} murid sudah belajar
                </Marginalia>
              )}
              {/* Only a price the class was really sold at (lib/courses originalPrice). */}
              {course.originalPrice && (
                <p className="text-kecap/70">
                  Harga sebelumnya <s>{rupiah(course.originalPrice)}</s>
                </p>
              )}
              <p className="font-display text-4xl font-extrabold tracking-[-0.02em]">{course.price}</p>
            </div>
            <PayNowCta {...cta} className="w-full" />
            <WhatsAppAsk {...cta} className="mt-3 w-full" />
            <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-kecap/70">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-seledri" aria-hidden="true" />
              <span>{copy.offerRiskLine}</span>
            </p>
          </div>
        </div>
      </section>

      {bundle && <BundleUpsell bundle={bundle} courseTitle={course.title} />}

      <LandingFaq items={faq} className="pb-10 pt-4 sm:pb-14" />
      <div className="px-4 pb-14 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
          <PayNowCta {...cta} className="w-full sm:w-auto" />
          <WhatsAppAsk {...cta} className="w-full sm:w-auto" />
        </div>
      </div>
      <LandingFooter />
      <StickyQuizBar {...cta} />
    </div>
  );
}
