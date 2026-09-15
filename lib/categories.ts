// Some catalog rows use "Accessories" and others "Aksesoris" for the same
// bucket, and a few pan-shaped categories overlap ("Loyang", "Pan", "Pots &
// Pans"). Normalize display + filtering so /toko doesn't show duplicate
// chips for the same thing. Extend this map as more duplicates turn up in
// the live catalog -- it only needs one entry per synonym, not per product.
const CATEGORY_ALIASES: Record<string, string> = {
  accessories: 'Aksesoris',
};

export function normalizeCategory(raw: string | undefined | null): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  const alias = CATEGORY_ALIASES[trimmed.toLowerCase()];
  return alias || trimmed;
}
