'use client';

import { useEffect } from 'react';
import { trackPixelEvent } from '@/lib/pixels';

interface ViewContentPingProps {
  contentId: string;
  contentName: string;
  contentType: 'course' | 'product';
  value?: number;
}

/**
 * Fires a ViewContent pixel event once when a course/product detail page
 * mounts. Renders nothing. Deliberately not wired through trackConversion
 * (which also writes a Supabase `conversions` row) -- a page view is not a
 * conversion, it just tells the ad platforms who is browsing what.
 */
export function ViewContentPing({ contentId, contentName, contentType, value }: ViewContentPingProps) {
  useEffect(() => {
    trackPixelEvent('ViewContent', { contentId, contentName, contentType, value });
    // Only fire once per mount -- ignore prop identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  return null;
}
