import { X } from 'lucide-react';

export function PainSection({ title, pains, close }: { title: string; pains: string[]; close: string }) {
  return (
    <section className="px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">{title}</h2>
        <ul className="divide-y divide-steel-line overflow-hidden rounded-2xl border border-steel-line bg-white">
          {pains.map((pain) => (
            <li key={pain} className="flex items-start gap-3 px-4 py-4 text-[1.05rem] leading-snug sm:px-5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sambal/10 text-sambal">
                <X className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
              </span>
              <span>{pain}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-lg leading-relaxed text-kecap/75">{close}</p>
      </div>
    </section>
  );
}
