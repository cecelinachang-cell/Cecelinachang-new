import { Plus } from 'lucide-react';

interface LandingFaqProps {
  items: { question: string; answer: string }[];
  title?: string;
  className?: string;
}

export function LandingFaq({ items, title = 'Pertanyaan yang sering masuk', className = 'py-14 sm:py-20' }: LandingFaqProps) {
  if (items.length === 0) return null;

  return (
    <section className={`px-4 sm:px-6 ${className}`}>
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
        <div className="divide-y divide-steel-line overflow-hidden rounded-2xl border border-steel-line bg-white">
          {items.map((item) => (
            <details key={item.question} className="group">
              <summary className="tap-target flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 font-bold leading-snug sm:px-5 [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus
                  className="h-5 w-5 shrink-0 text-sambal transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </summary>
              <p className="px-4 pb-5 leading-relaxed text-kecap/75 sm:px-5">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
