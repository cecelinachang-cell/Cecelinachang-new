import type { MetadataRoute } from 'next';
import { supabasePublic, isSupabaseConfigured } from '@/lib/supabase';
import { fetchProducts } from '@/lib/fetchProducts';
import { courses } from '@/app/data/courses';
import { products as fallbackProducts } from '@/app/data/products';
import { SITE_URL } from '@/lib/seo';

// Regenerate hourly so newly published courses and products get discovered
// without a redeploy.
export const revalidate = 3600;

type CourseRow = { slug: string; updatedAt?: string; createdAt?: string };
type ItemRow = { id: string; updatedAt?: string; createdAt?: string };

function lastModified(row: { updatedAt?: string; createdAt?: string }): Date {
  const stamp = row.updatedAt || row.createdAt;
  const date = stamp ? new Date(stamp) : null;
  return date && !Number.isNaN(date.getTime()) ? date : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/kursus`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/toko`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/resep`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/tentang`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/kontak`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Live rows when Supabase is reachable, local seed data otherwise, so the
  // sitemap always matches what the pages actually render.
  const [courseRows, itemRows] = await Promise.all([
    fetchProducts<CourseRow>({
      isConfigured: isSupabaseConfigured(),
      query: () => supabasePublic.from('courses').select('slug, createdAt, updatedAt'),
      fallback: courses as unknown as CourseRow[],
    }),
    fetchProducts<ItemRow>({
      isConfigured: isSupabaseConfigured(),
      query: () => supabasePublic.from('items').select('id, createdAt, updatedAt'),
      fallback: fallbackProducts as unknown as ItemRow[],
    }),
  ]);

  const courseRoutes: MetadataRoute.Sitemap = courseRows
    .filter((course) => Boolean(course.slug))
    .map((course) => ({
      url: `${SITE_URL}/kursus/${course.slug}`,
      lastModified: lastModified(course),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  const productRoutes: MetadataRoute.Sitemap = itemRows
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      url: `${SITE_URL}/toko/${item.id}`,
      lastModified: lastModified(item),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  // /resep/[slug] is intentionally excluded while those pages stay noindexed.
  return [...staticRoutes, ...courseRoutes, ...productRoutes];
}
