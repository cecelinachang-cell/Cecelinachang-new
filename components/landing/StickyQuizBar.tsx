"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

/**
 * Mobile-only bar that jumps to the quiz. It stays hidden while the hero (which
 * has its own CTA) or the quiz is on screen, so it never doubles up a button
 * or covers the form's submit button.
 */
export function StickyQuizBar({ label, price }: { label: string; price: string }) {
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
        <a
          href="#cek"
          tabIndex={hidden ? -1 : undefined}
          className="tap-target flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-sambal px-4 py-3 text-center font-bold text-white active:bg-sambal-deep"
        >
          {label} <ArrowDown className="h-5 w-5 shrink-0" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
