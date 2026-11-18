"use client";

import { useEffect, useState } from "react";
import { WhatsAppAsk } from "./WhatsAppAsk";
import { PayNowCta } from "./PayNowCta";

/**
 * Mobile-only bar with the pay button (straight to the Lynk checkout). It stays hidden while the hero (which
 * has its own CTA), the quiz, or a section marked data-sticky-hide is on
 * screen, so it never doubles up a button or covers the form's submit button.
 */
interface StickyQuizBarProps {
  price: string;
  courseSlug: string;
  courseTitle: string;
}

export function StickyQuizBar({ price, courseSlug, courseTitle }: StickyQuizBarProps) {
  // Starts hidden: the hero is always on the page and starts in view.
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Same pattern as MobileCourseBar: lifts floating buttons above the bar.
    document.body.classList.add("has-sticky-cta");
    // The hero, the quiz, and anything marked data-sticky-hide (a section
    // with its own pay button, e.g. the last one on the plain page).
    const targets = [
      document.getElementById("lp-hero"),
      document.getElementById("cek"),
      ...document.querySelectorAll("[data-sticky-hide]"),
    ].filter((el): el is Element => el !== null);
    const inView = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        setHidden(inView.size > 0);
      },
      { threshold: 0.1 },
    );
    for (const target of targets) observer.observe(target);
    return () => {
      document.body.classList.remove("has-sticky-cta");
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] border-t border-steel-line bg-white/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur transition-transform duration-300 motion-reduce:transition-none ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
      aria-hidden={hidden}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <span className="shrink-0 font-display text-lg font-extrabold">{price}</span>
        <PayNowCta
          courseSlug={courseSlug}
          courseTitle={courseTitle}
          price={price}
          label="Bayar Sekarang"
          variant="bar"
          tabIndex={hidden ? -1 : undefined}
        />
        <WhatsAppAsk courseSlug={courseSlug} courseTitle={courseTitle} price={price} variant="icon" tabIndex={hidden ? -1 : undefined} />
      </div>
    </div>
  );
}
