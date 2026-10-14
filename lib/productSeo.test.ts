import { describe, expect, it } from 'vitest';
import { products } from '@/app/data/products';
import { productSeoDescription, productSeoTitle } from './productSeo';

describe('productSeoTitle', () => {
  it('adds the search words when they fit', () => {
    expect(productSeoTitle({ name: 'Signora Oven De Luna' })).toBe(
      'Signora Oven De Luna: Harga & Spesifikasi | Cece Lina Chang',
    );
  });

  it('falls back to shorter forms for long names', () => {
    expect(productSeoTitle({ name: 'Signora Slow Juicer Big Hopper' })).toBe(
      'Harga Signora Slow Juicer Big Hopper | Cece Lina Chang',
    );
    const long = 'Signora Double Rectangle Prasmanan 3.2L Stainless';
    expect(productSeoTitle({ name: long })).toBe(`${long} | Cece Lina Chang`);
  });
});

describe('productSeoDescription', () => {
  it('never ends mid-word and closes with warranty and shipping', () => {
    const description = productSeoDescription({
      name: 'Signora Oven De Luna',
      description:
        'Oven De Luna kapasitas 38 liter dengan timer hingga 60 menit dan suhu maksimal 250°C. Dilengkapi lampu oven terang untuk memudahkan pengawasan saat memanggang.',
    });
    expect(description.length).toBeLessThanOrEqual(155);
    expect(description).toMatch(/^Oven De Luna kapasitas 38 liter/);
    expect(description).toMatch(/Garansi resmi 1 tahun, kirim ke seluruh Indonesia\.$/);
    expect(description).not.toContain('memangg ');
    // Cut at the end of the first sentence rather than on a dangling "Dilengkapi…".
    expect(description).toBe(
      'Oven De Luna kapasitas 38 liter dengan timer hingga 60 menit dan suhu maksimal 250°C. Garansi resmi 1 tahun, kirim ke seluruh Indonesia.',
    );
  });

  it('strips HTML and handles an empty description', () => {
    expect(productSeoDescription({ name: 'Signora Skillet', description: '<p>Wajan <b>besi</b>.</p>' })).toBe(
      'Signora Skillet: Wajan besi. Garansi resmi 1 tahun, kirim ke seluruh Indonesia.',
    );
    expect(productSeoDescription({ name: 'Signora Skillet' })).toBe(
      'Signora Skillet dari toko Cece Lina Chang di Tangerang. Garansi resmi 1 tahun, kirim ke seluruh Indonesia.',
    );
  });

  it('gives every catalog product its own description, even where the copy is shared', () => {
    const seen = new Map<string, string>();
    for (const product of products) {
      const description = productSeoDescription(product);
      expect(seen.get(description), `${product.name} duplicates ${seen.get(description)}`).toBeUndefined();
      seen.set(description, product.name);
    }
  });

  it('keeps every catalog product inside Google display limits', () => {
    for (const product of products) {
      expect(productSeoTitle(product).length, product.name).toBeLessThanOrEqual(60);
      const description = productSeoDescription(product);
      expect(description.length, product.name).toBeLessThanOrEqual(155);
      expect(description, product.name).toMatch(/Indonesia\.$/);
    }
  });
});
