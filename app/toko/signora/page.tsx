import type { Metadata } from 'next';
import Link from 'next/link';
import Faq from '@/components/Faq';
import JsonLd from '@/components/seo/JsonLd';
import PageIntro from '@/components/local/PageIntro';
import VisitStore from '@/components/local/VisitStore';
import ProductCard from '@/components/ProductCard';
import { getAllProducts, type Product } from '@/lib/products';
import { normalizeCategory } from '@/lib/categories';
import { findProductByName, localPageJsonLd } from '@/lib/localStore';

export const revalidate = 60;

const PATH = '/toko/signora';
const TITLE = 'Signora Tangerang';
const DESCRIPTION =
  'Toko Signora di Kota Tangerang. Lihat oven, mixer, panci, wajan, dan presto-nya dulu, lalu tanya Cece model mana yang dia pakai sendiri.';

const CRUMBS = [
  { name: 'Beranda', path: '/' },
  { name: 'Toko', path: '/toko' },
  { name: 'Signora Tangerang', path: PATH },
];

const FAQS = [
  {
    q: 'Di mana beli Signora di Tangerang?',
    a: 'Di CeceLinaChang Store, Jl. Pulau Dewa I No.26, Kelapa Indah, Kota Tangerang. Sabtu 10.00–13.30, Minggu tutup. Bisa lihat unitnya dengan janji lewat WhatsApp, atau minta dikirim.',
  },
  {
    q: 'Produk Signora apa saja yang ada?',
    a: 'Oven, mixer, food processor, panci, wajan, loyang, presto, multi cooker, dan air fryer. Daftar lengkapnya ada di halaman toko.',
  },
  {
    q: 'Bisa tanya model yang cocok sebelum beli?',
    a: 'Bisa. Cece pakai alat-alat ini di kelas dan di dapurnya sendiri, jadi pertanyaannya bisa soal pemakaian, bukan cuma soal spesifikasi.',
  },
  {
    q: 'Ada garansi?',
    a: 'Garansi resmi distributor 1 tahun untuk seluruh produk Signora.',
  },
];

const FEATURED_NAMES = ['De Mooie', 'De Luna', 'La Spezia', 'Presto', 'Food Processor'];

function categoryCounts(products: Product[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const name = normalizeCategory(product.category);
    if (!name) continue;
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

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

export default async function SignoraStorePage() {
  const products = await getAllProducts();
  const counts = categoryCounts(products);
  const featured = FEATURED_NAMES.map((name) => findProductByName(products, name)).filter(
    (product): product is Product => Boolean(product),
  );
  const uniqueFeatured = featured.filter(
    (product, index) => featured.findIndex((item) => item.id === product.id) === index,
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
          products: uniqueFeatured,
        })}
      />
      <PageIntro
        crumbs={CRUMBS}
        title="Signora di Tangerang"
        note="yang cece pakai sendiri, bukan cuma dipajang"
        lede="Mau beli Signora dan lihat barangnya dulu? Tokonya di Kota Tangerang. Oven, mixer, panci, wajan, presto, sampai air fryer ada di sini. Kamu bisa tanya Cece model mana yang dia pakai waktu ngajar, lalu lihat unitnya sebelum bayar."
      />

      <VisitStore message="Halo Admin, saya cari Signora di Tangerang. Boleh konsultasi dan lihat unitnya?" />

      <section className="mb-10 sm:mb-14">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-3">
          Yang biasanya dicari orang
        </h2>
        <p className="text-charcoal-brown/75 max-w-3xl mb-6 leading-relaxed">
          Sebagian besar yang datang nyari oven atau alat yang kelihatan di video. Kalau kamu sudah tahu modelnya, sebut saja di WhatsApp. Kalau belum, ceritakan dulu mau dipakai masak apa.
        </p>
        {uniqueFeatured.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
            {uniqueFeatured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {counts.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-4">
            Isi toko sekarang
          </h2>
          <ul className="flex flex-wrap gap-2">
            {counts.map((category) => (
              <li key={category.name} className="bg-white border border-butter/40 rounded-full px-4 py-2 text-sm text-charcoal-brown">
                {category.name}
                <span className="text-charcoal-brown/50"> · {category.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-charcoal-brown/80 leading-relaxed max-w-3xl">
        Daftar lengkap dan harganya ada di{' '}
        <Link href="/toko" className="text-terracotta font-medium hover:text-rust-ink">
          toko
        </Link>
        . Kalau yang kamu cari oven, buka{' '}
        <Link href="/toko/oven" className="text-terracotta font-medium hover:text-rust-ink">
          toko oven Tangerang
        </Link>
        . Untuk panci, wajan, dan presto, lihat{' '}
        <Link href="/toko/peralatan-masak" className="text-terracotta font-medium hover:text-rust-ink">
          peralatan masak
        </Link>
        .
      </p>

      <Faq items={FAQS} title="Yang sering ditanya soal Signora" />
    </div>
  );
}
