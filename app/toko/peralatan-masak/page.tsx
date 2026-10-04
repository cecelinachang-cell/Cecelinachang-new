import type { Metadata } from 'next';
import Link from 'next/link';
import Faq from '@/components/Faq';
import JsonLd from '@/components/seo/JsonLd';
import PageIntro from '@/components/local/PageIntro';
import VisitStore from '@/components/local/VisitStore';
import ProductCard from '@/components/ProductCard';
import { getAllProducts, type Product } from '@/lib/products';
import { localPageJsonLd, productsInCategories } from '@/lib/localStore';

export const revalidate = 60;

const PATH = '/toko/peralatan-masak';
const TITLE = 'Peralatan Masak Tangerang';
const DESCRIPTION =
  'Toko peralatan masak di Kota Tangerang. Oven, mixer, panci, wajan, presto, dan air fryer Signora. Bisa lihat unitnya atau dikirim.';

const CRUMBS = [
  { name: 'Beranda', path: '/' },
  { name: 'Toko', path: '/toko' },
  { name: 'Peralatan Masak Tangerang', path: PATH },
];

const FAQS = [
  {
    q: 'Peralatan masak apa yang dijual di Tangerang?',
    a: 'Oven, mixer, food processor, panci, wajan, loyang, presto, multi cooker, dan air fryer. Semuanya merek Signora, di CeceLinaChang Store, Jl. Pulau Dewa I No.26, Kelapa Indah, Kota Tangerang.',
  },
  {
    q: 'Harus datang ke toko, atau bisa dikirim?',
    a: 'Dua-duanya. Janjian dulu kalau mau lihat barangnya. Kalau sudah yakin, admin kirim ke seluruh Indonesia.',
  },
  {
    q: 'Bagaimana cara pilih yang cocok?',
    a: 'Ceritakan mau dipakai untuk apa. Masak harian, jualan, atau ikut kelas. Cece pakai alat yang sama di dapurnya, jadi rekomendasinya dari pemakaian, bukan dari katalog.',
  },
  {
    q: 'Garansi dan barang rusak bagaimana?',
    a: 'Garansi resmi distributor 1 tahun. Kalau barang sampai dalam keadaan rusak atau salah kirim, laporkan dalam 24–48 jam beserta foto, nanti kami ganti.',
  },
];

const GROUPS: { title: string; advice: string; categories: string[]; href?: string }[] = [
  {
    title: 'Oven',
    advice: 'Mulai dari 38 liter untuk dapur rumah sampai 150 liter kalau kamu panggang banyak loyang. Daftar lengkapnya ada di halaman oven.',
    categories: ['Oven'],
    href: '/toko/oven',
  },
  {
    title: 'Mixer, blender, dan food processor',
    advice: 'Hand mixer untuk adonan kue. Food processor kalau kamu juga menggiling daging atau bumbu, termasuk buat bakso. Blender dan chopper ada di kelompok yang sama.',
    categories: ['Mixer', 'Blender'],
  },
  {
    title: 'Panci, wajan, dan loyang',
    advice: 'Untuk tumis, rebus, dan panggang. Wajan dan panci yang sering kepakai di video Cece ada di kelompok ini.',
    categories: ['Pan', 'Pots & Pans', 'Loyang'],
  },
  {
    title: 'Presto, multi cooker, dan air fryer',
    advice: 'Presto untuk yang mau masak cepat tanpa nunggu lama di kompor. Air fryer jumbo-nya muat ayam utuh.',
    categories: ['Presto', 'E-Cooker', 'Air Fryer', 'Grill'],
  },
];

export const metadata: Metadata = {
  title: `${TITLE} | Cece Lina Chang`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} | Cece Lina Chang`,
    description: DESCRIPTION,
    url: PATH,
    locale: 'id_ID',
    type: 'website',
  },
};

export default async function CookwarePage() {
  const products = await getAllProducts();
  const sections = GROUPS.map((group) => ({
    ...group,
    products: productsInCategories(products, group.categories).slice(0, 4),
  })).filter((group) => group.products.length > 0);
  const listed = sections.flatMap((group) => group.products);
  const uniqueListed = listed.filter(
    (product, index) => listed.findIndex((item) => item.id === product.id) === index,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <JsonLd
        data={localPageJsonLd({
          path: PATH,
          title: TITLE,
          description: DESCRIPTION,
          crumbs: CRUMBS,
          faqs: FAQS,
          products: uniqueListed,
        })}
      />
      <PageIntro
        crumbs={CRUMBS}
        title="Peralatan Masak di Tangerang"
        note="panci, wajan, oven, presto. satu toko."
        lede="Kalau kamu cari peralatan masak di Tangerang dan mau lihat barangnya sebelum bayar, tokonya di sini. Yang dijual adalah alat Signora yang Cece pakai sendiri: oven, mixer, panci, wajan, presto, dan air fryer. Janjian dulu, atau minta dikirim."
      />

      <VisitStore message="Halo Admin, saya cari peralatan masak di Tangerang. Boleh minta rekomendasi?" />

      {sections.map((group) => (
        <section key={group.title} className="mb-10 sm:mb-14">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink">{group.title}</h2>
            {group.href && (
              <Link href={group.href} className="text-sm text-terracotta font-medium hover:text-rust-ink">
                Semua oven →
              </Link>
            )}
          </div>
          <p className="text-charcoal-brown/75 max-w-3xl mb-6 leading-relaxed">{group.advice}</p>
          <ProductGrid products={group.products} />
        </section>
      ))}

      <p className="text-charcoal-brown/80 leading-relaxed">
        Mau lihat semuanya sekaligus? Buka{' '}
        <Link href="/toko" className="text-terracotta font-medium hover:text-rust-ink">
          toko
        </Link>{' '}
        atau halaman{' '}
        <Link href="/toko/signora" className="text-terracotta font-medium hover:text-rust-ink">
          Signora Tangerang
        </Link>
        .
      </p>

      <Faq items={FAQS} title="Yang sering ditanya soal peralatan masak" />
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
