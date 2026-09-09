import Link from 'next/link';
import { Search, Home, BookOpen, ShoppingBag } from 'lucide-react';
import { Marginalia } from '@/components/Marginalia';

const topLinks = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/kursus', label: 'Kursus Online', icon: BookOpen },
  { href: '/toko', label: 'Toko Alat Baking', icon: ShoppingBag },
];

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
      <Marginalia rotate={-3} className="text-2xl">
        yah, halamannya kepanggang gosong
      </Marginalia>
      <h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mt-4 mb-4">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-lg text-charcoal-brown/70 mb-10 max-w-xl mx-auto">
        Halaman yang Anda cari mungkin sudah pindah atau tidak pernah ada. Coba cari resep atau alat baking yang Anda maksud, atau kembali ke salah satu halaman utama.
      </p>

      <Link
        href="/kursus"
        className="inline-flex items-center gap-2 text-charcoal-brown/60 hover:text-rust-ink transition-colors mb-10"
      >
        <Search className="w-5 h-5" />
        <span>Gunakan pencarian di navbar untuk temukan resep atau kelas</span>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {topLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-butter/30 shadow-sm hover:shadow-md hover:border-terracotta transition-all p-6"
          >
            <Icon className="w-6 h-6 text-terracotta" />
            <span className="font-medium text-rust-ink">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
