import Image from 'next/image';

interface StudentProofProps {
  testimonials: { src: string; alt: string; width: number; height: number }[];
}

/**
 * Real WhatsApp screenshots from students, stacked one under another on
 * phones. They used to sit in a sideways swipe row, but most buyers are 45+
 * and a swipe behind a small grey "geser" hint hid the strongest messages.
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
      <ul className="mx-auto grid max-w-3xl gap-5 px-4 sm:grid-cols-2 sm:px-6">
        {testimonials.map((t) => (
          <li key={t.src} className="mx-auto w-full max-w-sm sm:max-w-none">
            <figure className="overflow-hidden rounded-2xl border border-steel-line bg-[#EFE7DC] shadow-[0_12px_28px_-18px_rgba(34,26,23,0.5)]">
              <Image
                src={t.src}
                alt={t.alt}
                width={t.width}
                height={t.height}
                sizes="(max-width: 640px) 92vw, 360px"
                className="h-auto w-full"
              />
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
