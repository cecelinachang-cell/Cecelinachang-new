import { absoluteUrl, STORE } from '@/lib/localStore';
import { parseIdr } from '@/lib/pixels';
import { stripHtml } from '@/lib/utils';
import { SITE_URL } from '@/lib/links';

// Search-facing <title> and meta description per course. The on-page H1
// stays the catalog title from Supabase; these carry the words people
// actually search ("kelas ... online", the dish's other names) and a call to
// action, inside Google's ~60 / ~155 character display limits. A course
// missing from this map falls back to its catalog title and description.
export const COURSE_SEO: Record<string, { title: string; description: string }> = {
  'bakso-sapi-premium': {
    title: 'Kelas Bakso Sapi Online, Kenyal ala Pabrik',
    description:
      'Belajar bikin bakso sapi kenyal, garing digigit, dan kaya rasa daging dari Cece, 18 tahun mengelola pabrik bakso. Video 40 menit, akses seumur hidup.',
  },
  'fu-kian': {
    title: 'Kelas Fu Kian: Bakso Ikan Kulit Tahu',
    description:
      'Kelas online Fu Kian (bakso ikan bungkus kulit tahu) ala restoran dimsum: gurih, kenyal, cocok untuk stok lauk atau jualan. Akses video seumur hidup.',
  },
  'go-hiong-roll': {
    title: 'Kelas Go Hiong / Ngohiong Roll Online',
    description:
      'Belajar Go Hiong Roll yang kulitnya krispi dan dagingnya juicy, lengkap dengan takaran bumbu ngohiong otentik. Kelas video online, akses seumur hidup.',
  },
  'lapis-legit': {
    title: 'Kelas Lapis Legit Online, Resep 3 Generasi',
    description:
      'Resep lapis legit keluarga 3 generasi: teknik panggang selapis demi selapis sampai moist, harum butter, dan motif rapi. Kelas video, akses seumur hidup.',
  },
  'meat-pie': {
    title: 'Kelas Meat Pie Online, Kulit Flaky',
    description:
      'Belajar meat pie dengan kulit renyah berlapis dan isian daging sapi bersaus demi-glace. Kelas video online, akses seumur hidup, bisa tanya ke Cece.',
  },
  'mocha-pandan-sponge': {
    title: 'Kelas Sponge Cake Mocha & Pandan Online',
    description:
      'Belajar sponge cake mocha dan pandan yang lembut, mengembang, dan tidak bantat. Kelas video online, akses seumur hidup, bisa konsultasi dengan Cece.',
  },
  'ogura-softcake': {
    title: 'Kelas Ogura Cake Online, 3 Varian',
    description:
      'Belajar ogura softcake selembut kapas dalam 3 rasa: matcha, cokelat, dan durian. Kelas video online, akses seumur hidup, bisa konsultasi dengan Cece.',
  },
  'otak-otak': {
    title: 'Kelas Otak-Otak Ikan Tenggiri Online',
    description:
      'Belajar otak-otak ikan tenggiri yang kenyal, gurih, dan wangi bakaran daun pisang. Kelas video online, akses seumur hidup, bisa tanya langsung ke Cece.',
  },
};

const BRAND_SUFFIX = ' | Cece Lina Chang';

type CourseLike = {
  slug: string;
  title: string;
  description: string;
  price: string;
  duration?: string;
  imageUrl?: string;
};

/** Cuts at the last whole word that fits, so a description never ends mid-word. */
export function trimAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–—-]+$/, '')}…`;
}

export function courseSeoTitle(course: CourseLike): string {
  return `${COURSE_SEO[course.slug]?.title ?? course.title}${BRAND_SUFFIX}`;
}

export function courseSeoDescription(course: CourseLike): string {
  return COURSE_SEO[course.slug]?.description ?? trimAtWord(stripHtml(course.description), 155);
}

/** "40 menit" -> "PT40M", "1 jam 20 menit" -> "PT1H20M"; null when there's no number to read. */
export function isoDuration(duration: string | undefined): string | null {
  if (!duration) return null;
  const hours = /(\d+)\s*jam/i.exec(duration);
  const minutes = /(\d+)\s*menit/i.exec(duration);
  if (!hours && !minutes) return null;
  return `PT${hours ? `${hours[1]}H` : ''}${minutes ? `${minutes[1]}M` : ''}`;
}

/**
 * schema.org Course for a course detail page (Google's "Course info" rich
 * result). Null when the price can't be read, since an Offer without a price
 * is invalid.
 */
export function courseJsonLd(course: CourseLike): Record<string, unknown> | null {
  const price = parseIdr(course.price);
  if (!price) return null;

  const url = absoluteUrl(`/kursus/${course.slug}`);
  const workload = isoDuration(course.duration);
  const image = course.imageUrl ? new URL(course.imageUrl, SITE_URL).toString() : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: trimAtWord(stripHtml(course.description), 500),
    url,
    ...(image ? { image } : {}),
    inLanguage: 'id',
    provider: { '@type': 'Organization', name: STORE.brand, sameAs: SITE_URL },
    offers: {
      '@type': 'Offer',
      category: 'Paid',
      price,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      url,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      ...(workload ? { courseWorkload: workload } : {}),
    },
  };
}
