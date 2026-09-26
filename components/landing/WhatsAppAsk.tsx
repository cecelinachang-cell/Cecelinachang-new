"use client";

import { MessageCircle } from "lucide-react";
import { trackConversion } from "@/lib/analytics";
import { waLink } from "@/lib/links";
import { parseIdr } from "@/lib/pixels";
import { cn } from "@/lib/utils";

interface WhatsAppAskProps {
  courseSlug: string;
  courseTitle: string;
  price: string;
  /** "button" is the full-width hero button; "icon" the square one in the sticky bar. */
  variant?: "button" | "icon";
  className?: string;
  tabIndex?: number;
}

/** The pre-filled chat ends on "Nama saya: " so the visitor's first line tells Cece who they are. */
export function askMessage(courseTitle: string, price: string): string {
  return `Halo Cece, saya mau tanya dulu soal ${courseTitle} (${price}).\n\nNama saya: `;
}

/**
 * Direct line to Cece for visitors who won't do the quiz. A plain link, so the
 * in-app browsers hand it to WhatsApp natively; the tap is tracked on the way
 * out and reaches Meta as Contact, the event the next campaign optimises on.
 */
export function WhatsAppAsk({ courseSlug, courseTitle, price, variant = "button", className, tabIndex }: WhatsAppAskProps) {
  function track() {
    trackConversion("whatsapp_direct", courseSlug, {
      contentName: courseTitle,
      contentType: "course",
      value: parseIdr(price),
    });
  }

  const href = waLink(askMessage(courseTitle, price));

  if (variant === "icon") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={track}
        tabIndex={tabIndex}
        aria-label="Tanya Cece di WhatsApp"
        className={cn(
          "tap-target flex min-h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-seledri text-seledri active:bg-seledri/10",
          className,
        )}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      className={cn(
        "tap-target inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-seledri bg-white px-4 py-3 text-center font-bold text-seledri transition-colors hover:bg-seledri/5 active:bg-seledri/10",
        className,
      )}
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      Tanya Cece
    </a>
  );
}
