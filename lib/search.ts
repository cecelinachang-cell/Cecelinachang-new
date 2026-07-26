import { products as fallbackProducts } from '@/app/data/products';
import { courses as fallbackCourses } from '@/app/data/courses';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type SearchResult = {
  type: 'product' | 'course';
  id: string;
  slug: string;
  title: string;
  price: string | null;
  image: string | null;
  category: string | null;
};

export type CatalogProduct = {
  id: string;
  name: string;
  price?: string | null;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

export type CatalogCourse = {
  id: string;
  slug: string;
  title: string;
  price?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

function firstImage(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  try {
    const parsed = JSON.parse(imageUrl);
    if (Array.isArray(parsed) && parsed.length) return parsed[0];
  } catch {
    // Not a JSON array — treat the raw string as the image URL.
  }
  return imageUrl;
}

export async function getCatalogData(): Promise<{ products: CatalogProduct[]; courses: CatalogCourse[] }> {
  if (!isSupabaseConfigured()) {
    return { products: fallbackProducts, courses: fallbackCourses };
  }

  try {
    const [{ data: products, error: productsError }, { data: courses, error: coursesError }] = await Promise.all([
      supabase.from('items').select('id, name, price, category, description, imageUrl'),
      supabase.from('courses').select('id, slug, title, price, description, imageUrl'),
    ]);

    return {
      products: !productsError && products?.length ? (products as CatalogProduct[]) : fallbackProducts,
      courses: !coursesError && courses?.length ? (courses as CatalogCourse[]) : fallbackCourses,
    };
  } catch {
    return { products: fallbackProducts, courses: fallbackCourses };
  }
}

export function searchCatalog(
  query: string,
  data: { products: CatalogProduct[]; courses: CatalogCourse[] },
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const productMatches: SearchResult[] = data.products
    .filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q),
    )
    .map((p) => ({
      type: 'product' as const,
      id: p.id,
      slug: p.id,
      title: p.name,
      price: p.price ?? null,
      image: firstImage(p.imageUrl),
      category: p.category ?? null,
    }));

  const courseMatches: SearchResult[] = data.courses
    .filter((c) =>
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q),
    )
    .map((c) => ({
      type: 'course' as const,
      id: c.id,
      slug: c.slug,
      title: c.title,
      price: c.price ?? null,
      image: firstImage(c.imageUrl),
      category: null,
    }));

  return [...productMatches, ...courseMatches];
}
