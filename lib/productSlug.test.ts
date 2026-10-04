import { describe, expect, it } from 'vitest';
import { products } from '@/app/data/products';
import {
  assignProductSlugs,
  findProductForParam,
  productPublicPath,
  RESERVED_PRODUCT_SLUGS,
  slugifyProductName,
} from './productSlug';

const luna = { id: '11111111-2222-4333-8444-555555555555', name: 'Signora Oven De Luna' };
const lunaFallback = { id: 'oven-de-luna', name: 'Signora Oven De Luna' };

describe('product slugs', () => {
  it('builds a readable slug from the product name', () => {
    expect(slugifyProductName('Signora Oven De Luna')).toBe('signora-oven-de-luna');
    expect(slugifyProductName('Signora Double Rectangle 3.2L')).toBe('signora-double-rectangle-3-2l');
  });

  it('keeps category routes reserved', () => {
    const slugs = assignProductSlugs([{ id: 'oven-row', name: 'Oven' }]);
    const slug = slugs.get('oven-row');
    expect(slug).toBeTruthy();
    expect(RESERVED_PRODUCT_SLUGS.has(slug!)).toBe(false);
    expect(slug!.startsWith('oven-')).toBe(true);
  });

  it('gives two products with the same name different slugs', () => {
    const slugs = assignProductSlugs([
      { id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', name: 'Signora Classic Pan' },
      { id: 'ffffffff-1111-4222-8333-444444444444', name: 'Signora Classic Pan' },
    ]);
    const a = slugs.get('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
    const b = slugs.get('ffffffff-1111-4222-8333-444444444444');
    expect(a).not.toBe(b);
    expect(a!.startsWith('signora-classic-pan-')).toBe(true);
    expect(b!.startsWith('signora-classic-pan-')).toBe(true);
  });

  it('resolves the live row from a uuid, the name slug, or the old fallback id', () => {
    const live = [luna];
    const byUuid = findProductForParam(live, luna.id, [lunaFallback]);
    const bySlug = findProductForParam(live, 'signora-oven-de-luna', [lunaFallback]);
    const byOldId = findProductForParam(live, 'oven-de-luna', [lunaFallback]);

    expect(byUuid).toEqual({ product: luna, slug: 'signora-oven-de-luna' });
    expect(bySlug).toEqual({ product: luna, slug: 'signora-oven-de-luna' });
    expect(byOldId).toEqual({ product: luna, slug: 'signora-oven-de-luna' });
  });

  it('assigns a unique public slug to every static catalog product', () => {
    const slugs = [...assignProductSlugs(products).values()];
    expect(new Set(slugs).size).toBe(products.length);
    for (const slug of slugs) {
      expect(RESERVED_PRODUCT_SLUGS.has(slug)).toBe(false);
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('uses the precomputed slug on cards when the catalog assigned one', () => {
    expect(productPublicPath({ ...luna, slug: 'signora-oven-de-luna' })).toBe('/toko/signora-oven-de-luna');
    expect(productPublicPath(lunaFallback)).toBe('/toko/signora-oven-de-luna');
  });
});
