"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Midtrans sends the buyer back here as soon as they pay, often a few seconds
// before its notification has marked the order PAID. Re-render the server page
// for a couple of minutes so the status flips without a manual reload.
export function RefreshWhileUnpaid() {
  const router = useRouter();
  useEffect(() => {
    let ticks = 0;
    const id = window.setInterval(() => {
      ticks += 1;
      router.refresh();
      if (ticks >= 24) window.clearInterval(id);
    }, 5000);
    return () => window.clearInterval(id);
  }, [router]);
  return null;
}
