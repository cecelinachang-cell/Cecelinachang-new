import type { Metadata } from 'next';

// Fallback share image when a page has none of its own (the root layout swaps
// in the admin's hero image for the homepage).
export const DEFAULT_OG_IMAGE = 'https://i.postimg.cc/tCXKbMWY/image.png';

/**
 * Next.js replaces, not merges, a parent's openGraph/twitter objects, so a
 * page that sets only title/description still shares with the homepage's
 * og:url and og:title from the root layout. This builds the full set from
 * the page's own values.
 */
export function pageSocialMetadata(
  title: string,
  description: string,
  path: string,
): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'Cece Lina Chang',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Cece Lina Chang' }],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description, images: [DEFAULT_OG_IMAGE] },
  };
}
