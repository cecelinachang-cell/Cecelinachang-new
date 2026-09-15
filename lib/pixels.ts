// Thin wrapper around the TikTok + Meta pixels. No-ops safely when the
// pixel scripts haven't loaded (env IDs absent, ad-blocker, SSR) so call
// sites never need to guard — see components/Pixels.tsx for the loader.

export type PixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'Lead'
  | 'Contact'
  | 'AddToCart';

export interface PixelParams {
  contentId?: string;
  contentName?: string;
  contentType?: 'course' | 'product';
  value?: number;
  currency?: 'IDR';
}

export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
export const pixelsEnabled = Boolean(TIKTOK_PIXEL_ID || META_PIXEL_ID);

declare global {
  interface Window {
    ttq?: { track: (event: string, params?: Record<string, unknown>) => void; page: () => void };
    fbq?: (...args: unknown[]) => void;
  }
}

/** "Rp 299.000" -> 299000. Returns undefined for anything that doesn't parse. */
export function parseIdr(price?: string | null): number | undefined {
  if (!price) return undefined;
  const digits = price.replace(/\D/g, '');
  if (!digits) return undefined;
  const value = Number(digits);
  return Number.isFinite(value) ? value : undefined;
}

// TikTok has no "Lead" standard event; it uses "SubmitForm". Everything
// else shares a name across both platforms.
const TIKTOK_EVENT_NAME: Partial<Record<PixelEvent, string>> = {
  Lead: 'SubmitForm',
};

export function trackPixelEvent(event: PixelEvent, params: PixelParams = {}): void {
  try {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[pixel]', event, params);
    }

    const currency = params.currency || 'IDR';

    if (window.ttq) {
      const ttEvent = TIKTOK_EVENT_NAME[event] || event;
      window.ttq.track(ttEvent, {
        contents: [
          {
            content_id: params.contentId,
            content_name: params.contentName,
            content_type: params.contentType,
          },
        ],
        value: params.value,
        currency,
      });
    }

    if (window.fbq) {
      window.fbq('track', event, {
        content_ids: params.contentId ? [params.contentId] : undefined,
        content_name: params.contentName,
        content_type: params.contentType,
        value: params.value,
        currency,
      });
    }
  } catch {
    // Analytics must never break the page.
  }
}
