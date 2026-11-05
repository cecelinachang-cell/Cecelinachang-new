"use client";

import { useEffect, useState } from "react";
import { WhatsAppAsk } from "./WhatsAppAsk";
import { PayNowCta } from "./PayNowCta";

/**
 * Mobile-only bar with the pay button (straight to the Lynk checkout). It stays hidden while the hero (which
 * has its own CTA) or the quiz is on screen, so it never doubles up a button
 * or covers the form's submit button.
 */
interface StickyQuizBarProps {
  price: string;
  courseSlug: string;
  courseTitle: string;
}

export function StickyQuizBar({ price, courseSlug, courseTitle }: StickyQuizBarProps) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [quizVisible, setQuizVisible] = useState(false);
  const hidden = heroVisible || quizVisible;

  useEffect(() => {
    // Same pattern as MobileCourseBar: lifts floating buttons above the bar.
    document.body.classList.add("has-sticky-cta");
    const hero = document.getElementById("lp-hero");
    const quiz = document.getElementById("cek");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) setHeroVisible(entry.isIntersecting);
          if (entry.target === quiz) setQuizVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.1 },
    );
    // The hero is always on the page; it starts in view, hence the true default.
    if (hero) observer.observe(hero);
    if (quiz) observer.observe(quiz);
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
