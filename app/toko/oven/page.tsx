import type { Metadata } from 'next';
import Link from 'next/link';
import Faq from '@/components/Faq';
import JsonLd from '@/components/seo/JsonLd';
import PageIntro from '@/components/local/PageIntro';
import VisitStore from '@/components/local/VisitStore';
import ProductCard from '@/components/ProductCard';
import { getAllProducts } from '@/lib/products';
import { productPublicPath } from '@/lib/productSlug';
import { findProductByName, localPageJsonLd, productsInCategories } from '@/lib/localStore';

export const revalidate = 60;

const PATH = '/toko/oven';
const TITLE = 'Toko Oven Tangerang';
const DESCRIPTION =
  'Toko oven di Kota Tangerang. Lihat unit Signora dulu, dari 38 sampai 150 liter, lalu konsultasi sama Cece. Bisa dikirim ke seluruh Indonesia.';

const CRUMBS = [
  { name: 'Beranda', path: '/' },
  { name: 'Toko', path: '/toko' },
  { name: 'Toko Oven Tangerang', path: PATH },
];

const FAQS = [
  {
    q: 'Bisa lihat ovennya dulu di Tangerang?',
    a: 'Bisa. CeceLinaChang Store ada di Jl. Pulau Dewa I No.26, Kelapa Indah, Kota Tangerang. Sabtu buka 10.00–13.30, Minggu tutup. Janjian lewat WhatsApp, nanti unitnya disiapkan.',
  },
  {
    q: 'Oven 38 liter atau yang lebih besar?',
    a: '38 liter cukup untuk loyang rumahan. Kalau sering panggang banyak loyang atau ayam utuh, lihat yang 60 dan 75 liter. Untuk jualan dengan banyak loyang sekaligus, ada yang 150 liter.',
  },
  {
    q: 'Garansinya berapa lama?',
    a: 'Garansi resmi distributor 1 tahun untuk seluruh produk Signora.',
  },
  {
    q: 'Kalau saya di luar Tangerang, tetap bisa beli?',
    a: 'Bisa. Oven dikirim ke seluruh Indonesia, dipacking pakai bubble wrap dan kardus. Kalau barangnya rusak atau salah kirim, laporkan dalam 24–48 jam beserta foto, nanti kami ganti.',
  },
];

const GUIDE = [
  {
    title: 'Kue di rumah',
    body: '38 liter muat untuk loyang rumahan. De Luna suhu atas dan bawahnya terpisah. De Amore masih 38 liter, dengan kipas dan rotisserie.',
    names: ['De Luna', 'De Amore'],
  },
  {
    title: 'Sering masak lebih banyak',
    body: 'De Mooie 60 liter dan De Nero 75 liter. Keduanya punya proofing, convection, dan rotisserie, jadi ayam utuh muat.',
    names: ['De Mooie', 'De Nero'],
  },
  {
    title: 'Buat jualan',
    body: 'De Braun 150 liter. Banyak loyang sekaligus, ada proofing, convection, rotisserie, dan stay-on.',
    names: ['De Braun'],
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

export default async function OvenStorePage() {
  const products = await getAllProducts();
  const ovens = productsInCategories(products, ['Oven']);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <JsonLd
        data={localPageJsonLd({
          path: PATH,
          title: TITLE,
          description: DESCRIPTION,
          crumbs: CRUMBS,
          faqs: FAQS,
          products: ovens,
        })}
      />
      <PageIntro
        crumbs={CRUMBS}
        title="Toko Oven di Tangerang"
        note="lihat unitnya dulu, baru kamu putusin"
        lede="Kamu nggak perlu nebak oven dari foto. Di toko Cece Lina Chang, Kota Tangerang, oven Signora-nya bisa dilihat langsung. Janjian lewat WhatsApp, Cece bantu pilih ukuran yang sesuai sama yang biasa kamu masak. Kalau nggak sempat datang, kami kirim."
      />

      <VisitStore message="Halo Admin, saya cari oven di Tangerang. Boleh lihat unitnya?" />

      <section className="mb-10 sm:mb-14">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-3">
          Pilih dari yang kamu masak, bukan dari yang paling mahal
        </h2>
        <p className="text-charcoal-brown/75 max-w-3xl mb-6 leading-relaxed">
          Oven yang kekecilan bikin kamu bolak-balik panggang. Yang kebesaran cuma makan tempat. Ini patokan yang Cece pakai waktu orang tanya di toko.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GUIDE.map((item) => {
            const matches = item.names
              .map((name) => findProductByName(ovens, name))
              .filter((product): product is NonNullable<typeof product> => Boolean(product));
            return (
              <div key={item.title} className="bg-white border border-butter/40 rounded-2xl p-5">
                <h3 className="font-serif text-xl font-bold text-rust-ink mb-2">{item.title}</h3>
                <p className="text-charcoal-brown/75 text-sm leading-relaxed mb-4">{item.body}</p>
                <ul className="space-y-2">
                  {matches.map((product) => (
                    <li key={product.id}>
                      <Link href={productPublicPath(product)} className="text-terracotta font-medium hover:text-rust-ink">
                        {product.name}
                      </Link>
                      <div className="text-sm text-charcoal-brown/70">{product.price}</div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-6">
          Oven yang ada di toko
        </h2>
        {ovens.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
            {ovens.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-charcoal-brown/70">Stok oven lagi dicek. Chat WhatsApp biar admin kabari unit yang ready.</p>
        )}
      </section>

      <p className="mt-8 text-sm text-charcoal-brown/70">
        Lihat juga{' '}
        <Link href="/toko/signora" className="text-terracotta hover:text-rust-ink font-medium">
          Signora Tangerang
        </Link>{' '}
        dan{' '}
        <Link href="/toko/peralatan-masak" className="text-terracotta hover:text-rust-ink font-medium">
          peralatan masak
        </Link>
        , atau kembali ke{' '}
        <Link href="/toko" className="text-terracotta hover:text-rust-ink font-medium">
          semua produk
        </Link>
        .
      </p>

      <Faq items={FAQS} title="Yang sering ditanya soal oven" />
    </div>
  );
}
