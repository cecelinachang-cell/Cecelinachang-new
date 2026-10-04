import type { Metadata } from "next";

// app/kontak/page.tsx is 'use client' and can't export `metadata` itself,
// so it lives in this sibling layout instead.
export const metadata: Metadata = {
  title: "Kontak | Cece Lina Chang",
  description:
    "Toko Cece Lina Chang di Kota Tangerang. Tanya kelas masak atau alat Signora lewat WhatsApp, atau datang lihat unit dengan janji.",
  alternates: {
    canonical: "/kontak",
  },
};

export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return children;
}
