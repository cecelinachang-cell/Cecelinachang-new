// Pure, dependency-free helpers split out of lib/courses.ts so client
// components (e.g. app/tentang/page.tsx) can import them without pulling
// in that file's server-only unstable_cache/Supabase imports into the
// client bundle. `import type` below is erased at compile time, so this
// file has zero runtime dependency on lib/courses.ts.
import type { Course } from './courses';

export function pickFeatured(courses: Course[]): Course | undefined {
  return courses.find((c) => c.isSignature) ?? courses[0];
}

export function totalStudents(courses: Pick<Course, 'students'>[]): number {
  return courses.reduce((sum, c) => sum + (c.students || 0), 0);
}
