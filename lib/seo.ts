/**
 * Shared SEO helpers.
 *
 * Follows Google's SEO Starter Guide: one canonical per page, unique titles and
 * descriptions, absolute URLs everywhere, and structured data that describes
 * what the page actually shows.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://cecelinachang.com';

export const SITE_NAME = 'Cece Lina Chang';

export const DEFAULT_OG_IMAGE = 'https://i.postimg.cc/tCXKbMWY/image.png';

/** Turns a site-relative path (or an already absolute URL) into an absolute URL. */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Trims a description to a length search engines actually display, cutting on a
 * word boundary so snippets do not end mid-word.
 */
export function clampDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\s]+$/, '')}…`;
}

/** "Rp 1.938.000" -> "1938000". Returns undefined when no digits are present. */
export function parsePriceValue(price?: string): string | undefined {
  if (!price) return undefined;
  const digits = price.replace(/[^\d]/g, '');
  return digits.length > 0 ? digits : undefined;
}

/** Product image columns hold either a JSON array of URLs or a single URL. */
export function parseImageUrls(url?: string | null): string[] {
  if (!url) return [];
  try {
    const parsed = JSON.parse(url);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // Not JSON — treat it as a single URL.
  }
  return [url];
}

type BreadcrumbEntry = { name: string; path: string };

/** BreadcrumbList structured data — helps Google show the site hierarchy in results. */
export function breadcrumbJsonLd(entries: BreadcrumbEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

/** ItemList structured data for listing pages (course catalogue, shop). */
export function itemListJsonLd(name: string, urls: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: urls.map((url, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(url),
    })),
  };
}
