'use client';

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
    <div className="mt-24 max-w-4xl mx-auto">
      <h2 className="font-serif text-3xl font-bold text-rust-ink mb-12 text-center">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((faq, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-2xl shadow-sm border border-butter/30"
          >
            <h3 className="font-bold text-lg text-charcoal-brown mb-3">{faq.q}</h3>
            <p className="text-charcoal-brown/70 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
