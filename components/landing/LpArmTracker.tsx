'use client';

import { useEffect } from 'react';
import { trackPixelCustom } from '@/lib/pixels';
import type { LpArm } from '@/lib/lpSplit';

/**
 * Reports which split-test arm (lib/lpSplit.ts) the visitor saw: LP_View_A/B
 * once on load, LP_Checkout_A/B on every tap through to the Lynk checkout,
 * and utm_term=lp-a/lp-b on that link so Lynk orders show the arm too.
 * One capture-phase listener covers every "Bayar Sekarang" on the page,
 * including the sticky bar, without touching the buttons themselves.
 */
export function LpArmTracker({ arm, contentId }: { arm: LpArm; contentId: string }) {
  useEffect(() => {
    const label = arm.toUpperCase();
    trackPixelCustom(`LP_View_${label}`, { contentId });

    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.('a[href*="lynk.id"]') as HTMLAnchorElement | null;
      if (!link) return;
      try {
        const url = new URL(link.href);
        url.searchParams.set('utm_term', `lp-${arm}`);
        link.href = url.toString();
      } catch {
        // A malformed link still navigates; only the tag is lost.
      }
      trackPixelCustom(`LP_Checkout_${label}`, { contentId });
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [arm, contentId]);

  return null;
}
