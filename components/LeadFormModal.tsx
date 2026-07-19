"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface LeadFormModalProps {
  courseSlug: string;
  courseTitle: string;
  onClose: () => void;
}

export default function LeadFormModal({ courseSlug, courseTitle, onClose }: LeadFormModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, courseTitle, email, phone, city, tiktokHandle, website }),
    }).catch(() => {});

    const message = `Halo Cece Lina Chang, saya ingin daftar kursus: ${courseTitle}\n\nBerikut data diri saya:\n- Email: ${email}\n- Nomor WhatsApp: ${phone}\n- Asal Kota: ${city}\n- User TikTok: ${tiktokHandle}\n\n(Mohon lampirkan foto bukti transfer di chat ini ya Cece)`;
    window.open(`https://wa.me/6281284250718?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-butter/30">
          <h2 className="font-serif text-xl font-bold text-rust-ink">Daftar Kelas</h2>
          <button onClick={onClose} className="text-charcoal-brown/40 hover:text-charcoal-brown/70" aria-label="Tutup">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-butter/50 rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta outline-none transition-all"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-brown mb-1">Nomor WhatsApp</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-butter/50 rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta outline-none transition-all"
              placeholder="0812xxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-brown mb-1">Asal Kota</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 border border-butter/50 rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta outline-none transition-all"
              placeholder="Jakarta"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-brown mb-1">User TikTok (opsional)</label>
            <input
              type="text"
              value={tiktokHandle}
              onChange={(e) => setTiktokHandle(e.target.value)}
              className="w-full px-4 py-2.5 border border-butter/50 rounded-xl focus:ring-2 focus:ring-terracotta focus:border-terracotta outline-none transition-all"
              placeholder="@username"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center px-6 py-3.5 text-lg font-bold rounded-full text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md disabled:opacity-60"
          >
            Lanjut ke WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
