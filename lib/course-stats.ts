// Pure, dependency-free helpers split out of lib/courses.ts so client
// components (e.g. app/tentang/page.tsx) can import them without pulling
// in that file's server-only unstable_cache/Supabase imports into the
// client bundle. `import type` below is erased at compile time, so this
// file has zero runtime dependency on lib/courses.ts.
import type { Course } from './courses';

export function pickFeatured(courses: Course[]): Course | undefined {
  return courses.find((c) => c.isSignature) ?? courses[0];
}

/**
 * Real number of online students (unique people), shown on the homepage and
 * /tentang. Counted 5 Nov 2026 from the viewer lists of the 8 class folders in
 * Cece's Google Drive: 743 people, rounded down. The earlier figure (10.024,
 * the sum of per-class counts) was an estimate, not a count. Update by hand
 * when the Drive lists grow; never add per-class numbers together (people
 * who bought two classes would count twice).
 */
export const STUDENTS_TOTAL = 740;

/** Per-class counts under this are not shown: a small true number reads worse than none. */
export const MIN_SHOWN_STUDENTS = 50;

/**
 * Counted students per class (same Drive count, 5 Nov 2026). These override
 * the `students` column in the database, which held estimates; the admin
 * form's student field no longer changes what visitors see.
 */
export const COUNTED_STUDENTS: Record<string, number> = {
  'bakso-sapi-premium': 457,
  'otak-otak': 195,
  'lapis-legit': 116,
  'go-hiong-roll': 47,
  'ogura-softcake': 31,
  'mocha-pandan-sponge': 26,
  'fu-kian': 13,
  'meat-pie': 11,
};

/** A course with its counted student number (0 for a class not counted yet). */
export function withCountedStudents<T extends { slug: string; students: number }>(course: T): T {
  return { ...course, students: COUNTED_STUDENTS[course.slug] ?? 0 };
}

export function showStudents(n: number | null | undefined): n is number {
  return typeof n === 'number' && n >= MIN_SHOWN_STUDENTS;
}
