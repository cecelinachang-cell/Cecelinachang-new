import Link from "next/link";
import { normalizeCategory } from "@/lib/categories";
import { productPublicPath } from "@/lib/productSlug";
import type { Product } from "@/lib/products";

/**
 * Plain-link list of every product, grouped by category, rendered on the
 * server under the /toko grid. The grid only shows 12 products until
 * "Muat lagi" is tapped, so without this most product pages had no
 * crawlable link pointing at them -- Google could only find them through
 * the sitemap. It doubles as a quick A-Z for shoppers who know what they want.
 */
export default function ProductIndex({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const category = normalizeCategory(product.category) || "Lainnya";
    groups.set(category, [...(groups.get(category) ?? []), product]);
  }
  const sorted = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "id"));

  return (
    <nav aria-labelledby="product-index-title" className="mt-12 sm:mt-16 border-t border-butter/30 pt-8">
      <h2 id="product-index-title" className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-6">
        Semua Produk ({products.length})
      </h2>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
        {sorted.map(([category, items]) => (
          <section key={category} className="break-inside-avoid mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal-brown/60 mb-2">{category}</h3>
            <ul className="space-y-1">
              {[...items]
                .sort((a, b) => a.name.localeCompare(b.name, "id"))
                .map((product) => (
                  <li key={product.id}>
                    <Link
                      href={productPublicPath(product)}
                      className="text-sm text-charcoal-brown/80 hover:text-terracotta transition-colors"
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
