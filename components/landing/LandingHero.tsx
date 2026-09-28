import Image from 'next/image';
import { Check } from 'lucide-react';
import { QuizCta } from './QuizCta';
import { YouTubePreview } from './YouTubePreview';
import { WhatsAppAsk } from './WhatsAppAsk';

interface LandingHeroProps {
  hook: string;
  subhook: string;
  proofPoints: string[];
  students: number;
  imageUrl: string;
  courseTitle: string;
  videoId?: string;
  courseSlug: string;
  price: string;
  /** What the class includes, repeated under the first button. */
  included: string[];
  /** What happens after Daftar. */
  nextStep: string;
  quote?: { text: string; source: string };
}

// Red pinstripe band: the striped apron Cece wears in her videos.
const apronStripes = {
  backgroundColor: 'var(--color-sambal)',
  backgroundImage:
    'repeating-linear-gradient(90deg, transparent 0 13px, rgba(255,255,255,0.09) 13px 15px)',
};

export function LandingHero({ hook, subhook, proofPoints, students, imageUrl, courseTitle, videoId, courseSlug, price, included, nextStep, quote }: LandingHeroProps) {
  const proof = [...proofPoints, `${students.toLocaleString('id-ID')} murid`];

  return (
    <section id="lp-hero">
      <div style={apronStripes} className="px-4 pb-28 pt-5 text-white sm:px-6 sm:pb-40 sm:pt-12">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-[0.95rem] font-semibold text-white/85">
            {courseTitle} · {students.toLocaleString('id-ID')} murid
          </p>
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

          {/* Buttons straight under the video, subhook after: in TikTok and
              Instagram in-app browsers as little as ~560px is visible, and the
              Daftar button has to fit in it. The decided visitor buys (price
              in the label, so nobody is surprised in WhatsApp). The quiz stays
              further down the page. */}
          <QuizCta href="#daftar" label={`Daftar kelasnya · ${price}`} className="mt-4 w-full sm:w-auto" />
          <WhatsAppAsk
            courseSlug={courseSlug}
            courseTitle={courseTitle}
            price={price}
            className="mt-3 w-full sm:w-auto"
          />
          <ul className="mt-4 space-y-1.5">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-snug text-kecap">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-kecap/70">{nextStep}</p>
          <p className="mt-5 text-lg leading-relaxed text-kecap/80 sm:text-xl">{subhook}</p>
          {quote && (
            <figure className="mt-5 border-l-4 border-sambal pl-4">
              <blockquote className="font-display text-lg font-bold leading-snug">“{quote.text}”</blockquote>
              <figcaption className="mt-1 text-sm text-kecap/60">{quote.source}</figcaption>
            </figure>
          )}
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
