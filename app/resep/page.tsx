import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Clock, ChefHat } from 'lucide-react';
import { Marginalia } from '@/components/Marginalia';

export default function ResepPage() {
  const categories = ['Semua', 'Kue', 'Roti', 'Cookies', 'Resep Favorit Indonesia'];

  const recipes = [
    { id: 1, title: 'Roti Sobek Susu Super Lembut', category: 'Roti', time: '120 mnt', difficulty: 'Sedang', image: 'bread', tip: 'kuncinya di uleni sampe kalis!' },
    { id: 2, title: 'Bolu Marmer Klasik Anti Gagal', category: 'Kue', time: '60 mnt', difficulty: 'Mudah', image: 'cake', tip: 'jangan buka oven dulu ya' },
    { id: 3, title: 'Chocochip Cookies Renyah', category: 'Cookies', time: '45 mnt', difficulty: 'Mudah', image: 'cookies', tip: 'dinginkan adonan 30 menit' },
    { id: 4, title: 'Nastar Lumer Mulut', category: 'Resep Favorit Indonesia', time: '90 mnt', difficulty: 'Sedang', image: 'nastar', tip: 'selai jangan kebanyakan!' },
    { id: 5, title: 'Donat Kampung Empuk', category: 'Roti', time: '120 mnt', difficulty: 'Sedang', image: 'donut', tip: 'minyaknya jangan kepanasan' },
    { id: 6, title: 'Brownies Panggang Fudgy', category: 'Kue', time: '50 mnt', difficulty: 'Mudah', image: 'brownies', tip: 'kuncinya di suhu oven!' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mb-4">Koleksi Resep</h1>
        <p className="text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
          Langkah demi langkah yang mudah diikuti, bahkan jika Anda baru pertama kali menyalakan oven.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 border border-butter/40 rounded-full bg-white text-charcoal-brown placeholder-charcoal-brown/40 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent shadow-sm"
            placeholder="Cari resep (misal: Roti Sobek)..."
          />
        </div>
        <button className="inline-flex justify-center items-center px-6 py-4 border border-butter/40 rounded-full bg-white text-charcoal-brown hover:bg-butter/15 transition-colors shadow-sm font-medium">
          <Filter className="w-5 h-5 mr-2" /> Filter
        </button>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar gap-3">
        {categories.map((cat, i) => (
          <button
            key={i}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-colors ${
              i === 0
                ? 'bg-rust-ink text-white'
                : 'bg-butter/30 text-rust-ink hover:bg-butter/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((resep) => (
          <Link href={`/resep/${resep.id}`} key={resep.id} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-orange-50">
            <div className="relative h-64 overflow-hidden">
              <Image
                src={`https://picsum.photos/seed/${resep.image}/600/400`}
                alt={resep.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-rust-ink">
                {resep.category}
              </div>
              <Marginalia
                rotate={-3}
                className="absolute bottom-3 right-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] text-lg"
              >
                {resep.tip}
              </Marginalia>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-xl font-bold text-charcoal-brown group-hover:text-terracotta transition-colors mb-4 line-clamp-2">
                {resep.title}
              </h3>
              <div className="flex items-center justify-between text-charcoal-brown/60 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {resep.time}
                </div>
                <div className="flex items-center">
                  <ChefHat className="w-4 h-4 mr-1.5" />
                  {resep.difficulty}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium rounded-full text-rust-ink bg-butter/30 hover:bg-butter/50 transition-colors">
          Muat Lebih Banyak
        </button>
      </div>
    </div>
  );
}
