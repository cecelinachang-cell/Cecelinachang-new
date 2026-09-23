import { Plus } from 'lucide-react';

export function LandingFaq({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">
          Pertanyaan yang sering masuk
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
