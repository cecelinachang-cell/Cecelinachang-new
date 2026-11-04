import { parseIdr } from '@/lib/pixels';

/**
 * 11.11 class bundles (11–13 Nov 2026), sold on Lynk.
 *
 * The struck-through price is computed from the live single-class prices, never
 * typed in: a "harga normal" that was never charged is illegal (UU Perlindungan
 * Konsumen Pasal 9/10), and computing it keeps it in step with the class pages.
 * Rules and prices: 06 Marketing/(C) 11.11 bundle pricing rule.md (approved
 * 4 Nov 2026). The Lynk products open and close on the same window by
 * themselves (Lynk Release Time).
 */

/** First moment the promo shows: Wed 11 Nov 2026 00:00 WIB. */
export const PROMO_START = Date.parse('2026-11-11T00:00:00+07:00');
/** First moment it no longer shows: Sat 14 Nov 2026 00:00 WIB (so it runs through Fri 13 Nov 23:59). */
export const PROMO_END = Date.parse('2026-11-14T00:00:00+07:00');

/** Adding `?preview_promo=1111` shows the section outside the window, for checking a preview. */
export const PREVIEW_PARAM = 'preview_promo';

export interface PromoBundle {
  key: 'gurih' | 'hampers' | 'semua';
  title: string;
  pitch: string;
  courseSlugs: string[];
  price: number;
  lynkId: string;
}

export const PROMO_BUNDLES: PromoBundle[] = [
  {
    key: 'gurih',
    title: 'Paket Gurih Jualan',
    pitch: 'Resep yang Cece pakai sendiri waktu jualan. Cocok untuk frozen food dari rumah.',
    courseSlugs: ['bakso-sapi-premium', 'otak-otak', 'fu-kian', 'go-hiong-roll'],
    price: 699_000,
    lynkId: '24ky8rx34p8q',
  },
  {
    key: 'hampers',
    title: 'Paket Kue Hampers',
    pitch: 'Pas untuk hampers Natal dan Imlek. Bangga kasih kue buatan sendiri.',
    courseSlugs: ['lapis-legit', 'ogura-softcake', 'mocha-pandan-sponge'],
    price: 849_000,
    lynkId: 'e8r4plr9me83',
  },
  {
    key: 'semua',
    title: 'Semua Kelas Cece',
    pitch: 'Ke-8 kelas online sekali bayar. Paket ini hanya dibuka saat event.',
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
    price: 1_449_000,
    lynkId: 'lqknw2vl037n',
  },
];

export function isPromoActive(now: number, search = ''): boolean {
  if (new URLSearchParams(search).get(PREVIEW_PARAM) === '1111') return true;
  return now >= PROMO_START && now < PROMO_END;
}

type CourseLike = { slug: string; title: string; price: string };

export interface PromoBundleView {
  key: PromoBundle['key'];
  title: string;
  pitch: string;
  classTitles: string[];
  price: number;
  /** Sum of the current single prices, or null if a class is missing (then no strike is shown). */
  normalPrice: number | null;
  lynkId: string;
}

/** Bundles with their class names and struck-through price, from the live catalog. */
export function buildPromoBundles(courses: CourseLike[]): PromoBundleView[] {
  const bySlug = new Map(courses.map((c) => [c.slug, c]));
  return PROMO_BUNDLES.map((b) => {
    const found = b.courseSlugs.map((slug) => bySlug.get(slug));
    const complete = found.every(Boolean);
    const sum = complete ? found.reduce((total, c) => total + (parseIdr(c!.price) ?? NaN), 0) : NaN;
    return {
      key: b.key,
      title: b.title,
      pitch: b.pitch,
      classTitles: found.filter(Boolean).map((c) => c!.title.replace(/^Kelas\s+/i, '')),
      price: b.price,
      normalPrice: Number.isFinite(sum) && sum > b.price ? sum : null,
      lynkId: b.lynkId,
    };
  });
}

/**
 * Lynk checkout link for a bundle. Ad traffic keeps its own utm_* tags (so Lynk
 * orders show which ad sold); everyone else is tagged as the website promo.
 */
export function promoCheckoutUrl(lynkId: string, key: string, incomingSearch = ''): string {
  const incoming = new URLSearchParams(incomingSearch);
  const params = new URLSearchParams();
  if (incoming.get('utm_source')) {
    for (const [k, v] of incoming) if (k.startsWith('utm_')) params.set(k, v);
  } else {
    params.set('utm_source', 'website');
    params.set('utm_medium', 'promo_1111');
    params.set('utm_campaign', '1111_bundles');
  }
  params.set('utm_content', key);
  return `https://lynk.id/cecelinachang/${lynkId}/checkout?${params}`;
}

export function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`;
}
