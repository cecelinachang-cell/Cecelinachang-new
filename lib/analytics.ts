import { supabase } from '@/lib/supabase';

export type ConversionType = 'lead_form_open' | 'lead_form_submit' | 'whatsapp_open';

export function trackConversion(type: ConversionType, courseSlug?: string) {
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
}
