import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { CACHE_SECONDS, TAGS, dbQuery, isDbConfigured } from '@/lib/db';

export interface Course {
  id: string;
  slug: string;
  isSignature: boolean;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  students: number;
  duration: string;
  modules: number;
  imageUrl: string;
  video?: string;
  benefits: string[];
  shopeeUrl?: string | null;
  orderIndex?: number;
  createdAt?: string;
}

// Cached so a page visit doesn't wake the database (Neon free plan, see
// lib/db.ts). Admin saves revalidate TAGS.courses.
export const getAllCourses = unstable_cache(
  async (): Promise<Course[]> => {
    if (!isDbConfigured()) {
      const { courses: fallbackCourses } = await import('@/app/data/courses');
      return fallbackCourses as unknown as Course[];
    }
    const { data, error } = await dbQuery<Course>((sql) => sql`select * from courses`);

    if (error || !data || data.length === 0) {
      if (error) console.error('Error fetching courses:', error.message);
      const { courses: fallbackCourses } = await import('@/app/data/courses');
      return fallbackCourses as unknown as Course[];
    }
    return data as Course[];
  },
  ['all-courses'],
  { revalidate: CACHE_SECONDS, tags: [TAGS.courses] },
);

// Cached like getAllCourses, so a page visit doesn't wake the database.
//
// generateMetadata() and the page component both call this, and without
// React's per-request cache() wrapping unstable_cache, those two calls
// aren't deduped within a single request -- they race as two independent
// async streams, which is what was tearing the metadata/body hydration
// and throwing React error #419 in production (never visible on
// localhost, where both calls resolve too fast for the race to matter).
export const getCourseBySlug = cache(unstable_cache(
  async (slug: string): Promise<Course | null> => {
    try {
      if (!isDbConfigured()) {
        const { courses: fallbackCourses } = await import('@/app/data/courses');
        return (fallbackCourses.find((c: any) => c.slug === slug) as unknown as Course) || null;
      }
      const { data, error } = await dbQuery<Course>((sql) => sql`select * from courses where slug = ${slug} limit 1`);
      if (error) console.error('Error fetching course detail:', error.message);
      if (data?.[0]) return data[0];
      const { courses: fallbackCourses } = await import('@/app/data/courses');
      return (fallbackCourses.find((c: any) => c.slug === slug) as unknown as Course) || null;
    } catch (err: any) {
      console.error('Unexpected error fetching course detail:', err?.message || err);
      const { courses: fallbackCourses } = await import('@/app/data/courses');
      return (fallbackCourses.find((c: any) => c.slug === slug) as unknown as Course) || null;
    }
  },
  ['course-by-slug'],
  { revalidate: CACHE_SECONDS, tags: [TAGS.courses] },
));

// Re-exported for convenience so server code can `import { ... } from
// '@/lib/courses'` for everything in one place. Client components should
// import these two directly from '@/lib/course-stats' instead, to avoid
// pulling this file's unstable_cache/database imports into the client
// bundle -- see the comment there.
export { pickFeatured, totalStudents } from './course-stats';
