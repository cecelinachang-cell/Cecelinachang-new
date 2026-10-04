import Link from 'next/link';

export default function ResepPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-rust-ink mb-4">Resep</h1>
      <p className="text-lg text-charcoal-brown/80 leading-relaxed mb-6">
        Resep yang saya ajarkan ada di dalam kelas, lengkap dengan video. Website ini tidak menaruh katalog resep terpisah.
      </p>
      <Link href="/kursus" className="text-terracotta font-medium hover:text-rust-ink">
        Lihat kelas online
      </Link>
    </div>
  );
}
