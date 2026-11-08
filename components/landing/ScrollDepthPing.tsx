"use client";

import { useEffect } from "react";
import { trackPixelCustom } from "@/lib/pixels";
import { newMilestones } from "@/lib/scrollDepth";

/**
 * Sends LP_Scroll25 / 50 / 75 / 100 to the Meta pixel (custom events) once
 * per page view, so Events Manager shows how far ad visitors read before
 * leaving. Custom events don't touch ad optimisation.
 */
export function ScrollDepthPing({ contentId }: { contentId: string }) {
  useEffect(() => {
    let seenTo = 0;
    let frame = 0;
    const check = () => {
      frame = 0;
      const doc = document.documentElement;
      const passed = newMilestones(window.scrollY + window.innerHeight, doc.scrollHeight, seenTo);
      for (const m of passed) trackPixelCustom(`LP_Scroll${m}`, { contentId });
      if (passed.length) seenTo = passed[passed.length - 1];
      if (seenTo >= 100) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [contentId]);

  return null;
}
