"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";

import { ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  category?: string;
  description?: string;
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

export default function TokoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .order("createdAt", { ascending: false });

        if (error) {
          if (error.message && error.message.includes("schema cache")) {
            console.warn("Supabase schema not initialized yet.");
          } else {
            console.error("Error fetching items:", error.message || error);
          }
          setProducts([]);
        } else {
          setProducts(data as Product[]);
        }
      } catch (err: any) {
        console.error("Network or unexpected error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(["Semua"]);
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Semua") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-orange-900 mb-4">
          Toko Alat Masak Signora
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Peralatan baking pilihan dari Signora yang saya gunakan sendiri di
          setiap video. Kualitas terjamin untuk hasil baking yang maksimal dan
          anti gagal.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-orange-600 text-white shadow-md scale-105"
                : "bg-white text-stone-600 border border-stone-200 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden animate-pulse flex flex-col"
            >
              <div className="w-full aspect-square sm:h-64 bg-stone-200"></div>
              <div className="p-4 sm:p-6 flex flex-col flex-grow space-y-3 sm:space-y-4">
                <div className="h-4 sm:h-6 bg-stone-200 rounded w-3/4"></div>
                <div className="h-4 sm:h-6 bg-stone-200 rounded w-1/2"></div>
                <div className="h-10 sm:h-12 bg-stone-200 rounded-xl w-full mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
              >
                <Link
                  href={`/toko/${product.id}`}
                  className="block relative aspect-square sm:aspect-auto sm:h-64 bg-stone-50 overflow-hidden"
                >
                  <Image
                    src={
                      parseImageUrls(product.imageUrl)[0] ||
                      "https://picsum.photos/seed/placeholder/400/400"
                    }
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <Link href={`/toko/${product.id}`}>
                    <h3 className="font-serif text-sm sm:text-xl font-bold text-stone-900 mb-1 sm:mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="text-orange-600 font-bold text-base sm:text-lg mb-3 sm:mb-4 mt-auto">
                    {product.price}
                  </div>
                  <Link
                    href={`/toko/${product.id}`}
                    className="block w-full text-center py-2 sm:py-3 px-2 sm:px-4 bg-orange-50 text-orange-700 text-xs sm:text-base font-medium rounded-xl hover:bg-orange-100 transition-colors"
                  >
                    Detail
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-24 bg-stone-50 rounded-3xl border border-stone-100">
          <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-700 mb-2">
            Belum Ada Produk
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            {selectedCategory === "Semua"
              ? "Produk sedang dalam proses pembaruan. Silakan kembali lagi nanti."
              : `Belum ada produk untuk kategori "${selectedCategory}".`}
          </p>
          {selectedCategory !== "Semua" && (
            <button
              onClick={() => setSelectedCategory("Semua")}
              className="mt-6 px-6 py-2 bg-orange-100 text-orange-700 font-medium rounded-full hover:bg-orange-200 transition-colors"
            >
              Lihat Semua Produk
            </button>
          )}
        </div>
      )}

      {/* Banner Promo */}
      <div className="mt-16 bg-orange-900 rounded-3xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="p-8 md:p-12 text-center md:text-left">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Butuh Rekomendasi Alat?
            </h2>
            <p className="text-orange-200 text-lg mb-8">
              Jangan bingung memilih. Chat admin kami via WhatsApp untuk
              konsultasi alat baking yang paling cocok untuk kebutuhan Anda.
            </p>
            <a
              href="https://wa.me/6281284250718?text=Halo%20Admin,%20saya%20butuh%20rekomendasi%20alat%20baking"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium rounded-full text-orange-900 bg-white hover:bg-orange-50 transition-colors"
            >
              Chat Admin Sekarang
            </a>
          </div>
          <div className="relative h-64 md:h-full min-h-[300px]">
            <Image
              src="https://picsum.photos/seed/kitchen/800/600"
              alt="Kitchen Tools"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
