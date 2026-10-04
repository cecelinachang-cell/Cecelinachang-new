import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import Faq from '@/components/Faq';
import JsonLd from '@/components/seo/JsonLd';
import PageIntro from '@/components/local/PageIntro';
import CourseCardCompact from '@/components/CourseCardCompact';
import { Button } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { getAllCourses } from '@/lib/courses';
import { waLink } from '@/lib/links';
import { localPageJsonLd, STORE } from '@/lib/localStore';

export const revalidate = 60;

const PATH = '/kelas-masak-tangerang';
const TITLE = 'Kelas Masak Tangerang';
const DESCRIPTION =
  'Kelas masak di Tangerang bareng Cece Lina Chang. Belajar online dari rumah, atau praktik langsung di toko Kota Tangerang. Bakso, dimsum, sampai kue.';

const CRUMBS = [
  { name: 'Beranda', path: '/' },
  { name: 'Kursus', path: '/kursus' },
  { name: 'Kelas Masak Tangerang', path: PATH },
];

const FAQS = [
  {
    q: 'Kelasnya online atau datang ke Tangerang?',
    a: 'Dua-duanya. Kelas online ditonton dari rumah, aksesnya seumur hidup, dan kamu tetap bisa tanya Cece. Kelas offline praktiknya di CeceLinaChang Store, Jl. Pulau Dewa I No.26, Kelapa Indah, Kota Tangerang. Grupnya kecil. Tanggal berikutnya ditanya lewat WhatsApp karena kuotanya sedikit.',
  },
  {
    q: 'Pemula yang belum pernah jualan bisa ikut?',
    a: 'Bisa. Materinya mulai dari dasar: takaran, suhu, dan urutan masak. Kamu nggak perlu sudah punya usaha.',
  },
  {
    q: 'Kelas apa yang ada?',
    a: 'Ada kelas gurih seperti bakso sapi, fu kian, go hiong roll, dan otak-otak. Ada juga kelas kue: lapis legit, ogura, sponge, dan meat pie.',
  },
  {
    q: 'Setelah daftar, videonya dikirim ke mana?',
    a: 'Setelah pembayaran, link videonya dikirim ke email kamu. Aksesnya seumur hidup dan bisa diulang. Kalau ada yang bingung, tanya langsung ke Cece.',
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

export default async function CookingClassPage() {
  const courses = await getAllCourses();
  const ordered = [...courses].sort((a, b) => Number(Boolean(b.isSignature)) - Number(Boolean(a.isSignature)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <JsonLd
        data={localPageJsonLd({
          path: PATH,
          title: TITLE,
          description: DESCRIPTION,
          crumbs: CRUMBS,
          faqs: FAQS,
        })}
      />
      <PageIntro
        crumbs={CRUMBS}
        title="Kelas Masak di Tangerang"
        note="dari rumah juga bisa, kalau mau praktik silakan datang"
        lede="Kamu bisa belajar masak bareng Cece dari rumah di Tangerang, atau datang praktik di tokonya. Kelas online-nya bakso, dimsum, dan kue, dengan video yang boleh diulang dan tanya langsung. Kelas offline-nya di toko, grupnya kecil."
      />

      <aside className="bg-butter/15 border border-butter/40 rounded-3xl p-6 sm:p-8 mb-10 sm:mb-14">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-terracotta shadow-sm shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-2">
              Praktik di {STORE.name}
            </h2>
            <p className="text-charcoal-brown/80 leading-relaxed mb-2">
              <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-terracotta">
                {STORE.addressLine}
              </a>
            </p>
            <p className="text-charcoal-brown/80 leading-relaxed mb-5">
              Sabtu 10.00–13.30. Minggu tutup. Tanggal kelasnya nggak dipasang di sini karena kuotanya cepat penuh. Tanya yang masih kosong, nanti Cece kabari.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                href={waLink('Halo Cece, saya di Tangerang dan mau tanya jadwal kelas masak offline.')}
                external
                variant="whatsapp"
                size="lg"
                fullWidth
                className="sm:w-fit"
              >
                <WhatsAppIcon className="w-5 h-5 mr-2" />
                Tanya jadwal kelas
              </Button>
              <Button href="/kursus/bakso-sapi-premium" variant="secondary" size="lg" fullWidth className="sm:w-fit">
                Kelas bakso online
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <section className="mb-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-3">
          Kelas yang bisa langsung kamu ikuti
        </h2>
        <p className="text-charcoal-brown/75 max-w-3xl mb-6 leading-relaxed">
          Ini kelas online. Kamu nonton dari rumah, aksesnya seumur hidup, dan tetap bisa tanya Cece kalau ada langkah yang nyangkut.
        </p>
        {ordered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {ordered.map((course) => (
              <CourseCardCompact key={course.id} course={course} featured={course.isSignature} />
            ))}
          </div>
        ) : (
          <p className="text-charcoal-brown/70">
            Daftar kelasnya ada di <Link href="/kursus" className="text-terracotta">halaman kursus</Link>.
          </p>
        )}
      </section>

      <p className="mt-8 text-sm text-charcoal-brown/70">
        Butuh alatnya juga? Lihat{' '}
        <Link href="/toko/peralatan-masak" className="text-terracotta font-medium hover:text-rust-ink">
          peralatan masak
        </Link>{' '}
        dan{' '}
        <Link href="/toko/oven" className="text-terracotta font-medium hover:text-rust-ink">
          oven
        </Link>{' '}
        di toko yang sama.
      </p>

      <Faq items={FAQS} title="Yang sering ditanya soal kelas" />
    </div>
  );
}
