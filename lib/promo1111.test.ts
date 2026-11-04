import { describe, expect, it } from 'vitest';
import { courses } from '@/app/data/courses';
import { buildPromoBundles, isPromoActive, PROMO_BUNDLES, promoCheckoutUrl } from './promo1111';

const at = (iso: string) => Date.parse(iso);

describe('isPromoActive', () => {
  it('runs from Wed 11 Nov 00:00 to Fri 13 Nov 23:59 WIB', () => {
    expect(isPromoActive(at('2026-11-10T23:59:59+07:00'))).toBe(false);
    expect(isPromoActive(at('2026-11-11T00:00:00+07:00'))).toBe(true);
    expect(isPromoActive(at('2026-11-13T23:59:59+07:00'))).toBe(true);
    expect(isPromoActive(at('2026-11-14T00:00:00+07:00'))).toBe(false);
  });

  it('can be previewed with ?preview_promo=1111', () => {
    expect(isPromoActive(at('2026-11-04T12:00:00+07:00'), '?preview_promo=1111')).toBe(true);
    expect(isPromoActive(at('2026-11-04T12:00:00+07:00'), '?preview_promo=yes')).toBe(false);
  });
});

describe('buildPromoBundles', () => {
  it('strikes through the real sum of the single prices', () => {
    const views = buildPromoBundles(courses);
    expect(views.map((v) => [v.key, v.normalPrice, v.price])).toEqual([
      ['gurih', 1_196_000, 699_000],
      ['hampers', 1_297_000, 849_000],
      ['semua', 2_892_000, 1_449_000],
    ]);
    expect(views[2].classTitles).toHaveLength(8);
  });

  it('every bundle class exists in the catalog', () => {
    const slugs = new Set(courses.map((c) => c.slug));
    for (const b of PROMO_BUNDLES) for (const s of b.courseSlugs) expect(slugs.has(s), s).toBe(true);
  });

  it('shows no strike price when a class is missing', () => {
    const views = buildPromoBundles(courses.filter((c) => c.slug !== 'fu-kian'));
    expect(views.find((v) => v.key === 'gurih')?.normalPrice).toBeNull();
  });
});

describe('promoCheckoutUrl', () => {
  it('tags plain website visits as the promo', () => {
    expect(promoCheckoutUrl('24ky8rx34p8q', 'gurih')).toBe(
      'https://lynk.id/cecelinachang/24ky8rx34p8q/checkout?utm_source=website&utm_medium=promo_1111&utm_campaign=1111_bundles&utm_content=gurih',
    );
  });

  it('keeps the ad tags of visitors who came from an ad', () => {
    const url = promoCheckoutUrl('e8r4plr9me83', 'hampers', '?utm_source=meta&utm_medium=paid&utm_campaign=1111_bundles&fbclid=x');
    expect(url).toBe(
      'https://lynk.id/cecelinachang/e8r4plr9me83/checkout?utm_source=meta&utm_medium=paid&utm_campaign=1111_bundles&utm_content=hampers',
    );
  });
});
