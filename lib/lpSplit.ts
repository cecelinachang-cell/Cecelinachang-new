/**
 * 50/50 split test of the landing page's first screen (Nov 2026).
 *
 * Arm A is the current hero (headline, video, then the buy button). Arm B
 * puts who teaches it, the buy button, a student quote and what's included
 * on the first screen and moves the video below (components/landing/
 * LandingHeroB.tsx). Everything below the hero is the same in both arms.
 *
 * Why: Meta showed ~95% of landing-page visitors leave without tapping
 * "Bayar Sekarang" and ~80% never scroll a quarter of the page, so the
 * first screen is where the sale is won or lost.
 *
 * middleware.ts puts each visitor in an arm once (cookie, 30 days) and
 * rewrites to /lp/[slug]/b for arm B; the address bar never changes. Each
 * arm reports its own Meta custom events, LP_View_A/B and LP_Checkout_A/B,
 * and tags the Lynk link with utm_term=lp-a/lp-b. Read the result with
 * docs/lp-split-test.md. Pure, so the edge middleware and tests share it.
 */
export type LpArm = 'a' | 'b';

export const LP_SPLIT_COOKIE = 'lp_ab';
export const LP_SPLIT_MAX_AGE = 60 * 60 * 24 * 30;

/** Landing pages currently in the test. Empty this to end it (everyone gets A). */
export const LP_SPLIT_SLUGS: ReadonlySet<string> = new Set(['bakso-sapi-premium']);

export function isSplitActive(slug: string): boolean {
  return LP_SPLIT_SLUGS.has(slug);
}

function asArm(value: string | null | undefined): LpArm | null {
  const v = value?.trim().toLowerCase();
  return v === 'a' || v === 'b' ? v : null;
}

/**
 * The visitor's arm: `?lp=a|b` (for checking a version by hand) wins, then
 * the cookie from an earlier visit, then a coin flip. `fresh` says whether
 * the cookie needs to be (re)written.
 */
export function chooseArm(
  override: string | null | undefined,
  cookie: string | null | undefined,
  random: () => number = Math.random
): { arm: LpArm; fresh: boolean } {
  const forced = asArm(override);
  if (forced) return { arm: forced, fresh: forced !== asArm(cookie) };
  const saved = asArm(cookie);
  if (saved) return { arm: saved, fresh: false };
  return { arm: random() < 0.5 ? 'a' : 'b', fresh: true };
}

/** Internal path that renders this arm (+ the ad-matched headline, if any). */
export function armPath(slug: string, arm: LpArm, variantKey: string | null): string {
  const base = arm === 'b' ? `/lp/${slug}/b` : `/lp/${slug}`;
  return variantKey ? `${base}/v/${variantKey}` : base;
}
