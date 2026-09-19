"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { normalizeCategory } from "@/lib/categories";
import { Button } from "@/components/ui/Button";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

const PAGE_SIZE = 12;

/**
 * Client island for /toko's interactive bits (category filter + "Muat lagi"
 * pagination). `products` arrives already fetched by the server component
 * (app/toko/page.tsx) so this never re-fetches on mount -- that would defeat
 * the SSR the split exists for.
 */
export default function TokoCatalog({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = useMemo(() => {
    const cats = new Set(["Semua"]);
    products.forEach((p) => {
      const normalized = normalizeCategory(p.category);
      if (normalized) cats.add(normalized);
    });
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Semua") return products;
    return products.filter((p) => normalizeCategory(p.category) === selectedCategory);
  }, [products, selectedCategory]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  function selectCategory(category: string) {
    setSelectedCategory(category);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <>
      {/* Category Filter */}
      <div className="flex sm:flex-wrap sm:justify-center gap-2 mb-8 sm:mb-12 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => selectCategory(category)}
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
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {visibleCount < filteredProducts.length && (
            <div className="mt-8 text-center">
              <Button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                variant="secondary"
                size="md"
                fullWidth
                className="sm:w-fit sm:mx-auto"
              >
                Muat {Math.min(PAGE_SIZE, filteredProducts.length - visibleCount)} produk lagi
              </Button>
              <p className="text-xs text-charcoal-brown/50 mt-2">
                Menampilkan {visibleProducts.length} dari {filteredProducts.length} produk
              </p>
            </div>
          )}
        </>
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
              onClick={() => selectCategory("Semua")}
              className="mt-6 px-6 py-2 bg-butter/30 text-rust-ink font-medium rounded-full hover:bg-butter/50 transition-colors"
            >
              Lihat Semua Produk
            </button>
          )}
        </div>
      )}
    </>
  );
}
