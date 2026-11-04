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

/** Lynk checkout URL for a course, tagged as website traffic, or null if the course isn't on Lynk. */
export function lynkCheckoutUrl(courseSlug: string): string | null {
  const id = LYNK_CHECKOUT_IDS[courseSlug];
  if (!id) return null;
  const params = new URLSearchParams({ utm_source: 'website', utm_medium: 'course_page', utm_campaign: courseSlug });
  return `https://lynk.id/cecelinachang/${id}/checkout?${params}`;
}
