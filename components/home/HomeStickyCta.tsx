'use client';

import { useState } from 'react';
import { StickyCtaBar } from '@/components/StickyCtaBar';
import LeadFormModal from '@/components/LeadFormModal';
import { trackConversion } from '@/lib/analytics';
import { parseIdr } from '@/lib/pixels';
import { waLink } from '@/lib/links';

interface HomeStickyCtaProps {
  course: { slug: string; title: string; price: string; originalPrice?: string };
}

/**
 * The homepage's sticky mobile CTA. Stays hidden until the hero's own
 * "Chat Cece, Daftar Kelas" button (#hero-cta) has scrolled out of view, so
 * it never doubles up with the hero CTA on first paint.
 */
export function HomeStickyCta({ course }: HomeStickyCtaProps) {
  const [showLeadForm, setShowLeadForm] = useState(false);

  return (
    <>
      <StickyCtaBar
        revealAfterId="hero-cta"
        price={course.price}
        originalPrice={course.originalPrice}
        caption="akses seumur hidup"
        primary={{
          label: 'Chat Cece, Daftar',
          icon: 'whatsapp',
          onClick: () => {
            trackConversion('lead_form_open', course.slug, {
              contentName: course.title,
              contentType: 'course',
              value: parseIdr(course.price),
            });
            setShowLeadForm(true);
          },
        }}
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
      {showLeadForm && (
        <LeadFormModal
          courseSlug={course.slug}
          courseTitle={course.title}
          coursePrice={course.price}
          onClose={() => setShowLeadForm(false)}
        />
      )}
    </>
  );
}
