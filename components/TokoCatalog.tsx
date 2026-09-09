"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";

import { ShoppingBag } from "lucide-react";
import Faq from "@/components/Faq";
import { Button } from "@/components/ui/Button";
import { Marginalia } from "@/components/Marginalia";
import ProductCard, { type Product } from "@/components/ProductCard";

/**
 * Products are fetched on the server and passed in, so the full catalogue is
 * present in the initial HTML for crawlers. This component only owns the
 * category filter UI.
 */
export default function TokoCatalog({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

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
    <>
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
      {filteredProducts.length > 0 ? (
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
              alt="Alat masak dan alat baking Signora yang dipakai Cece Lina Chang"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      <Faq categories={["shipping", "refund"]} />
    </>
  );
}
