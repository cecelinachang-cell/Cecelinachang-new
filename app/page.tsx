"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShoppingBag, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { Marginalia } from "@/components/Marginalia";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { products as fallbackProducts } from "@/app/data/products";

interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  category?: string;
  createdAt?: string;
}

const parseImageUrls = (url: string | undefined): string[] => {
  if (!url) return [];
  try {
    const urls = JSON.parse(url);
    if (Array.isArray(urls)) return urls;
  } catch (e) {
    //
  }
  return [url];
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [assets, setAssets] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const keys = [
          "hero_image",
          "home_course_1",
          "home_course_2",
          "home_course_3",
          "home_course_4",
        ];
        const { data, error } = await supabase
          .from("settings")
          .select("id, logo_url")
          .in("id", keys);
        if (!error && data) {
          const newAssets: Record<string, string> = {};
          data.forEach((item) => {
            if (item.logo_url) newAssets[item.id] = item.logo_url;
          });
          setAssets(newAssets);
        }
      } catch (err: any) {
        const errMsg = err?.message || err?.toString() || '';
        if (errMsg !== 'Failed to fetch' && !errMsg.includes('Failed to fetch')) {
          console.error("Error fetching assets:", err);
        }
      }
    };

    fetchAssets();

    const fetchProducts = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setFeaturedProducts(fallbackProducts.slice(0, 4) as unknown as Product[]);
          setLoadingProducts(false);
          return;
        }

        const { data, error } = await supabase
          .from("items")
          .select("*")
          .order("createdAt", { ascending: false })
          .limit(4);

        if (error) {
          const errMsg = error?.message || (error as any)?.toString() || '';
          if (errMsg.includes("schema cache")) {
            console.warn("Supabase schema not initialized yet.");
          } else if (errMsg !== "Failed to fetch" && !errMsg.includes("Failed to fetch")) {
            console.error("Error fetching items", errMsg);
          }
          setFeaturedProducts(fallbackProducts.slice(0, 4) as unknown as Product[]);
        } else if (!data || data.length === 0) {
          setFeaturedProducts(fallbackProducts.slice(0, 4) as unknown as Product[]);
        } else {
          setFeaturedProducts(data as Product[]);
        }
      } catch (err: any) {
        const errMsg = err?.message || err?.toString() || '';
        if (errMsg !== "Failed to fetch" && !errMsg.includes("Failed to fetch")) {
          console.error("Network or unexpected error fetching products:", err);
        }
        setFeaturedProducts(fallbackProducts.slice(0, 4) as unknown as Product[]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="flex flex-col text-center lg:text-left"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeUpVariant} className="mb-6 mx-auto lg:mx-0 w-fit">
                <Marginalia rotate={-3}>sudah 10.000+ murid, makasih ya!</Marginalia>
              </motion.div>

              <motion.h1
                variants={fadeUpVariant}
                className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-charcoal-brown leading-[1.1] mb-6"
              >
                Belajar Baking <br />
                <span className="text-terracotta italic font-normal">
                  Anti Gagal
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUpVariant}
                className="text-lg sm:text-xl text-charcoal-brown/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Sudah 10.000+ ibu berhasil bikin lapis legit, otak otak, dan bakso sendiri di rumah tanpa pernah masak sebelumnya
              </motion.p>

              <motion.div
                variants={fadeUpVariant}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="#kelas"
                  className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium rounded-full text-white bg-terracotta hover:bg-rust-ink hover:scale-105 active:scale-95 transition-all shadow-lg shadow-terracotta/20"
                >
                  Mulai Belajar <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/toko"
                  className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium rounded-full text-charcoal-brown bg-white border border-butter/40 hover:border-terracotta/50 hover:bg-butter/10 hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  Lihat Alat Masak <ShoppingBag className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUpVariant}
                className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-stone-500 font-medium"
              >
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                    A
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-yellow-200 flex items-center justify-center text-yellow-700 font-bold">
                    B
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-green-200 flex items-center justify-center text-green-700 font-bold">
                    C
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-stone-600 text-xs">
                    +2k
                  </div>
                </div>
                <p>Dipercaya oleh ribuan ibu rumah tangga</p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative block mt-12 lg:mt-0"
            >
              <div className="relative w-full aspect-[4/5] rounded-[2.5rem_1rem_2.5rem_1rem] overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src={
                    assets["hero_image"] ||
                    "/images/meat-pie.png"
                  }
                  alt="Cece Lina Chang Baking"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium">5.0 Rating</span>
                  </div>
                  <p className="font-serif text-xl font-medium italic">
                    &quot;Resepnya mudah diikuti, hasilnya selalu
                    sempurna!&quot;
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              image: assets["home_course_2"] || "https://i.postimg.cc/rmKx8jyp/LAPISLEGITPHOTO.png",
              alt: "Lapis legit buatan Cece Lina Chang",
              title: "Resep Teruji",
              desc: "Setiap resep telah diuji coba berkali-kali untuk memastikan anti gagal.",
              note: "ini lapis legit favoritku!",
            },
            {
              image: assets["home_course_1"] || "https://i.postimg.cc/t10xCGvR/image.png",
              alt: "Video tutorial baking",
              title: "Video Detail",
              desc: "Panduan video langkah demi langkah yang sangat jelas dan mudah diikuti.",
              note: "nonton bareng aku, ya",
            },
            {
              image: assets["home_course_3"] || "https://i.postimg.cc/ppmR9mmT/MEATPIEPHOTO.png",
              alt: "Komunitas murid baking",
              title: "Dukungan Penuh",
              desc: "Grup komunitas dan konsultasi langsung untuk menjawab pertanyaan Anda.",
              note: "tanya apa aja, aku jawab",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-butter/30 hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <Marginalia
                  rotate={i % 2 === 0 ? -4 : 4}
                  className="absolute bottom-3 right-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                >
                  {feature.note}
                </Marginalia>
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-xl text-charcoal-brown mb-3">
                  {feature.title}
                </h3>
                <p className="text-charcoal-brown/70 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Kursus Online */}
      <section
        id="kelas"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="bg-butter/25 rounded-3xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center space-x-2 bg-butter/50 text-rust-ink px-4 py-2 rounded-full w-fit mb-6">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Kelas Online</span>
              </div>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-rust-ink mb-4">
                Belajar Lebih Dalam Bersama Saya
              </h2>
              <p className="text-charcoal-brown/80 text-lg mb-8">
                Ikuti kelas online eksklusif di mana saya akan membimbing Anda
                langkah demi langkah. Mulai dari pengenalan bahan hingga teknik
                dekorasi profesional, semua dijelaskan dengan bahasa yang mudah
                dimengerti.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Akses video materi seumur hidup",
                  "Materi yang mudah dipahami pemula",
                  "Konsultasi langsung dengan cece lina chang",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center text-charcoal-brown/80">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                      ✓
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                href="/kursus"
                className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium rounded-full text-white bg-terracotta hover:bg-rust-ink transition-all hover:scale-105 active:scale-95 shadow-md w-fit"
              >
                Lihat Daftar Kelas
              </Link>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="p-4 lg:p-8 grid grid-cols-2 gap-4"
            >
              {[
                {
                  src:
                    assets["home_course_1"] ||
                    "/images/bakso-sapi-premium.png",
                  alt: "Bakso Sapi Premium",
                  margin: "",
                },
                {
                  src:
                    assets["home_course_2"] ||
                    "/images/lapis-legit.png",
                  alt: "Lapis Legit",
                  margin: "mt-4 lg:mt-8",
                },
                {
                  src:
                    assets["home_course_3"] ||
                    "/images/meat-pie.png",
                  alt: "Meat Pie",
                  margin: "-mt-4 lg:-mt-8",
                },
                {
                  src:
                    assets["home_course_4"] ||
                    "/images/ogura-softcake.png",
                  alt: "Ogura Softcake",
                  margin: "",
                },
              ].map((img, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 20 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: { duration: 0.8, ease: "easeOut" as const },
                    },
                  }}
                  className={`relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm group bg-butter/40 ${img.margin}`}
                >
                  <motion.div
                    initial={{ scale: 1.2 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" as const }}
                    viewport={{ once: true }}
                    className="w-full h-full"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Produk Pilihan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl font-bold text-rust-ink mb-4">
            Produk Pilihan
          </h2>
          <p className="text-charcoal-brown/70">
            Alat masak berkualitas yang saya gunakan sehari-hari.
          </p>
        </motion.div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden animate-pulse"
              >
                <div className="w-full aspect-square bg-stone-200"></div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="h-3 bg-stone-200 rounded w-1/3"></div>
                  <div className="h-4 sm:h-5 bg-stone-200 rounded w-3/4"></div>
                  <div className="h-4 sm:h-5 bg-stone-200 rounded w-1/2"></div>
                  <div className="h-10 bg-stone-200 rounded-xl w-full mt-auto sm:mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-[1.25rem_0.5rem_1.25rem_0.5rem] shadow-sm border border-butter/30 overflow-hidden hover:shadow-md transition-all group flex flex-col"
              >
                <Link
                  href={`/toko/${product.id}`}
                  className="block relative aspect-square bg-stone-50 overflow-hidden"
                >
                  <Image
                    src={
                      parseImageUrls(product.imageUrl)[0] ||
                      "https://picsum.photos/seed/placeholder/400/400"
                    }
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  {product.category && (
                    <div className="text-[10px] sm:text-xs font-bold text-terracotta uppercase tracking-wider mb-1">
                      {product.category}
                    </div>
                  )}
                  <Link href={`/toko/${product.id}`}>
                    <h3 className="font-serif text-sm sm:text-lg font-bold text-charcoal-brown mb-1 sm:mb-2 group-hover:text-terracotta transition-colors line-clamp-2 sm:line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="text-terracotta font-bold text-sm sm:text-base mb-3 sm:mb-4 mt-auto">
                    {product.price}
                  </div>
                  <Link
                    href={`/toko/${product.id}`}
                    className="block w-full text-center py-2 px-2 sm:px-4 bg-butter/20 text-rust-ink font-medium rounded-xl hover:bg-butter/35 transition-colors text-xs sm:text-sm"
                  >
                    Detail Produk
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-butter/10 rounded-3xl border border-butter/30">
            <h3 className="text-xl font-bold text-charcoal-brown mb-2">
              Belum Ada Produk
            </h3>
            <p className="text-charcoal-brown/60">
              Produk pilihan sedang dalam proses pembaruan.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/toko"
            className="inline-flex items-center text-terracotta font-bold hover:text-rust-ink transition-colors group"
          >
            Lihat Semua Produk{" "}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Testimoni */}
      <TestimonialCarousel />

      {/* Social Media */}
      <section className="bg-butter/15 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.h2
            variants={fadeUpVariant}
            className="font-serif text-3xl font-bold text-rust-ink mb-4"
          >
            Mari Berteman
          </motion.h2>
          <motion.p
            variants={fadeUpVariant}
            className="text-charcoal-brown/70 mb-8 max-w-2xl mx-auto"
          >
            Ikuti keseharian saya, tips baking singkat, dan update resep terbaru
            di sosial media.
          </motion.p>
          <motion.div
            variants={fadeUpVariant}
            className="flex flex-col items-center gap-4"
          >
            <a
              href="https://instagram.com/cecelinachang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-6 py-3 bg-white text-charcoal-brown rounded-full shadow-sm hover:shadow-md transition-all hover:-translate-y-1 font-medium"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full mr-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </span>
              @cecelinachang
            </a>
            <a
              href="https://tiktok.com/@lina_chang2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-6 py-3 bg-white text-charcoal-brown rounded-full shadow-sm hover:shadow-md transition-all hover:-translate-y-1 font-medium"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full mr-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </span>
              @lina_chang2
            </a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
