"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { POLICIES } from "@/lib/policies";
import { trackConversion } from "@/lib/analytics";
import { parseIdr } from "@/lib/pixels";
import { waLink } from "@/lib/links";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface LeadFormModalProps {
  courseSlug: string;
  courseTitle: string;
  coursePrice?: string;
  onClose: () => void;
}

const PENDING_LEADS_KEY = "pending_leads";

function queuePendingLead(payload: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(PENDING_LEADS_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push(payload);
    localStorage.setItem(PENDING_LEADS_KEY, JSON.stringify(queue));
  } catch {}
}

// Module-level, not component state: LeadFormModal mounts twice on the
// course detail page (the sticky bar and the pricing panel each carry
// their own instance), and both run flushPendingLeads() on mount. Without
// this guard, two concurrent flushes can both read the same queued lead
// before either has written the drained queue back, double-posting it.
let flushInFlight = false;

async function flushPendingLeads() {
  if (flushInFlight) return;
  flushInFlight = true;
  try {
    const raw = localStorage.getItem(PENDING_LEADS_KEY);
    if (!raw) return;
    const queue: Record<string, unknown>[] = JSON.parse(raw);
    if (!queue.length) return;
    const remaining: Record<string, unknown>[] = [];
    for (const payload of queue) {
      const ok = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.ok)
        .catch(() => false);
      if (!ok) remaining.push(payload);
    }
    localStorage.setItem(PENDING_LEADS_KEY, JSON.stringify(remaining));
  } catch {
  } finally {
    flushInFlight = false;
  }
}

export default function LeadFormModal({ courseSlug, courseTitle, coursePrice, onClose }: LeadFormModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "done">("form");
  const emailInputRef = useRef<HTMLInputElement>(null);

  useBodyScrollLock(true);

  useEffect(() => {
    flushPendingLeads();
  }, []);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const waUrl = waLink(
    `Halo Cece Lina Chang, saya ingin daftar kursus: ${courseTitle}${coursePrice ? `\n- Harga: ${coursePrice}` : ""}\n\nBerikut data diri saya:\n- Email: ${email}\n- Nomor WhatsApp: ${phone}\n- Asal Kota: ${city || "-"}\n- User TikTok: ${tiktokHandle || "-"}\n\n${POLICIES.COURSE_REFUND_SHORT}\nMohon info rekening tujuan transfer ya Cece, saya siap kirim bukti bayarnya.`,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const payload = { courseSlug, courseTitle, email, phone, city, tiktokHandle, website };
    const pixelExtra = { contentName: courseTitle, contentType: "course" as const, value: parseIdr(coursePrice) };
    trackConversion("lead_form_submit", courseSlug, pixelExtra);

    // Open WhatsApp first (synchronous with the click) so mobile Safari never
    // blocks the popup while we wait on the network.
    window.open(waUrl, "_blank", "noopener,noreferrer");
    trackConversion("whatsapp_open", courseSlug, pixelExtra);

    const sent =
      typeof navigator.sendBeacon === "function"
        ? navigator.sendBeacon("/api/leads", new Blob([JSON.stringify(payload)], { type: "application/json" }))
        : false;

    if (!sent) {
      const ok = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.ok)
        .catch(() => false);
      if (!ok) queuePendingLead(payload);
    }

    setSubmitting(false);
    setStep("done");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center pt-20 sm:pt-4 sm:p-4 z-[100]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[calc(100dvh-5rem)] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-butter/30 shrink-0">
          <h2 id="lead-form-title" className="font-serif text-xl font-bold text-rust-ink">
            {step === "done" ? "Makasih ya! 🤎" : "Daftar Kelas"}
          </h2>
          <button
            onClick={onClose}
            className="tap-target flex items-center justify-center rounded-full text-charcoal-brown/40 hover:text-charcoal-brown/70 hover:bg-butter/15 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === "done" ? (
          <div className="p-6 space-y-4">
            <p className="text-sm text-charcoal-brown/70 leading-relaxed">
              WhatsApp-nya harusnya udah kebuka di tab baru. Kalau belum, tekan tombol di bawah ini.
            </p>
            <Button href={waUrl} external variant="whatsapp" size="lg" fullWidth>
              <WhatsAppIcon className="w-5 h-5 mr-2" /> Buka WhatsApp
            </Button>
            <p className="text-xs text-charcoal-brown/50 text-center">
              Aku juga kirim panduan singkat ke email kamu.
            </p>
            <Button type="button" onClick={onClose} variant="secondary" size="md" fullWidth>
              Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <p className="text-sm text-charcoal-brown/60">
              Isi data ini biar Cece bisa langsung proses pendaftaranmu di WhatsApp, nggak perlu ketik ulang.
            </p>

            <input
              type="text"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-charcoal-brown mb-1">Email</label>
              <input
                ref={emailInputRef}
                type="email"
                required
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-butter/50 rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta outline-none transition-all"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-brown mb-1">Nomor WhatsApp</label>
              <input
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3.5 border border-butter/50 rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta outline-none transition-all"
                placeholder="0812xxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-brown mb-1">Asal Kota (opsional)</label>
              <input
                type="text"
                autoComplete="address-level2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3.5 border border-butter/50 rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta outline-none transition-all"
                placeholder="Jakarta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-brown mb-1">User TikTok (opsional)</label>
              <input
                type="text"
                value={tiktokHandle}
                onChange={(e) => setTiktokHandle(e.target.value)}
                className="w-full px-4 py-3.5 border border-butter/50 rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta outline-none transition-all"
                placeholder="@username"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center px-6 py-4 text-lg font-bold rounded-full text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md disabled:opacity-60"
            >
              {submitting ? "Membuka WhatsApp…" : "Lanjut ke WhatsApp"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
