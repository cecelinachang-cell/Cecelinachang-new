import { QuizCta } from './QuizCta';

interface RootCauseSectionProps {
  title: string;
  intro: string;
  causes: { title: string; body: string }[];
  line: string;
  ctaLabel: string;
}

// The causes follow the order bakso is made in (grind, knead, boil), so the
// numbers are a real sequence.
export function RootCauseSection({ title, intro, causes, line, ctaLabel }: RootCauseSectionProps) {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">{title}</h2>
        <p className="mb-8 text-lg leading-relaxed text-kecap/75">{intro}</p>
        <ol className="space-y-6">
          {causes.map((cause, i) => (
            <li key={cause.title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kecap font-display text-lg font-extrabold text-white">
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="mb-1 font-display text-xl font-bold leading-snug">{cause.title}</h3>
                <p className="leading-relaxed text-kecap/75">{cause.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 rounded-2xl bg-mie/25 px-5 py-5 font-display text-xl font-bold leading-snug sm:text-2xl">{line}</p>
        <QuizCta label={ctaLabel} className="mt-8 w-full sm:w-auto" />
      </div>
    </section>
  );
}
