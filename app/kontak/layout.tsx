import type { Metadata } from "next";

// app/kontak/page.tsx is 'use client' and can't export `metadata` itself,
// so it lives in this sibling layout instead.
export const metadata: Metadata = {
  title: "Kontak | Cece Lina Chang",
  description:
    "Ada pertanyaan soal kelas baking atau alat Signora? Hubungi Cece Lina Chang lewat WhatsApp atau form kontak di sini.",
  alternates: {
    canonical: "/kontak",
  },
};

export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return children;
}
