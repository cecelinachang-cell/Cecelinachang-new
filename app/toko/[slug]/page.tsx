import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import JsonLd from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/links';
import { productJsonLd } from '@/lib/productSchema';
import { findProductForParam, type SlugProduct } from '@/lib/productSlug';
import { getAllProducts, type Product } from '@/lib/products';
import { stripHtml } from '@/lib/utils';

export const revalidate = 60;

const loadProducts = cache(() => getAllProducts());

function parseImageUrls(url: string | undefined): string[] {
  if (!url) return [];
  try {
    const urls = JSON.parse(url);
    if (Array.isArray(urls)) return urls.filter((item): item is string => typeof item === 'string');
  } catch {
    // A single URL is stored as a plain string.
  }
  return [url];
}

async function resolveProduct(param: string): Promise<{ product: Product; slug: string } | null> {
  const products = await loadProducts();
  const direct = findProductForParam(products, param);
  if (direct) return direct;

  const { products: fallback } = await import('@/app/data/products');
  const aliases = fallback as unknown as SlugProduct[];
  const fromOldId = findProductForParam(products, param, aliases);
  if (fromOldId) return fromOldId;

  // Static-file ids such as "oven-de-luna" still render when that row is the
  // catalog (Supabase down) or when the live list has no product of that name.
  return findProductForParam(fallback as unknown as Product[], param);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const match = await resolveProduct(slug);

  if (!match) {
    return { title: 'Produk Tidak Ditemukan | Cece Lina Chang' };
  }

  const { product, slug: canonicalSlug } = match;
  const title = `${product.name} | Cece Lina Chang`;
  const description = product.description ? stripHtml(product.description).slice(0, 155) : undefined;
  const images = parseImageUrls(product.imageUrl);
  const canonical = `/toko/${canonicalSlug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
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
  const match = await resolveProduct(slug);
  if (!match) notFound();

  if (slug !== match.slug) {
    permanentRedirect(`/toko/${match.slug}`);
  }

  const schema = productJsonLd({ ...match.product, slug: match.slug });

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      <ProductDetail slug={match.product.id} initialProduct={match.product} />
    </>
  );
}
