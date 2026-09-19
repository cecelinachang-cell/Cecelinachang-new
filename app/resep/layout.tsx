import type { Metadata } from "next";

// Covers /resep and /resep/[slug] in one file. noindex: the six recipes here
// are hardcoded placeholders and every /resep/<slug> currently renders the
// same "Roti Sobek" content regardless of slug -- indexing it would put junk
// with dead detail links in search results. Flip index: true once the
// content is real.
export const metadata: Metadata = {
  title: "Koleksi Resep Baking | Cece Lina Chang",
  description:
    "Resep baking langkah demi langkah dari Cece Lina Chang -- roti, kue, cookies, dan resep favorit Indonesia, ditulis buat pemula.",
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
