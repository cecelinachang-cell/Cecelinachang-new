import { describe, expect, it } from 'vitest';
import { COURSE_SEO, courseJsonLd, courseSeoDescription, courseSeoTitle, isoDuration, trimAtWord } from './courseSeo';

const bakso = {
  slug: 'bakso-sapi-premium',
  title: 'Kelas Bakso Sapi Premium',
  description: '<p>Belajar langsung dari ahlinya!</p>',
  price: 'Rp 399.000',
  duration: '40 menit',
  imageUrl: '/images/bakso-sapi-premium.webp',
};

describe('COURSE_SEO', () => {
  it('keeps every title and description inside Google display limits', () => {
    for (const [slug, seo] of Object.entries(COURSE_SEO)) {
      expect(courseSeoTitle({ ...bakso, slug }).length, slug).toBeLessThanOrEqual(60);
      expect(seo.description.length, slug).toBeLessThanOrEqual(155);
    }
  });
});

describe('courseSeoTitle / courseSeoDescription', () => {
  it('uses the mapped copy, or falls back to the catalog', () => {
    expect(courseSeoTitle(bakso)).toBe('Kelas Bakso Sapi Online, Kenyal ala Pabrik | Cece Lina Chang');
    const unknown = { ...bakso, slug: 'kelas-baru', title: 'Kelas Baru' };
    expect(courseSeoTitle(unknown)).toBe('Kelas Baru | Cece Lina Chang');
    expect(courseSeoDescription(unknown)).toBe('Belajar langsung dari ahlinya!');
  });
});

describe('trimAtWord', () => {
  it('never cuts a word in half', () => {
    const out = trimAtWord('satu dua tiga empat lima enam', 16);
    expect(out).toBe('satu dua tiga…');
    expect(out.length).toBeLessThanOrEqual(16);
    expect(trimAtWord('pendek', 50)).toBe('pendek');
  });
});

describe('isoDuration', () => {
  it('reads Indonesian durations', () => {
    expect(isoDuration('40 menit')).toBe('PT40M');
    expect(isoDuration('1 jam 20 menit')).toBe('PT1H20M');
    expect(isoDuration('seumur hidup')).toBeNull();
    expect(isoDuration(undefined)).toBeNull();
  });
});

describe('courseJsonLd', () => {
  it('builds a Course with a priced Offer and an online instance', () => {
    const ld = courseJsonLd(bakso) as Record<string, any>;
    expect(ld['@type']).toBe('Course');
    expect(ld.url).toBe('https://www.cecelinachang.com/kursus/bakso-sapi-premium');
    expect(ld.image).toBe('https://www.cecelinachang.com/images/bakso-sapi-premium.webp');
    expect(ld.offers).toMatchObject({ price: 399000, priceCurrency: 'IDR', category: 'Paid' });
    expect(ld.hasCourseInstance).toEqual({ '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: 'PT40M' });
  });

  it('returns null without a readable price', () => {
    expect(courseJsonLd({ ...bakso, price: 'Gratis' })).toBeNull();
  });
});
