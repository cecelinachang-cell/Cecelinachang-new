/**
 * Picks the ad-matched headline for a landing page (copy.adVariants). The ad
 * name arrives as utm_content; a variant matches when the name contains its
 * `match` word, case-insensitive. First match wins. Pure, so middleware.ts
 * (edge) and tests can share it.
 */
export interface AdVariantRule {
  key: string;
  match: string;
}

export function matchAdVariant(variants: readonly AdVariantRule[] | undefined, utmContent: string | null | undefined): string | null {
  if (!variants?.length || !utmContent) return null;
  const name = utmContent.toLowerCase();
  const hit = variants.find((v) => v.match && name.includes(v.match.toLowerCase()));
  return hit ? hit.key : null;
}
