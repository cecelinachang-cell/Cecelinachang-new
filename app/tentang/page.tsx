'use client';

import Image from 'next/image';
import { Heart, Users, Instagram } from 'lucide-react';
import { motion } from 'motion/react';

export default function TentangPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Foto Personal */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative h-[500px] lg:h-[700px] rounded-[3rem] overflow-hidden shadow-2xl bg-orange-50 flex items-center justify-center group"
        >
          <Image
            src="https://i.postimg.cc/tCXKbMWY/image.png"
            alt="Cece Lina Chang"
            fill
            className="object-contain object-bottom p-4 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <h2 className="font-serif text-2xl font-bold text-orange-900 mb-2">Cece Lina Chang</h2>
            <p className="text-stone-600 font-medium">Baking Content Creator & Instruktur</p>
            <div className="flex items-center mt-4 text-orange-600">
              <Instagram className="w-5 h-5 mr-2" />
              <a href="https://instagram.com/cecelinachang" target="_blank" rel="noopener noreferrer" className="hover:underline">@cecelinachang</a>
            </div>
          </div>
        </motion.div>

        {/* Cerita Personal */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-8 w-fit">
            <Heart className="w-5 h-5 fill-current" /> Halo, Saya Lina!
          </div>
          
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-orange-900 mb-8 leading-tight">
            Berawal dari Dapur Kecil, Berbagi Kebahagiaan untuk Semua.
          </h1>
          
          <div className="space-y-6 text-lg text-stone-700 leading-relaxed">
            <p>
              Semua berawal dari keinginan sederhana: membuatkan camilan sehat dan enak untuk keluarga di rumah. Saya ingat betul, percobaan pertama saya membuat roti sobek berakhir dengan roti yang keras seperti batu.
            </p>
            <p>
              Tapi saya tidak menyerah. Saya terus mencoba, membaca, dan belajar dari berbagai sumber. Perlahan, roti yang keras mulai menjadi empuk. Bolu yang bantat mulai mengembang sempurna. Dan yang paling penting, senyum keluarga saat mencicipi hasil karya saya adalah bayaran yang tak ternilai.
            </p>
            <p>
              Dari situ, saya mulai membagikan resep dan tips baking di sosial media. Ternyata, banyak ibu-ibu di luar sana yang mengalami kesulitan yang sama dengan saya dulu: takut gagal, bingung memilih alat, atau merasa resep di internet terlalu rumit.
            </p>
            <p className="font-bold text-orange-900 text-xl mt-8 mb-4">
              Misi Saya
            </p>
            <p>
              Saya ingin membuktikan bahwa <strong>siapa saja bisa baking</strong>. Anda tidak perlu dapur mewah atau alat mahal untuk memulai. Yang Anda butuhkan hanyalah kemauan, resep yang tepat, dan sedikit kesabaran.
            </p>
            <p>
              Melalui website ini, saya mengumpulkan semua resep andalan, merekomendasikan alat yang benar-benar saya pakai dan terbukti bagus, serta membuka kelas online dengan bahasa yang sangat sederhana agar mudah dipahami oleh pemula sekalipun.
            </p>
            <p>
              Mari kita ciptakan aroma harum kue dari dapur rumah kita sendiri, dan bagikan kebahagiaan itu kepada orang-orang tercinta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 pt-12 border-t border-orange-100">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4 hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div className="font-serif text-3xl font-bold text-orange-900 mb-2">2000+</div>
              <div className="text-stone-600">Murid Kelas Online</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4 hover:scale-110 transition-transform">
                <Heart className="w-8 h-8" />
              </div>
              <div className="font-serif text-3xl font-bold text-orange-900 mb-2">50k+</div>
              <div className="text-stone-600">Pengikut Setia</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
