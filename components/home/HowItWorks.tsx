import { POLICIES } from '@/lib/policies';

const STEPS = [
  'Klik tombol, isi email & nomor WA kamu.',
  'Transfer, lalu kirim bukti ke aku di WhatsApp.',
  'Link video langsung aku kirim. Akses seumur hidup, bisa diulang kapan aja.',
];

export function HowItWorks() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-6 text-center">
        Daftarnya gampang, 3 langkah aja
      </h2>
      <ol className="space-y-3 mb-4">
        {STEPS.map((step, i) => (
          <li key={i} className="flex items-start gap-4 bg-white rounded-2xl border border-butter/30 p-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-butter/40 text-rust-ink font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-charcoal-brown/80 leading-relaxed pt-1">{step}</span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-charcoal-brown/50 text-center">{POLICIES.COURSE_REFUND_SHORT}</p>
    </div>
  );
}
