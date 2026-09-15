'use client';

import { MotionConfig } from 'motion/react';

/**
 * reducedMotion="user" makes every motion/react animation in the app
 * respect prefers-reduced-motion automatically (transforms are skipped,
 * opacity transitions still play) -- one line instead of auditing each
 * animated component individually.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
