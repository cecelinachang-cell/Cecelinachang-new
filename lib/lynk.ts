/**
 * Lynk.id is the payment gateway for online courses: the site stays the
 * storefront and "Bayar Sekarang" opens the course's hidden Lynk checkout.
 * After payment a Lynk webhook (Apps Script in Cece's Google account) shares
 * the class Drive folder with the Gmail the buyer typed at checkout.
 *
 * Keep prices in sync: a Lynk product's price must match the site price.
 */
const LYNK_CHECKOUT_IDS: Record<string, string> = {
  'fu-kian': 'ep36mr441n81',
  'go-hiong-roll': 'pq2gv02qpwv6',
  'otak-otak': 'wx5m745vrwmo',
  'ogura-softcake': 'v7xp2nxxjklm',
  'mocha-pandan-sponge': 'r89n5393k4v2',
  'meat-pie': '0erkqp3nekly',
  'bakso-sapi-premium': 'yrjo962jjj6j',
  'lapis-legit': 'pk25xg58j5pw',
};

/**
 * Lynk checkout URL for a course, tagged as website traffic, or null if the
 * course isn't on Lynk. `medium` says which page sent the buyer.
 */
export function lynkCheckoutUrl(
  courseSlug: string,
  medium: 'course_page' | 'landing_page' = 'course_page'
): string | null {
  const id = LYNK_CHECKOUT_IDS[courseSlug];
  if (!id) return null;
  const params = new URLSearchParams({ utm_source: 'website', utm_medium: medium, utm_campaign: courseSlug });
  return `https://lynk.id/cecelinachang/${id}/checkout?${params}`;
}

/**
 * Keeps an ad's tracking on the way to Lynk. If the visitor arrived with
 * utm_* tags (an ad), those replace the website tags so Lynk orders show which
 * ad sold. fbclid is passed through for the Meta pixel on Lynk.
 *
 * Lynk's webhook keeps utm_* but drops fbclid, so the Meta click ID (`fbc`,
 * from lib/adTags) rides in utm_id. The Apps Script webhook sends it to Meta
 * with the Purchase. utm_id held the campaign ID, which utm_campaign repeats.
 */
export function withAdTags(url: string, incomingSearch = ''): string {
  const incoming = new URLSearchParams(incomingSearch);
  const out = new URL(url);
  if (incoming.get('utm_source')) {
    for (const key of [...out.searchParams.keys()]) if (key.startsWith('utm_')) out.searchParams.delete(key);
    for (const [k, v] of incoming) if (k.startsWith('utm_')) out.searchParams.set(k, v);
  }
  const fbclid = incoming.get('fbclid');
  if (fbclid) out.searchParams.set('fbclid', fbclid);
  const fbc = incoming.get('fbc');
  if (fbc) out.searchParams.set('utm_id', fbc);
  return out.toString();
}
