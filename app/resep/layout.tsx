import type { Metadata } from "next";

// No recipe catalog exists. The old /resep pages were six placeholder recipes,
// and every /resep/<slug> rendered the same invented "Roti Sobek". Keep this
// route noindex until Cece publishes recipes she actually teaches.
export const metadata: Metadata = {
  title: "Resep | Cece Lina Chang",
  description:
    "Resep yang Cece ajarkan ada di dalam kelas, lengkap dengan video. Website ini tidak menaruh katalog resep terpisah.",
  alternates: {
    canonical: "/resep",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResepLayout({ children }: { children: React.ReactNode }) {
  return children;
}
