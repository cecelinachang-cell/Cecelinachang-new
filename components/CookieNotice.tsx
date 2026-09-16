'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookie-notice-dismissed';

/**
 * Soft, non-blocking disclosure -- doesn't gate the TikTok/Meta pixels
 * (see components/Pixels.tsx), just discloses them per Indonesia's PDP
 * Law and Meta/TikTok's own pixel terms. Positioned above the mobile
 * sticky CTA bar via --cookie-offset (app/globals.css) so it never
 * overlaps it.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // queueMicrotask: keeps this a reaction to the localStorage read
    // rather than an unconditional setState in the effect body (see the
    // same pattern in components/StickyCtaBar.tsx).
    queueMicrotask(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
      } catch {
        setVisible(true);
      }
    });
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Storage unavailable (private mode, blocked) -- notice just
      // reappears next visit, which is an acceptable fallback here.
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-4 z-[55] mx-auto max-w-md rounded-2xl border border-butter/40 bg-white px-4 py-3.5 shadow-[0_10px_30px_rgba(95,54,32,0.18)] sm:inset-x-auto sm:left-auto sm:right-6"
      style={{ bottom: 'var(--cookie-offset, 1rem)' }}
      role="region"
      aria-label="Pemberitahuan cookie"
    >
      <p className="text-xs leading-relaxed text-charcoal-brown/75">
        Website ini pakai cookie buat analitik &amp; biar iklan yang kamu lihat lebih relevan.{' '}
        <Link href="/kebijakan-privasi" className="font-semibold text-terracotta underline underline-offset-2">
          Kebijakan Privasi
        </Link>
      </p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={dismiss}
          className="tap-target rounded-full bg-rust-ink px-5 text-xs font-semibold text-white transition hover:bg-terracotta"
        >
          Oke, mengerti
        </button>
      </div>
    </div>
  );
}
