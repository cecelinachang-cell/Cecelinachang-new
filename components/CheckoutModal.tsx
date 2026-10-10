"use client";

import { useEffect, useRef, useState } from "react";
import { X, Lock } from "lucide-react";
import { POLICIES } from "@/lib/policies";
import { trackConversion } from "@/lib/analytics";
import { identifyForPixels } from "@/lib/pixelMatch";
import { parseIdr } from "@/lib/pixels";
import { isValidIndonesianPhone, suggestEmailFix } from "@/lib/leadValidation";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface CheckoutModalProps {
  courseSlug: string;
  courseTitle: string;
  coursePrice: string;
  onClose: () => void;
}

const inputClass =
  "w-full px-4 py-3.5 border border-butter/50 rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta outline-none transition-all";

export default function CheckoutModal({ courseSlug, courseTitle, coursePrice, onClose }: CheckoutModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useBodyScrollLock(true);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  const emailFix = suggestEmailFix(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!isValidIndonesianPhone(phone)) {
      setError("Nomor WhatsApp belum benar (contoh: 0812xxxxxxx).");
      return;
    }
    setError(null);
    setSubmitting(true);

    await identifyForPixels({ email, phone });
    trackConversion("checkout_submit", courseSlug, {
      contentName: courseTitle,
      contentType: "course",
      value: parseIdr(coursePrice),
    });

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, name, email, phone }),
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { ok?: boolean; checkoutUrl?: string; error?: string } | null;

    if (json?.ok && json.checkoutUrl) {
      // Same tab: the Midtrans payment page sends the buyer back to /pembayaran/<ref>.
      window.location.href = json.checkoutUrl;
      return;
    }
    setError(json?.error || "Koneksi bermasalah. Coba lagi sebentar.");
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center pt-20 sm:pt-4 sm:p-4 z-[100]"
      onClick={submitting ? undefined : onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[calc(100dvh-5rem)] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-butter/30 shrink-0">
          <div>
            <h2 id="checkout-title" className="font-serif text-xl font-bold text-rust-ink">
              Bayar Kelas
            </h2>
            <p className="text-sm text-charcoal-brown/60">
              {courseTitle} · <strong className="text-charcoal-brown">{coursePrice}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="tap-target flex items-center justify-center rounded-full text-charcoal-brown/40 hover:text-charcoal-brown/70 hover:bg-butter/15 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="checkout-name" className="block text-sm font-medium text-charcoal-brown mb-1">
              Nama
            </label>
            <input
              id="checkout-name"
              ref={nameInputRef}
              type="text"
              required
              minLength={2}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label htmlFor="checkout-email" className="block text-sm font-medium text-charcoal-brown mb-1">
              Email (akses video dikirim ke sini)
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="nama@gmail.com"
            />
            {emailFix && (
              <button
                type="button"
                onClick={() => setEmail(emailFix)}
                className="mt-1 text-sm text-terracotta hover:text-rust-ink"
              >
                Maksudnya <strong>{emailFix}</strong>?
              </button>
            )}
          </div>
          <div>
            <label htmlFor="checkout-phone" className="block text-sm font-medium text-charcoal-brown mb-1">
              Nomor WhatsApp
            </label>
            <input
              id="checkout-phone"
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="0812xxxxxxx"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center px-6 py-4 text-lg font-bold rounded-full text-white bg-terracotta hover:bg-rust-ink transition-colors shadow-md disabled:opacity-60"
          >
            <Lock className="w-5 h-5 mr-2" />
            {submitting ? "Menyiapkan pembayaran…" : `Bayar ${coursePrice}`}
          </button>
          <p className="text-xs text-charcoal-brown/50 text-center">
            Pilih QRIS, GoPay, ShopeePay atau Virtual Account di halaman berikutnya. Pembayaran diproses aman oleh Midtrans. {POLICIES.COURSE_REFUND_SHORT}
          </p>
        </form>
      </div>
    </div>
  );
}
