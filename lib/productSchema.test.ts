import { describe, expect, it } from 'vitest';
import { productJsonLd } from './productSchema';
import type { Product } from './products';

const oven: Product = {
  id: '11111111-2222-4333-8444-555555555555',
  name: 'Signora Oven De Luna',
  price: 'Rp 1.638.000',
  imageUrl: '["/images/products/oven-de-luna/oven.jpg"]',
  description: '<p>Oven 38 liter.</p>',
  category: 'Oven',
  slug: 'signora-oven-de-luna',
};

describe('productJsonLd', () => {
  it('marks up the visible name, image, and price without a rating', () => {
    const data = productJsonLd(oven);
    expect(data).not.toBeNull();
    const graph = data!['@graph'] as Record<string, unknown>[];
    const product = graph[0];
    expect(product['@type']).toBe('Product');
    expect(product.name).toBe('Signora Oven De Luna');
    expect(product.image).toBe('https://www.cecelinachang.com/images/products/oven-de-luna/oven.jpg');
    expect(product.url).toBe('https://www.cecelinachang.com/toko/signora-oven-de-luna');
    expect(product).not.toHaveProperty('aggregateRating');
    expect(product.brand).toEqual({ '@type': 'Brand', name: 'Signora' });
    expect(product.offers).toMatchObject({
      priceCurrency: 'IDR',
      price: '1638000',
      availability: 'https://schema.org/InStock',
    });
  });

  it('skips markup when the image is a placeholder or the price is missing', () => {
    expect(productJsonLd({ ...oven, imageUrl: 'https://picsum.photos/seed/x/800' })).toBeNull();
    expect(productJsonLd({ ...oven, price: '' })).toBeNull();
  });

  it('omits the brand when the product is not Signora', () => {
    const data = productJsonLd({ ...oven, name: 'Panci Rumah', category: 'Panci', slug: 'panci-rumah' });
    const product = (data!['@graph'] as Record<string, unknown>[])[0];
    expect(product).not.toHaveProperty('brand');
  });
});
