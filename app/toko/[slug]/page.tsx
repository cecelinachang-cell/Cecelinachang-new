import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { stripHtml } from '@/lib/utils';
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  clampDescription,
  parsePriceValue,
} from '@/lib/seo';

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

/**
 * Prerender every known product so the Product JSON-LD ships in the initial
 * HTML rather than only in the streamed Flight payload. Unknown ids still
 * render on demand, and `revalidate` above keeps these pages fresh.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('items').select('id');
      if (data && data.length > 0) {
        return data.filter((row: any) => row.id).map((row: any) => ({ slug: String(row.id) }));
      }
    }
  } catch {
    // Fall through to the bundled seed data.
  }

  const { products: fallbackProducts } = await import('@/app/data/products');
  return fallbackProducts.map((product: any) => ({ slug: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Produk Tidak Ditemukan', robots: { index: false, follow: true } };
  }

  const title = product.name;
  const description = product.description
    ? clampDescription(stripHtml(product.description))
    : `${product.name} — alat baking Signora pilihan Cece Lina Chang. Konsultasi gratis via WhatsApp sebelum membeli.`;
  const images = parseImageUrls(product.imageUrl).map(absoluteUrl);

  return {
    title,
    description,
    alternates: { canonical: `/toko/${product.id}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/toko/${product.id}`,
      siteName: SITE_NAME,
      images: images.length > 0 ? [{ url: images[0], width: 1200, height: 630, alt: product.name }] : undefined,
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: images.length > 0 ? [images[0]] : undefined,
    },
  };
}

export default async function TokoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const priceValue = parsePriceValue(product.price);
  const structuredData = [
    breadcrumbJsonLd([
      { name: 'Beranda', path: '/' },
      { name: 'Toko Alat Baking', path: '/toko' },
      { name: product.name, path: `/toko/${product.id}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description
        ? clampDescription(stripHtml(product.description), 300)
        : undefined,
      image: parseImageUrls(product.imageUrl).map(absoluteUrl),
      category: product.category,
      brand: { '@type': 'Brand', name: 'Signora' },
      ...(priceValue
        ? {
            offers: {
              '@type': 'Offer',
              price: priceValue,
              priceCurrency: 'IDR',
              availability: 'https://schema.org/InStock',
              url: `${SITE_URL}/toko/${product.id}`,
              seller: { '@id': `${SITE_URL}/#organization` },
            },
          }
        : {}),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductDetail slug={slug} initialProduct={product} />
    </>
  );
}
