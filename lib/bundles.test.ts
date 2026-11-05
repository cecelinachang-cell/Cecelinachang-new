import { describe, expect, it } from 'vitest';
import { courses } from '@/app/data/courses';
import { buildClassBundles, bundleCheckoutUrl, CLASS_BUNDLES } from './bundles';

describe('buildClassBundles', () => {
  it('shows the normal bundle price against the real sum of the single prices', () => {
    const views = buildClassBundles(courses);
    expect(views.map((v) => [v.key, v.singlesTotal, v.price])).toEqual([
      ['gurih', 1_196_000, 899_000],
      ['hampers', 1_297_000, 949_000],
    ]);
  });

  it('every bundle class exists in the catalog', () => {
    const slugs = new Set(courses.map((c) => c.slug));
    for (const b of CLASS_BUNDLES) for (const s of b.courseSlugs) expect(slugs.has(s), s).toBe(true);
  });

  it('shows no strike price when a class is missing', () => {
    const views = buildClassBundles(courses.filter((c) => c.slug !== 'fu-kian'));
    expect(views.find((v) => v.key === 'gurih')?.singlesTotal).toBeNull();
  });
});

describe('bundleCheckoutUrl', () => {
  it('tags plain website visits as the bundle section', () => {
    expect(bundleCheckoutUrl('24ky8rx34p8q', 'gurih')).toBe(
      'https://lynk.id/cecelinachang/24ky8rx34p8q/checkout?utm_source=website&utm_medium=bundle&utm_campaign=class_bundles&utm_content=gurih',
    );
  });

  it('keeps the ad tags and fbclid of visitors who came from an ad', () => {
    const url = new URL(bundleCheckoutUrl('e8r4plr9me83', 'hampers', '?utm_source=meta&utm_medium=paid&utm_campaign=bundles&fbclid=x'));
    expect(url.searchParams.get('utm_source')).toBe('meta');
    expect(url.searchParams.get('utm_medium')).toBe('paid');
    expect(url.searchParams.get('utm_content')).toBe('hampers');
    expect(url.searchParams.get('fbclid')).toBe('x');
  });
});
