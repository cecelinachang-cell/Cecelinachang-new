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
  | 'video_play'
  | 'offline_upsell_shown'
  | 'offline_lead';

export interface ConversionExtra {
  contentId?: string;
  contentName?: string;
  contentType?: 'course' | 'product';
  value?: number;
}

const PIXEL_EVENT_MAP: Partial<Record<ConversionType, PixelEvent>> = {
  lead_form_open: 'InitiateCheckout',
  // The landing page has no "open the form" step: finishing the quiz is what
  // puts someone in front of it, so it carries the same mid-funnel signal.
  // Without this the ad platforms only see ViewContent, then nothing until a
  // completed Lead -- too sparse to optimise a cold audience on.
  quiz_complete: 'InitiateCheckout',
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

  const pixelEvent = PIXEL_EVENT_MAP[type];
  if (!pixelEvent) return;
  trackPixelEvent(pixelEvent, {
    contentId: extra?.contentId ?? courseSlug,
    contentName: extra?.contentName,
    contentType: extra?.contentType,
    value: extra?.value,
  });
}
