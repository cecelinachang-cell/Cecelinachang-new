import { describe, expect, it } from 'vitest';
import { courses } from '@/app/data/courses';
import { lynkCheckoutUrl, withAdTags } from './lynk';

describe('lynkCheckoutUrl', () => {
  it('builds a tagged checkout URL for a course on Lynk', () => {
    expect(lynkCheckoutUrl('fu-kian')).toBe(
      'https://lynk.id/cecelinachang/ep36mr441n81/checkout?utm_source=website&utm_medium=course_page&utm_campaign=fu-kian'
    );
  });

  it('tags landing page traffic separately', () => {
    expect(lynkCheckoutUrl('bakso-sapi-premium', 'landing_page')).toBe(
      'https://lynk.id/cecelinachang/yrjo962jjj6j/checkout?utm_source=website&utm_medium=landing_page&utm_campaign=bakso-sapi-premium'
    );
  });

  it('returns null for a course that is not on Lynk', () => {
    expect(lynkCheckoutUrl('kelas-baru')).toBeNull();
  });

  it('covers every course in the catalog', () => {
    for (const course of courses) {
      expect(lynkCheckoutUrl(course.slug), course.slug).not.toBeNull();
    }
  });
});

describe('withAdTags', () => {
  const base = 'https://lynk.id/cecelinachang/yrjo962jjj6j/checkout?utm_source=website&utm_medium=landing_page&utm_campaign=bakso-sapi-premium';

  it('keeps the website tags for visitors without ad tags', () => {
    expect(withAdTags(base, '')).toBe(base);
  });

  it('replaces the website tags with the ad tags', () => {
    const url = new URL(withAdTags(base, '?utm_source=meta&utm_campaign=bakso&utm_content=123'));
    expect(url.searchParams.get('utm_source')).toBe('meta');
    expect(url.searchParams.get('utm_campaign')).toBe('bakso');
    expect(url.searchParams.get('utm_content')).toBe('123');
    expect(url.searchParams.has('utm_medium')).toBe(false);
  });

  it('passes fbclid through', () => {
    expect(new URL(withAdTags(base, '?fbclid=abc')).searchParams.get('fbclid')).toBe('abc');
  });

  it('puts the Meta click ID in utm_id, which Lynk keeps', () => {
    const url = new URL(withAdTags(base, '?utm_source=meta&utm_id=120250774433620687&fbclid=abc&fbc=fb.1.1794000000000.abc'));
    expect(url.searchParams.get('utm_id')).toBe('fb.1.1794000000000.abc');
    expect(url.searchParams.has('fbc')).toBe(false);
  });

  it('leaves utm_id alone when there is no click ID', () => {
    expect(new URL(withAdTags(base, '?utm_source=meta&utm_id=123')).searchParams.get('utm_id')).toBe('123');
  });
});
