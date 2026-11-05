"use client";

import { useSyncExternalStore } from "react";
import { Lock } from "lucide-react";
import { trackConversion } from "@/lib/analytics";
import { lynkCheckoutUrl, withAdTags } from "@/lib/lynk";
import { parseIdr } from "@/lib/pixels";
import { cn } from "@/lib/utils";
import { QuizCta } from "./QuizCta";

// Nothing to subscribe to: the query string is read once per visit.
const subscribeNever = () => () => {};
const readSearch = () => window.location.search;

interface PayNowCtaProps {
  courseSlug: string;
  courseTitle: string;
  price: string;
  label?: string;
  className?: string;
  /** "bar" is the compact button inside the sticky bar. */
  variant?: "primary" | "bar";
  tabIndex?: number;
}

/**
 * Straight to the Lynk checkout: ad traffic pays in one tap, no quiz and no
 * form first. The Sept ad got ~960 page loads and 0 sales when every button
 * led to the quiz. Ad tags ride along (lib/lynk withAdTags) and the tap
 * reaches Meta as InitiateCheckout. Courses not on Lynk fall back to the form.
 */
export function PayNowCta({ courseSlug, courseTitle, price, label, className, variant = "primary", tabIndex }: PayNowCtaProps) {
  // Server render and hydration use the plain URL; the browser then adds the ad tags.
  const search = useSyncExternalStore(subscribeNever, readSearch, () => "");
  const base = lynkCheckoutUrl(courseSlug, "landing_page");
  const text = label ?? `Bayar Sekarang · ${price}`;

  if (!base) return <QuizCta href="#daftar" label={`Daftar kelasnya · ${price}`} className={className} />;

  return (
    <a
      href={withAdTags(base, search)}
      rel="noopener"
      tabIndex={tabIndex}
      onClick={() =>
        trackConversion("checkout_open", courseSlug, {
          contentName: courseTitle,
          contentType: "course",
          value: parseIdr(price),
        })
      }
      className={cn(
        "tap-target inline-flex items-center justify-center gap-2 rounded-xl text-center font-bold text-white transition-[transform,box-shadow] duration-150 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-mie motion-reduce:transition-none",
        variant === "primary"
          ? "min-h-14 bg-sambal px-6 py-4 text-base shadow-[0_6px_0_0_var(--color-sambal-deep)] active:translate-y-[3px] active:shadow-[0_3px_0_0_var(--color-sambal-deep)] sm:text-lg"
          : "min-h-12 flex-1 bg-sambal px-4 py-3 active:bg-sambal-deep",
        className,
      )}
    >
      <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
      {text}
    </a>
  );
}
