import { describe, expect, it } from 'vitest';
import { courses } from '@/app/data/courses';
import { lynkCheckoutUrl } from './lynk';

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
