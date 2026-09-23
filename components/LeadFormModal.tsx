"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { flushPendingLeads, submitLead } from "@/lib/submitLead";

interface LeadFormModalProps {
  courseSlug: string;
  courseTitle: string;
  coursePrice?: string;
  onClose: () => void;
}

export default function LeadFormModal({ courseSlug, courseTitle, coursePrice, onClose }: LeadFormModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    flushPendingLeads();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // Close right away; the save finishes (or queues itself) in the background.
    const saving = submitLead({ courseSlug, courseTitle, coursePrice, email, phone, city, tiktokHandle, website });
    onClose();
    await saving;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center pt-20 sm:pt-4 sm:p-4 z-[100]">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[calc(100dvh-5rem)] sm:max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-butter/30 shrink-0">
          <h2 className="font-serif text-xl font-bold text-rust-ink">Daftar Kelas</h2>
          <button
            onClick={onClose}
            className="text-charcoal-brown/40 hover:text-charcoal-brown/70 p-2 -m-2"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
            Lanjut ke WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
