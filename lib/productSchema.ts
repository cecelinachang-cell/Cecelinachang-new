import { absoluteUrl, STORE } from '@/lib/localStore';
import { parseIdr } from '@/lib/pixels';
import { productBrand, productPublicPath, type SlugProduct } from '@/lib/productSlug';
import type { Product } from '@/lib/products';
import { stripHtml } from '@/lib/utils';

function imageList(imageUrl: string | undefined): string[] {
  if (!imageUrl) return [];
  let urls: string[] = [];
  try {
    const parsed = JSON.parse(imageUrl);
    if (Array.isArray(parsed)) {
      urls = parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  } catch {
    urls = [imageUrl];
  }
  if (urls.length === 0 && imageUrl.trim()) urls = [imageUrl];

  return urls
    .map((url) => {
      const trimmed = url.trim();
      if (trimmed.includes('picsum.photos') || trimmed.includes('placehold')) return null;
      if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed;
      if (trimmed.startsWith('//')) return `https:${trimmed}`;
      if (trimmed.startsWith('/')) return absoluteUrl(trimmed);
      return null;
    })
    .filter((url): url is string => Boolean(url));
}

/**
 * Product rich-result markup for one product page.
 * Returns null when name, a real image, or a parseable price is missing.
 * No aggregateRating: the page does not show a review count we can stand behind.
 */
export function productJsonLd(product: Product & SlugProduct): Record<string, unknown> | null {
  const images = imageList(product.imageUrl);
  const price = parseIdr(product.price);
  if (!product.name?.trim() || images.length === 0 || price == null) return null;

  const url = absoluteUrl(productPublicPath(product));
  const description = product.description ? stripHtml(product.description).slice(0, 5000) : '';
  const brand = productBrand(product);

  const node: Record<string, unknown> = {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    image: images.length === 1 ? images[0] : images,
    sku: product.id,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'IDR',
      price: String(price),
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Store',
        name: STORE.name,
        url: absoluteUrl('/toko'),
      },
    },
  };

  if (description) node.description = description;
  if (brand) node.brand = { '@type': 'Brand', name: brand };

  return { '@context': 'https://schema.org', '@graph': [node] };
}
