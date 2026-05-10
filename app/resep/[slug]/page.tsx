import Image from 'next/image';
import Link from 'next/link';
import { Clock, ChefHat, Users, ArrowLeft, PlayCircle, CheckCircle2 } from 'lucide-react';

export default async function ResepDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/resep" className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium mb-8">
        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Resep
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
          Roti
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-900 mb-6 leading-tight">
          Roti Sobek Susu Super Lembut Anti Gagal
        </h1>
        <p className="text-lg text-stone-600 mb-8">
          Resep andalan yang selalu berhasil bikin keluarga ketagihan. Teksturnya sangat lembut seperti kapas, cocok untuk sarapan atau teman minum teh sore.
        </p>

        <div className="flex flex-wrap gap-6 text-stone-500 text-sm sm:text-base border-y border-orange-100 py-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-600" />
            <span>Waktu: 120 Menit</span>
          </div>
          <div className="flex items-center">
            <ChefHat className="w-5 h-5 mr-2 text-orange-600" />
            <span>Tingkat: Sedang</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-orange-600" />
            <span>Porsi: 1 Loyang</span>
          </div>
        </div>
      </div>

      {/* Main Image/Video */}
      <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden shadow-lg mb-12">
        <Image
          src="https://picsum.photos/seed/bread/1200/800"
          alt="Roti Sobek Susu"
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <PlayCircle className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-3xl mx-auto">
        {/* Ingredients & Steps */}
        <div>
          {/* Bahan-bahan */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-orange-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-sm mr-3">1</span>
              Bahan-bahan
            </h2>
            <ul className="space-y-4">
              {[
                '250 gr Tepung terigu protein tinggi',
                '50 gr Gula pasir',
                '5 gr Ragi instan',
                '1 butir Kuning telur',
                '130 ml Susu cair dingin',
                '30 gr Mentega tawar',
                '1/4 sdt Garam'
              ].map((bahan, i) => (
                <li key={i} className="flex items-start text-stone-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">{bahan}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Langkah-langkah */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-orange-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-sm mr-3">2</span>
              Cara Membuat
            </h2>
            <div className="space-y-8">
              {[
                'Campur tepung terigu, gula pasir, dan ragi instan dalam wadah besar. Aduk rata.',
                'Masukkan kuning telur dan susu cair dingin sedikit demi sedikit sambil diuleni hingga setengah kalis.',
                'Tambahkan mentega dan garam. Uleni terus hingga adonan benar-benar kalis elastis (bisa ditarik tipis tanpa putus).',
                'Bulatkan adonan, tutup dengan kain bersih atau plastik wrap. Diamkan selama 45-60 menit hingga mengembang 2x lipat.',
                'Kempiskan adonan, bagi menjadi 16 bagian sama besar. Bulatkan masing-masing bagian.',
                'Tata dalam loyang yang sudah dioles mentega. Diamkan lagi 30 menit.',
                'Oles permukaan dengan susu cair, panggang di oven suhu 180°C selama 20-25 menit hingga kecoklatan.'
              ].map((step, i) => (
                <div key={i} className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold mr-4">
                    {i + 1}
                  </div>
                  <p className="text-lg text-stone-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tips Praktis */}
          <section className="bg-orange-50 rounded-2xl p-6 sm:p-8 border border-orange-100">
            <h3 className="font-serif text-xl font-bold text-orange-900 mb-4 flex items-center">
              💡 Tips Praktis Ci Lina
            </h3>
            <p className="text-stone-700 leading-relaxed">
              Pastikan susu cair benar-benar dingin (dari kulkas) agar ragi tidak cepat bereaksi saat diuleni, terutama jika menggunakan mixer. Ini rahasia agar roti bisa kalis sempurna dan seratnya halus.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
