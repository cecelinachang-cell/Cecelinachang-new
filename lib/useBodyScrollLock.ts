'use client';

import { useEffect } from 'react';

/**
 * Locks background scroll while `active` is true, restoring whatever
 * overflow value was on <body> before. Extracted from components/navbar.tsx's
 * mobile-menu lock so every overlay (nav menu, lead form modal, chatbot
 * panel) shares one implementation.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
