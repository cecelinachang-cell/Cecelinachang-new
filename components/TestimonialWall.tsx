import Image from 'next/image';
import { Quote } from 'lucide-react';
import { Marginalia } from '@/components/Marginalia';
import { extraUploads, testimonialsFor } from '@/app/data/student-testimonials';
import { getTestimonials } from '@/lib/testimonials';

interface TestimonialWallProps {
  /** On a class page, that class's messages come first. */
  courseSlug?: string;
  studentsLabel?: string;
  title?: string;
  /** Inside a page column that already has a heading and padding (class pages). */
  bare?: boolean;
}

/**
 * Every student message visible at once, rendered on the server: no carousel
 * to wait for, no JavaScript needed, and the images are files in /public.
 * Replaces TestimonialCarousel, which showed one photo at a time and only
 * after a client-side fetch.
 */
export async function TestimonialWall({
  courseSlug,
  studentsLabel,
  title = 'Apa Kata Murid Cece?',
  bare = false,
}: TestimonialWallProps) {
  const curated = testimonialsFor(courseSlug);
  const uploads = extraUploads((await getTestimonials()).map((t) => t.image));

  return (
    <section className={bare ? 'w-full' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full'} aria-label="Testimoni murid">
      {!bare && (
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-serif text-fluid-h2 font-bold text-rust-ink mb-2">{title}</h2>
          <Marginalia rotate={-2} className="text-lg">
            {studentsLabel ? `${studentsLabel}+ murid · ` : ''}pesan asli dari WhatsApp Cece
          </Marginalia>
        </div>
      )}

      {/* Phones: one swipeable row with the next message peeking in. Wider: masonry columns. */}
      <ul
        className={`hide-scrollbar -mx-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:mx-0 sm:block sm:columns-2 sm:overflow-visible sm:px-0 ${bare ? '' : 'lg:columns-3'} sm:gap-6 sm:[&>li]:mb-6`}
      >
        {curated.map((t) => (
          <li key={t.image} className="w-[82%] shrink-0 snap-start break-inside-avoid sm:w-auto">
            <figure className="overflow-hidden rounded-2xl border border-butter/40 bg-white shadow-sm">
              <Image
                src={t.image}
                alt={`Pesan WhatsApp murid ${t.courseLabel}: ${t.quote}`}
                width={t.width}
                height={t.height}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 360px"
                className="h-auto w-full bg-[#EFE7DC]"
              />
              <figcaption className="p-4 sm:p-5">
                <p className="flex gap-2 text-charcoal-brown leading-relaxed">
                  <Quote className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                  <span>{t.quote}</span>
                </p>
                <p className="mt-2 text-sm font-semibold text-rust-ink">Murid {t.courseLabel}</p>
              </figcaption>
            </figure>
          </li>
        ))}
        {uploads.map((src) => (
          <li key={src} className="w-[82%] shrink-0 snap-start break-inside-avoid sm:w-auto">
            <figure className="overflow-hidden rounded-2xl border border-butter/40 bg-white shadow-sm">
              <Image
                src={src}
                alt="Pesan WhatsApp dari murid Cece"
                width={720}
                height={900}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 360px"
                className="h-auto w-full bg-[#EFE7DC]"
              />
            </figure>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-center text-sm text-steel sm:hidden">Geser untuk lihat pesan murid lainnya →</p>
    </section>
  );
}
