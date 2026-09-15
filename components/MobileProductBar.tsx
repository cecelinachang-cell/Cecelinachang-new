'use client';

import { StickyCtaBar } from '@/components/StickyCtaBar';
import { waLink, shopeeLink } from '@/lib/links';
import { trackConversion } from '@/lib/analytics';
import { parseIdr } from '@/lib/pixels';
import { POLICIES } from '@/lib/policies';

interface MobileProductBarProps {
  product: {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    shopeeUrl?: string | null;
  };
}

/**
 * The one persistent buy CTA for a product page. Unlike courses, products
 * stay one tap (no lead form) -- low ticket, admin handles the rest in the
 * WhatsApp chat itself.
 */
export function MobileProductBar({ product }: MobileProductBarProps) {
  const pixelExtra = {
    contentId: product.id,
    contentName: product.name,
    contentType: 'product' as const,
    value: parseIdr(product.price),
  };

  return (
    <StickyCtaBar
      price={product.price}
      originalPrice={product.originalPrice}
      caption={POLICIES.PRODUCT_WARRANTY_SHORT}
      primary={{
        label: 'Beli via WA',
        icon: 'whatsapp',
        href: waLink(`Halo Admin, saya mau beli ${product.name}`),
        external: true,
        onClick: () => trackConversion('whatsapp_open', undefined, pixelExtra),
      }}
      secondary={{
        label: 'Shopee',
        icon: 'shopee',
        href: shopeeLink(product.shopeeUrl),
        external: true,
        onClick: () => trackConversion('shopee_open', undefined, pixelExtra),
      }}
    />
  );
}
