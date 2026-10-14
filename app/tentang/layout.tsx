import type { Metadata } from "next";
import { pageSocialMetadata } from "@/lib/seo";

// app/tentang/page.tsx is 'use client' and can't export `metadata` itself,
// so it lives in this sibling layout instead.
const TITLE = "Tentang Cece Lina Chang: 18 Tahun Pabrik Bakso";
const DESCRIPTION =
  "Kenalan sama Cece Lina Chang -- 18 tahun mengelola pabrik bakso, sekarang berbagi resep dan kelas masak & baking anti gagal buat ibu-ibu di rumah.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/tentang",
  },
  ...pageSocialMetadata(TITLE, DESCRIPTION, "/tentang"),
};

export default function TentangLayout({ children }: { children: React.ReactNode }) {
  return children;
}
