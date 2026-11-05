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
export interface ClassBundle {
  key: 'gurih' | 'hampers';
  title: string;
  pitch: string;
  courseSlugs: string[];
  price: number;
  lynkId: string;
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
