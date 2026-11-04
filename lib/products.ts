import { unstable_cache } from 'next/cache';
import { CACHE_SECONDS, TAGS, dbQuery, isDbConfigured } from '@/lib/db';
import { fetchProducts } from '@/lib/fetchProducts';
import { assignProductSlugs, slugifyProductName } from '@/lib/productSlug';

// Canonical Product shape, previously duplicated inside components/ProductCard.tsx
// (a 'use client' file). Living here lets server code (getAllProducts below,
// app/toko/page.tsx) import the type without pulling client-only code in, while
// ProductCard re-exports it so existing `import { type Product } from
// '@/components/ProductCard'` call sites keep working.
export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  category?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  createdAt?: string;
  shopeeUrl?: string | null;
  /** Public /toko segment. Set by getAllProducts from the product name. */
  slug?: string;
}

// Cached like lib/courses.ts's getAllCourses, so a page visit doesn't wake the
// database. Admin saves revalidate TAGS.items.
//
// timeoutMs is 3s (not fetchProducts's 20s default): this runs during SSR, and
// a cold database (a few seconds to wake) must not turn into a 20s TTFB.
export const getAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { products: fallback } = await import('@/app/data/products');
    const rows = await fetchProducts<Product>({
      isConfigured: isDbConfigured(),
      query: () => dbQuery<Product>((sql) => sql`select * from items order by "createdAt" desc`),
      fallback: fallback as unknown as Product[],
      timeoutMs: 3000,
    });
    const slugs = assignProductSlugs(rows);
    return rows.map((product) => ({
      ...product,
      slug: slugs.get(product.id) || slugifyProductName(product.name),
    }));
  },
  ['all-products'],
  { revalidate: CACHE_SECONDS, tags: [TAGS.items] },
);
