import type { MetadataRoute } from 'next';
import { getAllCourses } from '@/lib/courses';
import { getAllProducts } from '@/lib/products';
import { SITE_URL } from '@/lib/links';

// Source routes from the same live-data helpers the pages themselves use
// (lib/courses.ts, lib/products.ts), not the static app/data/* fallback
// files. Products in particular have no slug column -- the live catalog
// uses Supabase UUID ids, while the fallback file uses human-readable ids
// -- so importing the fallback here silently pointed the sitemap at stale,
// mismatched /toko/<slug> URLs instead of the real /toko/<uuid> pages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const [courses, products] = await Promise.all([getAllCourses(), getAllProducts()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/kursus`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/toko`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/tentang`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/kontak`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/syarat-ketentuan`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/kebijakan-privasi`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course: any) => ({
    url: `${baseUrl}/kursus/${course.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${baseUrl}/toko/${product.id}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseRoutes, ...productRoutes];
}
