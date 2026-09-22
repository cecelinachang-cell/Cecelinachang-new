export const META_PIXEL_ID = '2143905827004136';

type MetaStandardEvent = 'PageView' | 'Lead' | 'Contact';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Staff sessions stay out of the ad account. */
export function isMetaPixelPath(pathname: string) {
  return !pathname.startsWith('/admin');
}

/**
 * Standard Meta events only. Name, email, and phone are never sent —
 * the pixel reads the page URL itself.
 */
export function trackMeta(event: MetaStandardEvent, params?: Record<string, string>) {
  if (typeof window === 'undefined') return;
  if (!isMetaPixelPath(window.location.pathname)) return;
  try {
    window.fbq?.('track', event, params);
  } catch {
    // Blocked or not loaded yet. First-party analytics still records the action.
  }
}
