import { unstable_cache } from 'next/cache';
import { CACHE_SECONDS, TAGS, dbQuery } from '@/lib/db';

export interface Testimonial {
  id: string;
  image: string;
  createdAt?: string;
}

/** Photo testimonials, newest first. Cached; the admin page revalidates on save. */
export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const { data, error } = await dbQuery<{ id: string; imageUrl: string | null; createdAt: string | null }>(
      (sql) => sql`select id, "imageUrl", "createdAt" from testimonials order by "createdAt" desc`,
    );
    if (error) {
      console.error('Error fetching testimonials:', error.message);
      return [];
    }
    return (data ?? [])
      .filter((row) => row.imageUrl)
      .map((row) => ({ id: row.id, image: row.imageUrl as string, createdAt: row.createdAt ?? undefined }));
  },
  ['testimonials'],
  { revalidate: CACHE_SECONDS, tags: [TAGS.testimonials] },
);
