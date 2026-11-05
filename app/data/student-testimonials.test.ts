import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { courses } from '@/app/data/courses';
import { extraUploads, STUDENT_TESTIMONIALS, testimonialsFor } from './student-testimonials';

describe('student testimonials', () => {
  it('every image is a file in /public (no external storage)', () => {
    for (const t of STUDENT_TESTIMONIALS) {
      expect(t.image.startsWith('/'), t.image).toBe(true);
      expect(existsSync(path.join(process.cwd(), 'public', t.image)), t.image).toBe(true);
    }
  });

  it('every testimonial points at a real course', () => {
    const slugs = new Set(courses.map((c) => c.slug));
    for (const t of STUDENT_TESTIMONIALS) expect(slugs.has(t.courseSlug), t.courseSlug).toBe(true);
  });

  it('puts the class own messages first', () => {
    const list = testimonialsFor('lapis-legit');
    expect(list[0].courseSlug).toBe('lapis-legit');
    expect(list).toHaveLength(STUDENT_TESTIMONIALS.length);
  });

  it('only adds admin uploads that are new', () => {
    const known = STUDENT_TESTIMONIALS[0].image;
    expect(extraUploads([known, '/images/uploads/testimonials/new/x.webp', '/images/testimonials/bakso-sapi-premium/wa-berhasil-enak.jpg'])).toEqual([
      '/images/uploads/testimonials/new/x.webp',
    ]);
  });
});
