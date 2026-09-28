'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookie-notice-dismissed';

/**
 * Soft, non-blocking disclosure -- doesn't gate the TikTok/Meta pixels
 * (see components/Pixels.tsx), just discloses them per Indonesia's PDP
 * Law and Meta/TikTok's own pixel terms. Positioned above the mobile
 * sticky CTA bar via --cookie-offset (app/globals.css) so it never
 * overlaps it.
 *
 * On /lp the card also stays hidden while the quiz/sign-up section is on
 * screen. "Daftar" scrolls that section up, and the card was landing on
 * top of "Lanjut ke WhatsApp".
 */
export function CookieNotice() {
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pastFirstScreen, setPastFirstScreen] = useState(false);
  const [quizInView, setQuizInView] = useState(false);
  const pathname = usePathname();
  // On an ad landing page the first screen is the pitch and its button; the
  // card landed right on top of that button. There it waits until the
  // visitor scrolls past the first screen.
  const waitForScroll = pathname.startsWith('/lp/');

  useEffect(() => {
    let stored = false;
    try {
      stored = Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      // Storage unavailable: show it, as before.
    }
    if (stored) {
      queueMicrotask(() => setDismissed(true));
      return;
    }
    queueMicrotask(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || dismissed || !waitForScroll) return;

    function onScroll() {
      if (window.scrollY < window.innerHeight) return;
      setPastFirstScreen(true);
      window.removeEventListener('scroll', onScroll);
    }
    if (window.scrollY >= window.innerHeight) queueMicrotask(() => setPastFirstScreen(true));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ready, dismissed, waitForScroll]);

  useEffect(() => {
    if (!ready || dismissed || !waitForScroll) return;
    const quiz = document.getElementById('cek');
    if (!quiz) return;
    const observer = new IntersectionObserver(
      ([entry]) => setQuizInView(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(quiz);
    return () => observer.disconnect();
  }, [ready, dismissed, waitForScroll]);

  const visible = ready && !dismissed && (!waitForScroll || (pastFirstScreen && !quizInView));

  function dismiss() {
    setDismissed(true);
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
