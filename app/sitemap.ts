import type { MetadataRoute } from 'next';
import { courses } from '@/app/data/courses';
import { products } from '@/app/data/products';
import { SITE_URL } from '@/lib/links';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

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
