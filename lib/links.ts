export const WHATSAPP_NUMBER = '6281284250718';

/** Canonical host. The apex 308s to www, so every absolute URL we emit must be www. */
export const SITE_URL = 'https://www.cecelinachang.com';

/** Shop-wide Shopee store URL, used when a product has no specific Shopee link. */
export const SHOPEE_SHOP_URL =
  process.env.NEXT_PUBLIC_SHOPEE_SHOP_URL || 'https://shopee.co.id/cecelinachang';

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Per-product Shopee link, falling back to the shop URL when empty. */
export function shopeeLink(productUrl?: string | null): string {
  return productUrl?.trim() || SHOPEE_SHOP_URL;
}
