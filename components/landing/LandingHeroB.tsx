import { Check } from 'lucide-react';
import { PayNowCta } from './PayNowCta';
import { YouTubePreview } from './YouTubePreview';
import { SelfHostedPreview, type PreviewVideo } from './SelfHostedPreview';
import { WhatsAppAsk } from './WhatsAppAsk';
import { showStudents } from '@/lib/course-stats';

interface LandingHeroBProps {
  hook: string;
  subhook: string;
  /** Who teaches it, in one line under the headline. */
  trustLine?: string;
  students: number;
  courseTitle: string;
  videoId?: string;
  video?: PreviewVideo;
  courseSlug: string;
  price: string;
  included: string[];
  /** Short verbatim student quote shown right under the button. */
  testimonial?: { text: string; source: string };
  nextStep: string;
  steps?: string[];
  stepsHelp?: string;
}

// Same red apron band as LandingHero.
const apronStripes = {
  backgroundColor: 'var(--color-sambal)',
  backgroundImage:
    'repeating-linear-gradient(90deg, transparent 0 14px, rgba(255,255,255,0.08) 14px 16px)',
};

/**
 * Arm B of the first-screen split test (lib/lpSplit.ts). Built for women
 * 40-65 arriving from a video ad they have just watched: who teaches it,
 * the buy button, one student's words and what's included come first, in
 * plain large text (no handwriting font); the video moves below.
 */
export function LandingHeroB({ hook, subhook, trustLine, students, courseTitle, videoId, video, courseSlug, price, included, testimonial, nextStep, steps, stepsHelp }: LandingHeroBProps) {
  return (
    <section id="lp-hero">
      <div style={apronStripes} className="px-4 pb-6 pt-5 text-white sm:px-6 sm:pb-8 sm:pt-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="max-w-[20rem] font-display text-[2.05rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-balance sm:max-w-[34rem] sm:text-5xl sm:leading-[1.08]">
            {hook}
          </h1>
          {trustLine && <p className="mt-3 max-w-[36ch] text-lg font-semibold leading-snug text-white">{trustLine}</p>}
          {showStudents(students) && (
            <p className="mt-2 text-lg font-bold text-mie">{students.toLocaleString('id-ID')} murid sudah ikut kelas ini</p>
          )}
        </div>
      </div>

      <div className="px-4 pt-5 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <PayNowCta courseSlug={courseSlug} courseTitle={courseTitle} price={price} className="w-full sm:w-auto" />
          <WhatsAppAsk
            courseSlug={courseSlug}
            courseTitle={courseTitle}
            price={price}
            className="mt-3 w-full border-0 bg-transparent px-1 text-lg text-seledri underline decoration-seledri/40 underline-offset-4 sm:w-auto"
          />

          {testimonial && (
            <figure className="mt-6 max-w-[42ch] border-l-4 border-mie pl-4">
              <blockquote className="text-lg leading-relaxed text-kecap">“{testimonial.text}”</blockquote>
              <figcaption className="mt-1 text-base text-kecap/75">{testimonial.source}</figcaption>
            </figure>
          )}

          <div className="mt-6 max-w-[42ch] rounded-2xl border border-steel-line bg-white p-5">
            <p className="font-display text-xl font-extrabold text-kecap">Yang kamu dapat</p>
            <ul className="mt-3 space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg leading-snug text-kecap">
                  <Check className="mt-0.5 h-6 w-6 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            {video ? (
              <SelfHostedPreview video={video} title={`Cuplikan ${courseTitle}`} courseSlug={courseSlug} />
            ) : videoId ? (
              <YouTubePreview videoId={videoId} title={`Cuplikan ${courseTitle}`} courseSlug={courseSlug} />
            ) : null}
          </div>

          {steps?.length ? (
            <div className="mt-6 max-w-[42ch]">
              <p className="font-display text-xl font-extrabold text-kecap">Cara daftar</p>
              <ol className="mt-2 space-y-2.5">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-lg leading-snug text-kecap">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sambal text-sm font-bold text-white"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              {stepsHelp && <p className="mt-3 text-lg leading-relaxed text-kecap/85">{stepsHelp}</p>}
            </div>
          ) : (
            <p className="mt-4 max-w-[42ch] text-lg leading-relaxed text-kecap/85">{nextStep}</p>
          )}
          <p className="mt-6 max-w-[38ch] font-display text-2xl font-extrabold leading-snug tracking-[-0.02em] sm:text-3xl">{subhook}</p>
        </div>
      </div>
    </section>
  );
}
