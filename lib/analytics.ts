import { trackMeta } from '@/lib/meta-pixel';
import { supabase } from '@/lib/supabase';

export type ConversionType = 'lead_form_open' | 'lead_form_submit' | 'whatsapp_open' | 'quiz_start' | 'quiz_complete' | 'video_play';

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

  // Opening the form is not a conversion. Submit and the WhatsApp handoff are.
  const content = courseSlug ? { content_name: courseSlug } : undefined;
  if (type === 'lead_form_submit') trackMeta('Lead', content);
  if (type === 'whatsapp_open') trackMeta('Contact', content);
}
