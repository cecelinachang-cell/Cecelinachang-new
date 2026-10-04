/**
 * Public product URLs are /toko/<name-slug>. Live catalog ids are UUIDs and
 * the static fallback uses short ids like "oven-de-luna", so the slug is
 * derived from the name and stays the same for both sources.
 *
 * /toko/oven, /toko/signora, and /toko/peralatan-masak are real category
 * pages. A product slug must never take those paths.
 */

export const RESERVED_PRODUCT_SLUGS = new Set(['oven', 'signora', 'peralatan-masak']);

export type SlugProduct = { id: string; name: string; slug?: string | null };

export function slugifyProductName(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'produk';
}

function suffixFromId(id: string): string {
  const compact = id.toLowerCase().replace(/[^a-z0-9]/g, '');
  return compact.slice(-6) || 'item';
}

/** Stable slug per product. Same names get an id suffix so two rows never share a URL. */
export function assignProductSlugs<T extends SlugProduct>(products: T[]): Map<string, string> {
  const bases = products.map((product) => slugifyProductName(product.name));
  const counts = new Map<string, number>();
  for (const base of bases) counts.set(base, (counts.get(base) ?? 0) + 1);

  const assigned = new Map<string, string>();
  const used = new Set<string>();

  products.forEach((product, index) => {
    const base = bases[index];
    const needsSuffix = RESERVED_PRODUCT_SLUGS.has(base) || (counts.get(base) ?? 0) > 1;
    let slug = needsSuffix ? `${base}-${suffixFromId(product.id)}` : base;
    if (RESERVED_PRODUCT_SLUGS.has(slug) || used.has(slug)) {
      slug = `${base}-${suffixFromId(product.id)}-${compactTail(product.id)}`;
    }
    used.add(slug);
    assigned.set(product.id, slug);
  });

  return assigned;
}

function compactTail(id: string): string {
  const compact = id.toLowerCase().replace(/[^a-z0-9]/g, '');
  return compact.slice(-12) || 'item';
}

export function productPublicPath(product: SlugProduct): string {
  if (product.slug && !RESERVED_PRODUCT_SLUGS.has(product.slug)) {
    return `/toko/${product.slug}`;
  }
  const slug = assignProductSlugs([product]).get(product.id);
  return `/toko/${slug || slugifyProductName(product.name)}`;
}

export function productBrand(product: { name: string; category?: string | null }): string | undefined {
  const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
  return haystack.includes('signora') ? 'Signora' : undefined;
}

/**
 * Resolve a /toko/[param] value.
 * `products` is the catalog the page should render (live, or the static file
 * when Supabase is down). `aliases` is the static catalog, so an old
 * fallback id such as "oven-de-luna" still finds the live row with the same name.
 */
export function findProductForParam<T extends SlugProduct>(
  products: T[],
  param: string,
  aliases: SlugProduct[] = [],
): { product: T; slug: string } | null {
  const slugs = assignProductSlugs(products);
  const bySlug = products.find((product) => slugs.get(product.id) === param);
  if (bySlug) return { product: bySlug, slug: param };

  const byId = products.find((product) => product.id === param);
  if (byId) return { product: byId, slug: slugs.get(byId.id)! };

  if (aliases.length === 0) return null;
  const aliasSlugs = assignProductSlugs(aliases);
  const alias = aliases.find((product) => product.id === param || aliasSlugs.get(product.id) === param);
  if (!alias) return null;

  const name = alias.name.trim().toLowerCase();
  const twins = products.filter((product) => product.name.trim().toLowerCase() === name);
  if (twins.length === 1) return { product: twins[0], slug: slugs.get(twins[0].id)! };
  if (twins.length > 1) return null;

  // Not in the live catalog. Only render the static row when it is the catalog
  // we were given; otherwise the caller passes aliases separately and a missing
  // live twin should 404 rather than publish a second copy of a removed item.
  const aliasAsProduct = products.find((product) => product.id === alias.id);
  if (!aliasAsProduct) return null;
  return { product: aliasAsProduct, slug: slugs.get(aliasAsProduct.id)! };
}
