import type { MetadataRoute } from 'next';
import { getAllCourses } from '@/lib/courses';
import { getAllProducts } from '@/lib/products';
import { productPublicPath } from '@/lib/productSlug';
import { SITE_URL } from '@/lib/links';

// Product URLs are name slugs (/toko/signora-oven-de-luna), not the Supabase
// UUID or the static fallback id. getAllProducts assigns the same slug from
// the product name for either source. Old id URLs 308 to the slug.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const [courses, products] = await Promise.all([getAllCourses(), getAllProducts()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/kursus`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/toko`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/toko/oven`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/toko/signora`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/toko/peralatan-masak`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/kelas-masak-tangerang`, changeFrequency: 'weekly', priority: 0.8 },
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

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}${productPublicPath(product)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseRoutes, ...productRoutes];
}
