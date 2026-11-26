import { parseIdr } from '@/lib/pixels';
import { withAdTags } from '@/lib/lynk';

/**
 * Class bundles, sold on Lynk at their normal (permanent) price.
 *
 * No time-limited sale: decided 5 Nov 2026, so buyers don't learn to wait for
 * the next promo. The struck-through price is the live sum of the single-class
 * prices ("kalau beli satuan"), never typed in: a reference price that was
 * never charged is illegal (UU Perlindungan Konsumen Pasal 9/10).
 * Lynk product prices must match these numbers.
 */
/** A money-back promise the owner approved for one bundle. Same shape as a class guarantee. */
export interface BundleGuarantee {
  title: string;
  /** The full terms. Also printed on the terms page, so the two can't drift apart. */
  body: string;
  /** One line for the bundle card. */
  short: string;
}

export interface ClassBundle {
  key: 'gurih' | 'hampers' | 'semua';
  title: string;
  pitch: string;
  courseSlugs: string[];
  price: number;
  lynkId: string;
  guarantee?: BundleGuarantee;
}

export const CLASS_BUNDLES: ClassBundle[] = [
  {
    key: 'gurih',
    title: 'Paket Gurih Jualan',
    pitch: 'Resep yang Cece pakai sendiri waktu jualan. Cocok untuk frozen food dari rumah.',
    courseSlugs: ['bakso-sapi-premium', 'otak-otak', 'fu-kian', 'go-hiong-roll'],
    price: 899_000,
    lynkId: '24ky8rx34p8q',
  },
  {
    key: 'hampers',
    title: 'Paket Kue Hampers',
    pitch: 'Pas untuk hampers Natal dan Imlek. Bangga kasih kue buatan sendiri.',
    courseSlugs: ['lapis-legit', 'ogura-softcake', 'mocha-pandan-sponge'],
    price: 949_000,
    lynkId: 'e8r4plr9me83',
  },
  // Published on Lynk 26 Nov 2026 at this price. The guarantee was approved by
  // the owner the same day and uses the Bakso guarantee's conditions; the
  // wording matches the Lynk product description.
  {
    key: 'semua',
    title: 'Semua Kelas Cece',
    pitch: 'Ke-8 kelas online Cece dalam satu paket: kelas gurih dan kelas kue.',
    courseSlugs: [
      'bakso-sapi-premium',
      'otak-otak',
      'meat-pie',
      'fu-kian',
      'go-hiong-roll',
      'ogura-softcake',
      'mocha-pandan-sponge',
      'lapis-legit',
    ],
    price: 1_800_000,
    lynkId: 'lqknw2vl037n',
    guarantee: {
      title: 'Garansi 30 Hari',
      body: 'Praktikkan salah satu resepnya minimal 2 kali dalam 30 hari setelah beli, lalu kirim fotonya ke WhatsApp Cece. Cece bantu cek salahnya di mana. Kalau sudah dibantu dan masih belum berhasil, uang paketnya Rp\u00a01.800.000 Cece kembalikan penuh dalam 7 hari kerja, lalu akses kelasnya ditutup.',
      short: 'Garansi 30 Hari: sudah praktik 2 kali dan dibantu Cece tapi belum berhasil? Uang paket kembali penuh.',
    },
  },
];

type CourseLike = { slug: string; title: string; price: string };

export interface ClassBundleView {
  key: ClassBundle['key'];
  title: string;
  pitch: string;
  classTitles: string[];
  price: number;
  /** Sum of the current single prices, or null if a class is missing (then no strike is shown). */
  singlesTotal: number | null;
  lynkId: string;
  guarantee?: BundleGuarantee;
}

/** Bundles with their class names and the sum of the single prices, from the live catalog. */
export function buildClassBundles(courses: CourseLike[]): ClassBundleView[] {
  const bySlug = new Map(courses.map((c) => [c.slug, c]));
  return CLASS_BUNDLES.map((b) => {
    const found = b.courseSlugs.map((slug) => bySlug.get(slug));
    const complete = found.every(Boolean);
    const sum = complete ? found.reduce((total, c) => total + (parseIdr(c!.price) ?? NaN), 0) : NaN;
    return {
      key: b.key,
      title: b.title,
      pitch: b.pitch,
      classTitles: found.filter(Boolean).map((c) => c!.title.replace(/^Kelas\s+/i, '')),
      price: b.price,
      singlesTotal: Number.isFinite(sum) && sum > b.price ? sum : null,
      lynkId: b.lynkId,
      guarantee: b.guarantee,
    };
  });
}

/** Lynk checkout link for a bundle; ad visitors keep their own utm_* tags and fbclid. */
export function bundleCheckoutUrl(lynkId: string, key: string, incomingSearch = ''): string {
  const params = new URLSearchParams({ utm_source: 'website', utm_medium: 'bundle', utm_campaign: 'class_bundles' });
  const url = withAdTags(`https://lynk.id/cecelinachang/${lynkId}/checkout?${params}`, incomingSearch);
  const out = new URL(url);
  out.searchParams.set('utm_content', key);
  return out.toString();
}

export function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`;
}
