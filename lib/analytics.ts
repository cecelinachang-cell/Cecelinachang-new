import { supabase } from '@/lib/supabase';
import { trackPixelEvent, type PixelEvent } from '@/lib/pixels';

export type ConversionType =
  | 'lead_form_open'
  | 'lead_form_submit'
  | 'whatsapp_open'
  | 'shopee_open'
  // Landing-page funnel (app/lp).
  | 'quiz_start'
  | 'quiz_complete'
  // A "Daftar" button that skips the quiz straight to the form.
  | 'quiz_skip'
  | 'video_play'
  | 'offline_upsell_shown'
  | 'offline_lead'
  // Landing-page "ask first" WhatsApp button, which skips the quiz.
  | 'whatsapp_direct';

export interface ConversionExtra {
  contentId?: string;
  contentName?: string;
  contentType?: 'course' | 'product';
  value?: number;
}

const PIXEL_EVENT_MAP: Partial<Record<ConversionType, PixelEvent>> = {
  lead_form_open: 'InitiateCheckout',
  lead_form_submit: 'Lead',
  whatsapp_open: 'Contact',
  // Same ad signal as the quiz's WhatsApp hand-off; the separate type keeps
  // the two paths apart in the conversions table.
  whatsapp_direct: 'Contact',
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

  const pixelEvent = PIXEL_EVENT_MAP[type];
  if (!pixelEvent) return;
  trackPixelEvent(pixelEvent, {
    contentId: extra?.contentId ?? courseSlug,
    contentName: extra?.contentName,
    contentType: extra?.contentType,
    value: extra?.value,
  });
}
