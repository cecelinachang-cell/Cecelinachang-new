import { supabase } from '@/lib/supabase';
import { trackPixelEvent, type PixelEvent } from '@/lib/pixels';

export type ConversionType = 'lead_form_open' | 'lead_form_submit' | 'whatsapp_open' | 'shopee_open';

export interface ConversionExtra {
  contentId?: string;
  contentName?: string;
  contentType?: 'course' | 'product';
  value?: number;
}

const PIXEL_EVENT_MAP: Record<ConversionType, PixelEvent> = {
  lead_form_open: 'InitiateCheckout',
  lead_form_submit: 'Lead',
  whatsapp_open: 'Contact',
  shopee_open: 'AddToCart',
};

export function trackConversion(type: ConversionType, courseSlug?: string, extra?: ConversionExtra) {
  try {
    const sessionId = sessionStorage.getItem('analytics_session_id') || 'unknown';
    supabase
      .from('conversions')
      .insert({
        type,
        course_slug: courseSlug || null,
        path: window.location.pathname,
        session_id: sessionId,
      })
      .then(() => {});
  } catch {}

  trackPixelEvent(PIXEL_EVENT_MAP[type], {
    contentId: extra?.contentId ?? courseSlug,
    contentName: extra?.contentName,
    contentType: extra?.contentType,
    value: extra?.value,
  });
}
