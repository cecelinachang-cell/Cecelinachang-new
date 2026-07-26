"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { products as fallbackProducts } from "@/app/data/products";
import { AnimatePresence } from "motion/react";

import { ShoppingBag } from "lucide-react";
import Faq from "@/components/Faq";
import { Button } from "@/components/ui/Button";
import { Marginalia } from "@/components/Marginalia";
import ProductCard, { type Product } from "@/components/ProductCard";

export default function TokoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setProducts(fallbackProducts as unknown as Product[]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("items")
          .select("*")
          .order("createdAt", { ascending: false });

        if (error) {
          const errMsg = error?.message || (error as any)?.toString() || '';
          if (errMsg.includes("schema cache")) {
            console.warn("Supabase schema not initialized yet.");
          } else if (errMsg !== "Failed to fetch" && !errMsg.includes("Failed to fetch")) {
            console.error("Error fetching items:", errMsg);
          }
          setProducts(fallbackProducts as unknown as Product[]);
        } else if (!data || data.length === 0) {
          setProducts(fallbackProducts as unknown as Product[]);
        } else {
          setProducts(data as Product[]);
        }
      } catch (err: any) {
        const errMsg = err?.message || err?.toString() || '';
        if (errMsg !== "Failed to fetch" && !errMsg.includes("Failed to fetch")) {
          console.error("Network or unexpected error fetching products:", err);
        }
        setProducts(fallbackProducts as unknown as Product[]);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-fluid-h1 font-serif font-bold text-rust-ink mb-2 sm:mb-4">
          Toko Alat Baking Signora
        </h1>
        <Marginalia rotate={-2} className="block mb-3">
          alat yang beneran aku pakai sendiri, bukan sekedar endorse
        </Marginalia>
        <p className="text-base sm:text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
          Alat yang saya pakai sendiri di setiap video, biar hasil baking Anda
          anti gagal juga.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex sm:flex-wrap sm:justify-center gap-2 mb-8 sm:mb-12 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`tap-target shrink-0 px-5 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-terracotta text-white shadow-md scale-105"
                : "bg-white text-charcoal-brown/70 border border-butter/40 hover:border-terracotta/50 hover:text-terracotta"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden animate-pulse flex flex-col"
            >
              <div className="w-full aspect-square sm:h-64 bg-stone-200"></div>
              <div className="p-4 sm:p-6 flex flex-col flex-grow space-y-3">
                <div className="h-6 bg-stone-200 rounded w-3/4"></div>
                <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                <div className="h-6 bg-stone-200 rounded w-1/2 mt-auto"></div>
                <div className="h-10 bg-stone-200 rounded-xl w-full"></div>
                <div className="h-10 bg-stone-200 rounded-xl w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-24 bg-butter/10 rounded-3xl border border-butter/30">
          <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal-brown mb-2">
            Belum Ada Produk
          </h2>
          <p className="text-charcoal-brown/60 max-w-md mx-auto">
            {selectedCategory === "Semua"
              ? "Produk sedang diperbarui. Kembali lagi sebentar lagi, ya."
              : `Belum ada produk di kategori "${selectedCategory}".`}
          </p>
          {selectedCategory !== "Semua" && (
            <button
              onClick={() => setSelectedCategory("Semua")}
              className="mt-6 px-6 py-2 bg-butter/30 text-rust-ink font-medium rounded-full hover:bg-butter/50 transition-colors"
            >
              Lihat Semua Produk
            </button>
          )}
        </div>
      )}

      {/* Banner Promo */}
      <div className="mt-10 sm:mt-16 bg-rust-ink rounded-3xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="p-6 sm:p-8 md:p-12 text-center md:text-left">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Butuh Rekomendasi Alat?
            </h2>
            <p className="text-butter/90 text-base sm:text-lg mb-6 sm:mb-8">
              Jangan bingung memilih. Chat admin kami via WhatsApp — respon
              cepat, gratis konsultasi alat baking yang cocok untuk kebutuhan
              Anda.
            </p>
            <Button
              href="https://wa.me/6281284250718?text=Halo%20Admin,%20saya%20butuh%20rekomendasi%20alat%20baking"
              external
              variant="secondary"
              size="lg"
              fullWidth
              className="sm:w-fit bg-white text-rust-ink border-transparent hover:bg-butter/15"
            >
              Chat Admin Sekarang
            </Button>
          </div>
          <div className="relative h-56 sm:h-64 md:h-full min-h-[240px] md:min-h-[300px]">
            <Image
              src="/images/bakso-sapi-premium.png"
              alt="Alat Masak Signora"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      <Faq categories={["shipping", "refund"]} />
    </div>
  );
}
