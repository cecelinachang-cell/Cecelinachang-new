"use client";

import { useState } from "react";
import LeadFormModal from "@/components/LeadFormModal";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { trackConversion } from "@/lib/analytics";
import { parseIdr } from "@/lib/pixels";
import { shopeeLink } from "@/lib/links";
import { lynkCheckoutUrl } from "@/lib/lynk";

interface Course {
  slug: string;
  title: string;
  price: string;
  originalPrice?: string;
  shopeeUrl?: string | null;
}

export function MobileCourseBar({ course }: { course: Course }) {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const lynkUrl = lynkCheckoutUrl(course.slug);

  return (
    <>
      <StickyCtaBar
        price={course.price}
        originalPrice={course.originalPrice}
        caption="akses seumur hidup"
        primary={
          lynkUrl
            ? {
                label: "Bayar Sekarang",
                icon: "arrow",
                href: lynkUrl,
                external: true,
                onClick: () =>
                  trackConversion("checkout_open", course.slug, {
                    contentName: course.title,
                    contentType: "course",
                    value: parseIdr(course.price),
                  }),
              }
            : {
                // Fallback for a course with no online checkout yet.
                label: "Chat Cece, Daftar",
                icon: "whatsapp",
                onClick: () => {
                  trackConversion("lead_form_open", course.slug, {
                    contentName: course.title,
                    contentType: "course",
                    value: parseIdr(course.price),
                  });
                  setShowLeadForm(true);
                },
              }
        }
        secondary={
          course.shopeeUrl
            ? {
                label: "Shopee",
                icon: "shopee",
                href: shopeeLink(course.shopeeUrl),
                external: true,
                onClick: () =>
                  trackConversion("shopee_open", course.slug, {
                    contentName: course.title,
                    contentType: "course",
                    value: parseIdr(course.price),
                  }),
              }
            : undefined
        }
      />

      {showLeadForm && (
        <LeadFormModal
          courseSlug={course.slug}
          courseTitle={course.title}
          coursePrice={course.price}
          onClose={() => setShowLeadForm(false)}
        />
      )}
    </>
  );
}
