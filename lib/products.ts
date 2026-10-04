import { unstable_cache } from 'next/cache';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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

// Same pattern as lib/courses.ts's getAllCourses: Next 15 doesn't cache fetch()
// by default and supabase-js's internal fetch doesn't opt in, so a page's
// `revalidate = 60` caches nothing on its own -- wrap the fetch.
//
// timeoutMs is 3s (not fetchProducts's 20s default): this now runs during SSR,
// so a slow Supabase must not turn a fast skeleton into a 20s TTFB.
export const getAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { products: fallback } = await import('@/app/data/products');
    const rows = await fetchProducts<Product>({
      isConfigured: isSupabaseConfigured(),
      query: () => supabase.from('items').select('*').order('createdAt', { ascending: false }),
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
  { revalidate: 60 },
);
