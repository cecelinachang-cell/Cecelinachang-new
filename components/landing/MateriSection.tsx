import { Marginalia } from '@/components/Marginalia';
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

/** The class, written like the order bakso is made, on a sheet of recipe paper. */
export function MateriSection({ title, items, whyTitle, why, price, courseSlug, courseTitle }: MateriSectionProps) {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl rounded-[1.75rem] bg-mie/25 px-5 py-7 sm:px-8 sm:py-10">
        <Marginalia rotate={-2} className="mb-2 text-rust-ink">
          urutannya begini
        </Marginalia>
        <h2 className="mb-7 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.02em]">{title}</h2>
        <ol className="space-y-5">
          {items.map((item, i) => (
            <li key={item} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kecap font-display text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <p className="pt-1 text-lg leading-snug">{item.replace(/\s+/g, ' ')}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 border-t border-kecap/15 pt-6">
          <h3 className="mb-3 font-display text-xl font-extrabold">{whyTitle}</h3>
          <ul className="space-y-2.5 text-base leading-relaxed text-kecap/80">
            {why.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <QuizCta href="#daftar" label={`Daftar kelasnya · ${price}`} className="w-full sm:w-auto" />
          <WhatsAppAsk
            courseSlug={courseSlug}
            courseTitle={courseTitle}
            price={price}
            className="mt-3 w-full border-0 bg-transparent px-1 text-base underline decoration-seledri/40 underline-offset-4 sm:w-auto"
          />
        </div>
      </div>
    </section>
  );
}
