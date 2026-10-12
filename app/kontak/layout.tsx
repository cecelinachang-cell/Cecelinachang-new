import type { Metadata } from "next";
import { pageSocialMetadata } from "@/lib/seo";

// app/kontak/page.tsx is 'use client' and can't export `metadata` itself,
// so it lives in this sibling layout instead.
const TITLE = "Kontak | Cece Lina Chang";
const DESCRIPTION =
  "Toko Cece Lina Chang di Kota Tangerang. Tanya kelas masak atau alat Signora lewat WhatsApp, atau datang lihat unit dengan janji.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/kontak",
  },
  ...pageSocialMetadata(TITLE, DESCRIPTION, "/kontak"),
};

export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return children;
}
