"use client";

import { Lock } from "lucide-react";
import { trackConversion } from "@/lib/analytics";
import { bundleCheckoutUrl } from "@/lib/bundles";
import { useAdSearch } from "@/lib/useAdSearch";
import { cn } from "@/lib/utils";

interface BundlePayCtaProps {
  bundleKey: string;
  lynkId: string;
  title: string;
  price: number;
  label: string;
  className?: string;
  /** "bar" is the compact button inside the sticky bar. */
  variant?: "primary" | "bar";
  tabIndex?: number;
}

/**
 * PayNowCta for a bundle: straight to the bundle's Lynk checkout, with the
 * visitor's ad tags carried along (lib/bundles bundleCheckoutUrl) and the tap
 * sent to Meta as InitiateCheckout. Same look as PayNowCta.
 */
export function BundlePayCta({ bundleKey, lynkId, title, price, label, className, variant = "primary", tabIndex }: BundlePayCtaProps) {
  // Server render and hydration use the plain link; the browser then adds any ad tags.
  const search = useAdSearch();

  return (
    <a
      href={bundleCheckoutUrl(lynkId, bundleKey, search)}
      rel="noopener"
      tabIndex={tabIndex}
      onClick={() =>
        trackConversion("checkout_open", `bundle-${bundleKey}`, {
          contentName: title,
          contentType: "course",
          value: price,
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
      {label}
    </a>
  );
}
