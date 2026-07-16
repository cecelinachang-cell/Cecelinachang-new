import type { MetadataRoute } from 'next';
import { courses } from '@/app/data/courses';
import { products } from '@/app/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cecelinachang.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/kursus`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/toko`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/resep`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/tentang`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/kontak`, changeFrequency: 'monthly', priority: 0.5 },
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
