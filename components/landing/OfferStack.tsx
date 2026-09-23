import { Check, MessageCircle } from 'lucide-react';
import { QuizCta } from './QuizCta';

interface OfferStackProps {
  courseTitle: string;
  price: string;
  includes: string[];
  valueLine: string;
  riskLine: string;
  ctaLabel: string;
}

export function OfferStack({ courseTitle, price, includes, valueLine, riskLine, ctaLabel }: OfferStackProps) {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-steel-line bg-white shadow-[0_24px_48px_-28px_rgba(34,26,23,0.45)]">
        <div className="bg-kecap px-6 py-5 text-white sm:px-8">
          <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{courseTitle}</h2>
        </div>
        <div className="p-6 sm:p-8">
          <ul className="mb-7 space-y-3">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-lg leading-snug">
                <Check className="mt-0.5 h-6 w-6 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mb-6 border-t border-dashed border-steel-line pt-5">
            <p className="mb-1 text-kecap/70">{valueLine}</p>
            <p className="font-display text-4xl font-extrabold tracking-[-0.02em]">{price}</p>
          </div>
          <QuizCta label={ctaLabel} className="w-full" />
          <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-kecap/70">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-seledri" aria-hidden="true" />
            <span>{riskLine}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
