import { Check } from 'lucide-react';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';

interface TransformationSectionProps {
  beforeAfter: { before: string; after: string }[];
  benefits: string[];
  benefitsNote: string;
  studentResults: string[];
  students: number;
}

export function TransformationSection({ beforeAfter, benefits, benefitsNote, studentResults, students }: TransformationSectionProps) {
  return (
    <section className="py-14 sm:py-20">
      <div className="px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">
            Sebelum &amp; sesudah ikut kelas
          </h2>
          {/* Stacked pairs rather than a two-column table: readable at 360px. */}
          <ul className="space-y-3">
            {beforeAfter.map((row) => (
              <li key={row.before} className="overflow-hidden rounded-2xl border border-steel-line bg-white">
                <p className="px-4 pb-2 pt-4 text-[0.95rem] leading-snug text-steel line-through decoration-steel/40 sm:px-5">
                  {row.before}
                </p>
                <p className="flex items-start gap-2.5 px-4 pb-4 font-semibold leading-snug sm:px-5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
                  <span>{row.after}</span>
                </p>
              </li>
            ))}
          </ul>

          <h3 className="mb-2 mt-14 font-display text-fluid-h3 font-bold">Yang akan kamu kuasai</h3>
          <p className="mb-5 text-kecap/70">{benefitsNote}</p>
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 leading-relaxed text-kecap/85">
                <Check className="mt-1 h-5 w-5 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
                <span>{benefit.replace(/\s+/g, ' ')}</span>
              </li>
            ))}
          </ul>

          <div className="mt-14 border-l-4 border-sambal pl-5">
            <p className="mb-3 font-display text-2xl font-extrabold leading-tight">
              {students.toLocaleString('id-ID')} murid sudah belajar dari Cece
            </p>
            <div className="space-y-2 text-lg leading-relaxed text-kecap/80">
              {studentResults.map((r) => (
                <p key={r}>{r}</p>
              ))}
            </div>
        </div>
        </div>
      </div>
      {/* Real testimonial screenshots only; renders nothing if there are none. */}
      <TestimonialCarousel hideFallback />
    </section>
  );
}
