import Image from 'next/image';

interface StudentProofProps {
  testimonials: { src: string; alt: string }[];
}

/**
 * Real WhatsApp screenshots from students. On phones they sit in a swipeable
 * row with the next one peeking in, so the text in each screenshot stays
 * large enough to read.
 */
export function StudentProof({ testimonials }: StudentProofProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-14 sm:py-20">
      <div className="px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">
            Kata murid yang sudah praktek
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-kecap/75">
            Pesan asli yang masuk ke WhatsApp Cece, dikirim murid setelah praktek di rumah.
          </p>
        </div>
      </div>
      <ul className="hide-scrollbar mx-auto flex max-w-3xl snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-6">
        {testimonials.map((t) => (
          <li key={t.src} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <figure className="overflow-hidden rounded-2xl border border-steel-line bg-[#EFE7DC] shadow-[0_12px_28px_-18px_rgba(34,26,23,0.5)]">
              <Image
                src={t.src}
                alt={t.alt}
                width={514}
                height={800}
                sizes="(max-width: 640px) 78vw, 360px"
                className="h-auto w-full"
              />
            </figure>
          </li>
        ))}
      </ul>
      {testimonials.length > 1 && (
        <p className="mt-3 px-4 text-center text-sm text-steel sm:hidden">Geser untuk lihat pesan lainnya</p>
      )}
    </section>
  );
}
