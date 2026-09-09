import type { Metadata } from "next";
import { supabasePublic, isSupabaseConfigured } from "@/lib/supabase";
import { fetchProducts } from "@/lib/fetchProducts";
import { products as fallbackProducts } from "@/app/data/products";
import { Marginalia } from "@/components/Marginalia";
import TokoCatalog from "@/components/TokoCatalog";
import type { Product } from "@/components/ProductCard";
import { SITE_NAME, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

export const revalidate = 60;

const PAGE_TITLE = "Toko Alat Baking Signora";
const PAGE_DESCRIPTION =
  "Mixer, loyang, panci, dan alat baking Signora yang dipakai Cece Lina Chang di setiap video. Konsultasi gratis via WhatsApp sebelum membeli.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/toko" },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: "/toko",
    type: "website",
  },
};

export default async function TokoPage() {
  // Fetched on the server so the product list ships in the crawlable HTML
  // instead of appearing only after a client-side effect.
  const products = await fetchProducts<Product>({
    isConfigured: isSupabaseConfigured(),
    query: () =>
      supabasePublic.from("items").select("*").order("createdAt", { ascending: false }),
    fallback: fallbackProducts as unknown as Product[],
  });

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Beranda", path: "/" },
      { name: PAGE_TITLE, path: "/toko" },
    ]),
    itemListJsonLd(
      PAGE_TITLE,
      products.map((product) => `/toko/${product.id}`)
    ),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-fluid-h1 font-serif font-bold text-rust-ink mb-2 sm:mb-4">
          {PAGE_TITLE}
        </h1>
        <Marginalia rotate={-2} className="block mb-3">
          alat yang beneran aku pakai sendiri, bukan sekedar endorse
        </Marginalia>
        <p className="text-base sm:text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
          Alat yang saya pakai sendiri di setiap video, biar hasil baking Anda
          anti gagal juga.
        </p>
      </div>

      <TokoCatalog products={products} />
    </div>
  );
}
