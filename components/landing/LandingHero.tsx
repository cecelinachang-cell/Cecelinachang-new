import Image from 'next/image';
import { Marginalia } from '@/components/Marginalia';
import { PayNowCta } from './PayNowCta';
import { YouTubePreview } from './YouTubePreview';
import { SelfHostedPreview, type PreviewVideo } from './SelfHostedPreview';
import { WhatsAppAsk } from './WhatsAppAsk';
import { showStudents } from '@/lib/course-stats';

interface LandingHeroProps {
  hook: string;
  subhook: string;
  proofPoints: string[];
  students: number;
  imageUrl: string;
  courseTitle: string;
  videoId?: string;
  video?: PreviewVideo;
  courseSlug: string;
  price: string;
  /** What the class includes, repeated under the first button. */
  included: string[];
  /** What happens after Daftar. */
  nextStep: string;
  /** Numbered join steps; shown instead of nextStep when set. */
  steps?: string[];
  /** Help line under the steps. */
  stepsHelp?: string;
  quote?: { text: string; source: string };
}

// Red pinstripe band: the striped apron Cece wears in her videos.
const apronStripes = {
  backgroundColor: 'var(--color-sambal)',
  backgroundImage:
    'repeating-linear-gradient(90deg, transparent 0 14px, rgba(255,255,255,0.08) 14px 16px)',
};

export function LandingHero({ hook, subhook, proofPoints, students, imageUrl, courseTitle, videoId, video, courseSlug, price, included, nextStep, steps, stepsHelp, quote }: LandingHeroProps) {
  const proof = showStudents(students) ? [...proofPoints, `${students.toLocaleString('id-ID')} murid`] : proofPoints;

  return (
    <section id="lp-hero">
      <div style={apronStripes} className="px-4 pb-5 pt-5 text-white sm:px-6 sm:pb-8 sm:pt-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="max-w-[20rem] font-display text-[2.05rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-balance sm:max-w-[34rem] sm:text-5xl sm:leading-[1.08]">
            {hook}
          </h1>
          {showStudents(students) && (
            <Marginalia rotate={-2} className="mt-2 text-mie">
              {students.toLocaleString('id-ID')} murid sudah belajar
            </Marginalia>
          )}
          <div className="mt-5">
            {video ? (
              <SelfHostedPreview video={video} title={`Cuplikan ${courseTitle}`} courseSlug={courseSlug} />
            ) : videoId ? (
              <YouTubePreview videoId={videoId} title={`Cuplikan ${courseTitle}`} courseSlug={courseSlug} />
            ) : (
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-[0_18px_40px_-16px_rgba(34,26,23,0.55)]">
                <Image
                  src={imageUrl}
                  alt={courseTitle}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {/* The buy button sits directly under the bowl. In TikTok and
              Instagram as little as ~560px shows, and this has to fit. */}
          <PayNowCta courseSlug={courseSlug} courseTitle={courseTitle} price={price} className="w-full sm:w-auto" />
          <WhatsAppAsk
            courseSlug={courseSlug}
            courseTitle={courseTitle}
            price={price}
            className="mt-3 w-full border-0 bg-transparent px-1 text-base text-seledri underline decoration-seledri/40 underline-offset-4 sm:w-auto"
          />
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-kecap/80">{included.join('. ')}.</p>
          {steps?.length ? (
            <div className="mt-5 max-w-[42ch]">
              <p className="font-display text-lg font-extrabold text-kecap">Cara daftar</p>
              <ol className="mt-2 space-y-2">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-[1.0625rem] leading-snug text-kecap">
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
              {stepsHelp && <p className="mt-3 text-base leading-relaxed text-kecap/70">{stepsHelp}</p>}
            </div>
          ) : (
            <p className="mt-2 max-w-[42ch] text-base leading-relaxed text-kecap/70">{nextStep}</p>
          )}
          <p className="mt-6 max-w-[38ch] font-display text-2xl font-extrabold leading-snug tracking-[-0.02em] sm:text-3xl">{subhook}</p>
          {quote && (
            <figure className="mt-4">
              <Marginalia rotate={-1} className="text-rust-ink">
                “{quote.text}”
              </Marginalia>
              <figcaption className="mt-1 text-sm text-steel">{quote.source}</figcaption>
            </figure>
          )}
          <ul className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-kecap">
            {proof.map((item) => (
              <li key={item} className="rounded-full border border-steel-line bg-white px-3 py-1.5">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
