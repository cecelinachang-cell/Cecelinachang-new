import { ChevronDown } from 'lucide-react';
import { faqs, type FaqCategory } from '@/app/data/faq';

export default function Faq({
  categories,
  title = 'Pertanyaan yang Sering Diajukan (FAQ)',
}: {
  categories: FaqCategory[];
  title?: string;
}) {
  const filtered = faqs.filter((f) => categories.includes(f.category));

  return (
    <div className="mt-12 sm:mt-24 max-w-3xl mx-auto">
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-6 sm:mb-8 text-center">
        {title}
      </h2>
      <div className="bg-white rounded-2xl border border-butter/30 divide-y divide-butter/30 overflow-hidden">
        {filtered.map((faq, i) => (
          <details key={i} name="faq" className="group" open={i === 0}>
            <summary className="tap-target flex items-center justify-between gap-4 px-5 sm:px-6 py-4 font-bold text-charcoal-brown cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              <span>{faq.q}</span>
              <ChevronDown className="w-5 h-5 shrink-0 text-terracotta transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-5 sm:px-6 pb-5 text-charcoal-brown/70 leading-relaxed">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
