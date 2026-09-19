import Image from "next/image";
import type { Metadata } from "next";
import Faq from "@/components/Faq";
import { Button } from "@/components/ui/Button";
import { waLink } from "@/lib/links";
import { Marginalia } from "@/components/Marginalia";
import { getAllProducts } from "@/lib/products";
import TokoCatalog from "@/components/toko/TokoCatalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Toko Alat Baking Signora | Cece Lina Chang",
  description:
    "Belanja alat baking Signora yang beneran dipakai Cece Lina Chang -- mixer, oven, dan perlengkapan baking premium, kirim ke seluruh Indonesia.",
  alternates: {
    canonical: "/toko",
  },
};

export default async function TokoPage() {
  const products = await getAllProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-fluid-h1 font-serif font-bold text-rust-ink mb-2 sm:mb-4">
          Toko Alat Baking Signora
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

      {/* Banner Promo */}
      <div className="mt-10 sm:mt-16 bg-rust-ink rounded-3xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="p-6 sm:p-8 md:p-12 text-center md:text-left">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Butuh Rekomendasi Alat?
            </h2>
            <p className="text-butter/90 text-base sm:text-lg mb-6 sm:mb-8">
              Jangan bingung memilih. Chat admin kami via WhatsApp — respon
              cepat, gratis konsultasi alat baking yang cocok untuk kebutuhan
              Anda.
            </p>
            <Button
              href={waLink("Halo Admin, saya butuh rekomendasi alat baking")}
              external
              variant="secondary"
              size="lg"
              fullWidth
              className="sm:w-fit bg-white text-rust-ink border-transparent hover:bg-butter/15"
            >
              Chat Admin Sekarang
            </Button>
          </div>
          <div className="relative h-56 sm:h-64 md:h-full min-h-[240px] md:min-h-[300px]">
            <Image
              src="/images/bakso-sapi-premium.webp"
              alt="Alat Masak Signora"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      <Faq categories={["shipping", "refund"]} />
    </div>
  );
}
