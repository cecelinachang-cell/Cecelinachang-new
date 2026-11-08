import { trackPixelCustom, trackPixelEvent, type PixelEvent } from '@/lib/pixels';

export type ConversionType =
  | 'lead_form_open'
  | 'lead_form_submit'
  | 'whatsapp_open'
  | 'shopee_open'
  // Online payment (the Lynk checkout, lib/lynk.ts).
  | 'checkout_open'
  | 'checkout_submit'
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
  checkout_open: 'InitiateCheckout',
  lead_form_submit: 'Lead',
  whatsapp_open: 'Contact',
  // Same ad signal as the quiz's WhatsApp hand-off; the separate type keeps
  // the two paths apart in the pixel reports.
  whatsapp_direct: 'Contact',
  shopee_open: 'AddToCart',
};

// Meta custom events that show where landing-page visitors drop off. Custom
// events never feed ad optimisation; they only appear in Events Manager.
const PIXEL_CUSTOM_MAP: Partial<Record<ConversionType, string>> = {
  video_play: 'LP_VideoPlay',
};

// Fires the ad pixels only. Conversions used to be written to the database
// too; that stopped with the move to Neon's free plan (a write per click would
// keep the database awake all day). The Meta/TikTok pixels still get them.
export function trackConversion(type: ConversionType, courseSlug?: string, extra?: ConversionExtra) {
  const custom = PIXEL_CUSTOM_MAP[type];
  if (custom) trackPixelCustom(custom, { contentId: extra?.contentId ?? courseSlug });
  const pixelEvent = PIXEL_EVENT_MAP[type];
  if (!pixelEvent) return;
  trackPixelEvent(pixelEvent, {
    contentId: extra?.contentId ?? courseSlug,
    contentName: extra?.contentName,
    contentType: extra?.contentType,
    value: extra?.value,
  });
}
