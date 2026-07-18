'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Users, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Marginalia } from '@/components/Marginalia';

export default function TentangPage() {
  const [aboutImage, setAboutImage] = useState<string>('https://i.postimg.cc/tCXKbMWY/image.png');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('logo_url').eq('id', 'about_image').single();
        if (!error && data?.logo_url) {
          setAboutImage(data.logo_url);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAsset();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Foto Personal */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative h-[500px] lg:h-[700px] rounded-[3rem_0.5rem_3rem_0.5rem] overflow-hidden shadow-2xl bg-butter/20 border-8 border-white flex items-center justify-center group"
        >
          <Image
            src={aboutImage}
            alt="Cece Lina Chang"
            fill
            className="object-contain object-bottom p-4 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
            unoptimized
          />
          <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <h2 className="font-serif text-2xl font-bold text-rust-ink mb-2">Cece Lina Chang</h2>
            <p className="text-charcoal-brown/70 font-medium">Baking Content Creator & Instruktur</p>
            <div className="flex items-center mt-4 text-terracotta">
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
          <div className="inline-flex items-center space-x-2 bg-butter/40 text-rust-ink px-4 py-2 rounded-full text-sm font-medium mb-8 w-fit">
            <Heart className="w-5 h-5 fill-current" /> Halo, Saya Lina!
          </div>

          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mb-8 leading-tight">
            Berawal dari Dapur Kecil, Berbagi Kebahagiaan untuk Semua.
          </h1>

          <div className="space-y-6 text-lg text-charcoal-brown/85 leading-relaxed">
            <p>
              Semua berawal dari keinginan sederhana: membuatkan camilan sehat dan enak untuk keluarga di rumah. Saya ingat betul, percobaan pertama saya membuat roti sobek berakhir dengan roti yang keras seperti batu.
            </p>
            <div className="flex items-start gap-4">
              <p className="flex-1">
                Tapi saya tidak menyerah. Saya terus mencoba, membaca, dan belajar dari berbagai sumber. Perlahan, roti yang keras mulai menjadi empuk. Bolu yang bantat mulai mengembang sempurna. Dan yang paling penting, senyum keluarga saat mencicipi hasil karya saya adalah bayaran yang tak ternilai.
              </p>
              <Marginalia rotate={4} className="hidden sm:block shrink-0 w-32 text-base">
                roti pertamaku keras banget, beneran!
              </Marginalia>
            </div>
            <p>
              Dari situ, saya mulai membagikan resep dan tips baking di sosial media. Ternyata, banyak ibu-ibu di luar sana yang mengalami kesulitan yang sama dengan saya dulu: takut gagal, bingung memilih alat, atau merasa resep di internet terlalu rumit.
            </p>
            <p>
              Selain baking, saya juga memiliki pengalaman lebih dari 28 tahun mengelola pabrik bakso sejak 1998 — pengalaman industri makanan inilah yang saya bawa ke dalam setiap resep dan kelas yang saya ajarkan, agar hasilnya benar-benar teruji, bukan sekadar coba-coba.
            </p>
            <p className="font-bold text-rust-ink text-xl mt-8 mb-4">
              Misi Saya
            </p>
            <div className="flex items-start gap-4">
              <p className="flex-1">
                Saya ingin membuktikan bahwa <strong>siapa saja bisa baking</strong>. Anda tidak perlu dapur mewah atau alat mahal untuk memulai. Yang Anda butuhkan hanyalah kemauan, resep yang tepat, dan sedikit kesabaran.
              </p>
              <Marginalia rotate={-4} className="hidden sm:block shrink-0 w-28 text-base">
                kamu pasti bisa!
              </Marginalia>
            </div>
            <p>
              Melalui website ini, saya mengumpulkan semua resep andalan, merekomendasikan alat yang benar-benar saya pakai dan terbukti bagus, serta membuka kelas online dengan bahasa yang sangat sederhana agar mudah dipahami oleh pemula sekalipun.
            </p>
            <p>
              Mari kita ciptakan aroma harum kue dari dapur rumah kita sendiri, dan bagikan kebahagiaan itu kepada orang-orang tercinta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 pt-12 border-t border-butter/40">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-butter/30 rounded-full flex items-center justify-center text-terracotta mb-4 hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div className="font-serif text-3xl font-bold text-rust-ink mb-2">2000+</div>
              <div className="text-charcoal-brown/70">Murid Kelas Online</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-butter/30 rounded-full flex items-center justify-center text-terracotta mb-4 hover:scale-110 transition-transform">
                <Heart className="w-8 h-8" />
              </div>
              <Marginalia rotate={-2} className="text-4xl mb-1">50rb+</Marginalia>
              <div className="text-charcoal-brown/70">Pengikut Setia</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
