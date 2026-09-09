"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import LeadFormModal from "@/components/LeadFormModal";
import { trackConversion } from "@/lib/analytics";

interface Course {
  slug: string;
  title: string;
  price: string;
  originalPrice?: string;
}

export function MobileCourseBar({ course }: { course: Course }) {
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Nudge the floating WhatsApp/chatbot buttons up so they don't overlap
  // this bar on mobile — see components/whatsapp-button.tsx and chatbot-widget.tsx.
  useEffect(() => {
    document.body.classList.add("has-sticky-cta");
    return () => document.body.classList.remove("has-sticky-cta");
  }, []);

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-butter/30 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <div className="flex flex-col shrink-0">
            {course.originalPrice && (
              <span className="text-charcoal-brown/40 line-through text-xs">{course.originalPrice}</span>
            )}
            <span className="font-serif text-lg font-bold text-rust-ink leading-tight">{course.price}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              trackConversion('lead_form_open', course.slug);
              setShowLeadForm(true);
            }}
            className="tap-target flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 py-3.5 shadow-md transition-colors"
          >
            <MessageCircle className="w-5 h-5" /> Chat Cece, Daftar
          </button>
        </div>
      </div>

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
