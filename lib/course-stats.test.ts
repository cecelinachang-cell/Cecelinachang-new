import { describe, expect, it } from 'vitest';
import { courses } from '@/app/data/courses';
import { COUNTED_STUDENTS, showStudents, STUDENTS_TOTAL, withCountedStudents } from './course-stats';

describe('student counts', () => {
  it('overrides database estimates with the counted numbers', () => {
    expect(withCountedStudents({ slug: 'bakso-sapi-premium', students: 4509 }).students).toBe(469);
    expect(withCountedStudents({ slug: 'kelas-baru', students: 999 }).students).toBe(0);
  });

  it('the fallback catalog uses the same counted numbers', () => {
    for (const c of courses) expect(c.students, c.slug).toBe(COUNTED_STUDENTS[c.slug]);
  });

  it('the total is unique people, never more than the sum of classes', () => {
    const sum = Object.values(COUNTED_STUDENTS).reduce((a, b) => a + b, 0);
    expect(STUDENTS_TOTAL).toBeLessThanOrEqual(sum);
  });

  it('hides small per-class numbers', () => {
    expect(showStudents(11)).toBe(false);
    expect(showStudents(457)).toBe(true);
    expect(showStudents(undefined)).toBe(false);
  });
});
