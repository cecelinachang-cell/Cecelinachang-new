'use client';

import { StickyCtaBar } from '@/components/StickyCtaBar';
import { trackConversion } from '@/lib/analytics';
import { parseIdr } from '@/lib/pixels';
import { waLink } from '@/lib/links';

interface HomeStickyCtaProps {
  course: { slug: string; title: string; price: string; originalPrice?: string };
}

/**
 * The homepage's sticky mobile CTA. Stays hidden until the hero's own
 * "Pilih Kelasnya" button (#hero-cta) has scrolled out of view, so
 * it never doubles up with the hero CTA on first paint.
 */
export function HomeStickyCta({ course }: HomeStickyCtaProps) {
  return (
    <>
      <StickyCtaBar
        revealAfterId="hero-cta"
        price={course.price}
        originalPrice={course.originalPrice}
        caption="akses seumur hidup"
        primary={{ label: 'Pilih Kelas', icon: 'arrow', href: '/kursus' }}
        secondary={{
          label: 'Tanya Dulu',
          icon: 'whatsapp',
          variant: 'secondary',
          href: waLink(`Halo Cece, aku mau tanya-tanya soal ${course.title} dulu`),
          external: true,
          onClick: () =>
            trackConversion('whatsapp_open', course.slug, {
              contentName: course.title,
              contentType: 'course',
              value: parseIdr(course.price),
            }),
        }}
      />
    </>
  );
}
