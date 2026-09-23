import Image from 'next/image';
import { QuizCta } from './QuizCta';
import { YouTubePreview } from './YouTubePreview';

interface LandingHeroProps {
  hook: string;
  subhook: string;
  ctaLabel: string;
  proofPoints: string[];
  students: number;
  imageUrl: string;
  courseTitle: string;
  videoId?: string;
  courseSlug: string;
}

// Red pinstripe band: the striped apron Cece wears in her videos.
const apronStripes = {
  backgroundColor: 'var(--color-sambal)',
  backgroundImage:
    'repeating-linear-gradient(90deg, transparent 0 13px, rgba(255,255,255,0.09) 13px 15px)',
};

export function LandingHero({ hook, subhook, ctaLabel, proofPoints, students, imageUrl, courseTitle, videoId, courseSlug }: LandingHeroProps) {
  const proof = [...proofPoints, `${students.toLocaleString('id-ID')} murid`];

  return (
    <section id="lp-hero">
      <div style={apronStripes} className="px-4 pb-28 pt-5 text-white sm:px-6 sm:pb-40 sm:pt-12">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-[0.95rem] font-semibold text-white/85">Kelas online bersama Cece Lina Chang</p>
          <h1 className="font-display text-[2rem] font-extrabold leading-[1.04] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl">
            {hook}
          </h1>
        </div>
      </div>

      <div className="-mt-24 px-4 sm:-mt-32 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {videoId ? (
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

          {/* CTA before the proof badges: in TikTok/Instagram in-app browsers only
              ~650px is visible, and the button has to fit in it. */}
          <p className="mt-5 text-lg leading-relaxed text-kecap/80 sm:text-xl">{subhook}</p>
          <QuizCta label={ctaLabel} className="mt-5 w-full sm:w-auto" />
          <ul className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-kecap">
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
