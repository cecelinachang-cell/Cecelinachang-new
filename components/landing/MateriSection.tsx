import { Check } from 'lucide-react';
import { QuizCta } from './QuizCta';
import { WhatsAppAsk } from './WhatsAppAsk';

interface MateriSectionProps {
  title: string;
  items: string[];
  whyTitle: string;
  why: string[];
  price: string;
  courseSlug: string;
  courseTitle: string;
}

/** Lesson list and reasons, with the same two buttons as the hero. */
export function MateriSection({ title, items, whyTitle, why, price, courseSlug, courseTitle }: MateriSectionProps) {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">{title}</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-lg leading-snug">
              <Check className="mt-1 h-5 w-5 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
              <span>{item.replace(/\s+/g, ' ')}</span>
            </li>
          ))}
        </ul>

        <h3 className="mb-4 mt-12 font-display text-fluid-h3 font-bold">{whyTitle}</h3>
        <ul className="space-y-3">
          {why.map((item) => (
            <li key={item} className="flex items-start gap-3 leading-relaxed text-kecap/85">
              <Check className="mt-1 h-5 w-5 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <QuizCta href="#daftar" label={`Daftar kelasnya · ${price}`} className="w-full sm:w-auto" />
          <WhatsAppAsk courseSlug={courseSlug} courseTitle={courseTitle} price={price} className="w-full sm:w-auto" />
        </div>
      </div>
    </section>
  );
}
