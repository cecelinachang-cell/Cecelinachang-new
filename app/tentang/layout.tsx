import type { Metadata } from "next";

// app/tentang/page.tsx is 'use client' and can't export `metadata` itself,
// so it lives in this sibling layout instead.
export const metadata: Metadata = {
  title: "Tentang Cece Lina Chang",
  description:
    "Kenalan sama Cece Lina Chang -- 16 tahun pengalaman industri makanan, sekarang berbagi resep dan kelas baking anti gagal buat ibu-ibu di rumah.",
  alternates: {
    canonical: "/tentang",
  },
};

export default function TentangLayout({ children }: { children: React.ReactNode }) {
  return children;
}
