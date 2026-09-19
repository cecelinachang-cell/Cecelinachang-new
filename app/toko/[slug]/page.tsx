import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Metadata } from 'next';
import ProductDetail from '@/components/ProductDetail';
import { stripHtml } from '@/lib/utils';
import { SITE_URL } from '@/lib/links';

export const revalidate = 60;

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  category: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  isBundle?: boolean;
  description?: string;
  shopeeUrl?: string | null;
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

// Next 15 doesn't cache fetch() by default and supabase-js's internal
// fetch doesn't opt in, so wrap the lookup ourselves -- otherwise this page
// always renders dynamically despite `revalidate`.
//
// Wrapped in React's cache() too: generateMetadata() and the page both
// call this, and without per-request dedup they race as separate streams
// (metadata vs body), which throws React error #419 in production on real
// networks -- see the identical fix/comment in app/kursus/[slug]/page.tsx.
const getProduct = cache(unstable_cache(
  async (slug: string): Promise<Product | null> => {
    try {
      if (!isSupabaseConfigured()) {
        const { products: fallbackProducts } = await import('@/app/data/products');
        return (fallbackProducts.find((p: any) => p.id === slug) as unknown as Product) || null;
      }

      const { data, error } = await supabase.from('items').select('*').eq('id', slug).single();
      if (error || !data) {
        const { products: fallbackProducts } = await import('@/app/data/products');
        return (fallbackProducts.find((p: any) => p.id === slug) as unknown as Product) || null;
      }
      return data as Product;
    } catch {
      const { products: fallbackProducts } = await import('@/app/data/products');
      return (fallbackProducts.find((p: any) => p.id === slug) as unknown as Product) || null;
    }
  },
  ['product-by-slug'],
  { revalidate: 60 }
));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Produk Tidak Ditemukan | Cece Lina Chang' };
  }

  const title = `${product.name} | Cece Lina Chang`;
  const description = product.description ? stripHtml(product.description).slice(0, 155) : undefined;
  const images = parseImageUrls(product.imageUrl);

  return {
    title,
    description,
    alternates: {
      canonical: `/toko/${product.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/toko/${product.id}`,
      siteName: 'Cece Lina Chang',
      images: images.length > 0 ? [{ url: images[0], width: 1200, height: 630, alt: product.name }] : undefined,
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length > 0 ? [images[0]] : undefined,
    },
  };
}

export default async function TokoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
