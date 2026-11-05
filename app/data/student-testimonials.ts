/**
 * Real WhatsApp messages from students, curated by hand. The images live in
 * /public, so they are served with the site and never depend on a database or
 * storage bill. `quote` repeats the message as text (readable, searchable).
 * New photos uploaded in admin still show after these (lib/testimonials.ts).
 */
export interface StudentTestimonial {
  image: string;
  width: number;
  height: number;
  quote: string;
  courseSlug: string;
  courseLabel: string;
}

export const STUDENT_TESTIMONIALS: StudentTestimonial[] = [
  {
    image: '/images/testimonials/bakso-sapi-premium/wa-kenyel.jpg',
    width: 514,
    height: 800,
    quote: 'Mantap baksonya Cece... kenyel kenyel seperti yang saya mau. Baru nyoba langsung jatuh cinta.',
    courseSlug: 'bakso-sapi-premium',
    courseLabel: 'Kelas Bakso Sapi Premium',
  },
  {
    image: '/images/testimonials/bakso-sapi-premium/wa-ayam-cucu.jpg',
    width: 489,
    height: 800,
    quote: 'Pertama kali coba gagal, kemarin coba lagi... mantap banget. Begitu angkat langsung habis sama cucu.',
    courseSlug: 'bakso-sapi-premium',
    courseLabel: 'Kelas Bakso Sapi Premium',
  },
  {
    image: '/images/uploads/testimonials/new/1789798950857-ok800akdep.webp',
    width: 753,
    height: 906,
    quote: 'Cece terima kasih resepnya. Saya baru coba semalam, terbaik resepnya.',
    courseSlug: 'lapis-legit',
    courseLabel: 'Kelas Lapis Legit 3 Generasi',
  },
  {
    image: '/images/uploads/testimonials/new/1789798949882-hli05v0j8x.webp',
    width: 502,
    height: 965,
    quote: 'Ce Lina, sudah jadi Go Hiong-nya. Anak-anak suka, terima kasih resepnya.',
    courseSlug: 'go-hiong-roll',
    courseLabel: 'Kelas Go Hiong Roll',
  },
  {
    image: '/images/uploads/testimonials/new/1788243729627-w7xgbdbo4wk.webp',
    width: 726,
    height: 724,
    quote: 'Bakso-nya berhasil Ce, enak!',
    courseSlug: 'bakso-sapi-premium',
    courseLabel: 'Kelas Bakso Sapi Premium',
  },
];

/** Same picture under two paths (admin upload and landing-page copy). */
const DUPLICATE_IMAGES = new Set(['/images/testimonials/bakso-sapi-premium/wa-berhasil-enak.jpg']);

/** The curated list, this course's messages first. */
export function testimonialsFor(courseSlug?: string): StudentTestimonial[] {
  if (!courseSlug) return STUDENT_TESTIMONIALS;
  const own = STUDENT_TESTIMONIALS.filter((t) => t.courseSlug === courseSlug);
  const rest = STUDENT_TESTIMONIALS.filter((t) => t.courseSlug !== courseSlug);
  return [...own, ...rest];
}

/** Admin-uploaded photos that are not already in the curated list. */
export function extraUploads(images: string[]): string[] {
  const known = new Set(STUDENT_TESTIMONIALS.map((t) => t.image));
  return images.filter((src) => !known.has(src) && !DUPLICATE_IMAGES.has(src));
}
