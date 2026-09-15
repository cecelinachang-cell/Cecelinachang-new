import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

// Next 15 doesn't cache fetch() by default and supabase-js's internal fetch
// doesn't opt in, so a page's `revalidate = 60` caches nothing on its own --
// every visit re-hits Supabase and renders dynamically. Wrap the fetch.
export const getAllCourses = unstable_cache(
  async (): Promise<Course[]> => {
    if (!isSupabaseConfigured()) {
      const { courses: fallbackCourses } = await import('@/app/data/courses');
      return fallbackCourses as unknown as Course[];
    }
    const { data, error } = await supabase.from('courses').select('*');

    if (error || !data || data.length === 0) {
      if (error && error.message && error.message.includes('schema cache')) {
        console.warn('Supabase schema not initialized yet.');
      } else if (error) {
        const errMsg = error?.message || (error as any)?.toString() || '';
        if (errMsg === 'Failed to fetch' || errMsg.includes('Failed to fetch')) {
          console.warn('AdBlocker or Network issue detected. Falling back to mock data.');
        } else {
          console.error('Error fetching courses:', errMsg);
        }
      }
      const { courses: fallbackCourses } = await import('@/app/data/courses');
      return fallbackCourses as unknown as Course[];
    }
    return data as Course[];
  },
  ['all-courses'],
  { revalidate: 60 },
);

// Next 15 no longer caches `fetch` by default, and supabase-js's internal
// fetch doesn't opt in -- so without this, every request re-hits Supabase
// and the whole route renders dynamically (a page's `revalidate = 60`
// only caches the render, not the data fetch it depends on).
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
      if (!isSupabaseConfigured()) {
        const { courses: fallbackCourses } = await import('@/app/data/courses');
        return (fallbackCourses.find((c: any) => c.slug === slug) as unknown as Course) || null;
      }
      const { data, error } = await supabase.from('courses').select('*').eq('slug', slug).single();
      if (error) {
        const errMsg = error?.message || (error as any)?.toString() || '';
        if (errMsg !== 'Failed to fetch' && !errMsg.includes('Failed to fetch')) {
          console.error('Error fetching course detail:', errMsg);
        }
      }
      if (data) return data as Course;
      const { courses: fallbackCourses } = await import('@/app/data/courses');
      return (fallbackCourses.find((c: any) => c.slug === slug) as unknown as Course) || null;
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || '';
      if (errMsg !== 'Failed to fetch' && !errMsg.includes('Failed to fetch')) {
        console.error('Unexpected error fetching course detail:', err);
      }
      const { courses: fallbackCourses } = await import('@/app/data/courses');
      return (fallbackCourses.find((c: any) => c.slug === slug) as unknown as Course) || null;
    }
  },
  ['course-by-slug'],
  { revalidate: 60 },
));

export function pickFeatured(courses: Course[]): Course | undefined {
  return courses.find((c) => c.isSignature) ?? courses[0];
}

export function totalStudents(courses: Course[]): number {
  return courses.reduce((sum, c) => sum + (c.students || 0), 0);
}
