'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import LeadFormModal from '@/components/LeadFormModal';
import { trackConversion } from '@/lib/analytics';
import { parseIdr } from '@/lib/pixels';
import { waLink } from '@/lib/links';
import type { Course } from '@/lib/courses';

interface HeroCtaProps {
  featured: Course;
  courses: Course[];
}

// Shared with the real component so the DOM id StickyCtaBar's
// IntersectionObserver looks for (see components/home/HomeStickyCta.tsx)
// exists from first paint, before this island hydrates.
const WRAPPER_CLASS = 'flex flex-col items-center lg:items-start gap-3';

/**
 * Cheapest course in the catalog by parsed price. Used so the hero's "Mulai"
 * claim is never higher than what /kursus actually sells -- the featured
 * (signature) course is not necessarily the cheapest one.
 */
function cheapestCourse(courses: Course[], fallback: Course): Course {
  return courses.reduce<Course>((min, c) => {
    const v = parseIdr(c.price);
    if (v === undefined) return min;
    const mv = parseIdr(min.price);
    return mv === undefined || v < mv ? c : min;
  }, fallback);
}

export function HeroCtaFallback({ featured, courses }: HeroCtaProps) {
  // No searchParams here (no Suspense boundary yet), so this always shows
  // the untagged, catalog-wide "Mulai" price -- never a single course's price.
  const cheapest = cheapestCourse(courses, featured);

  return (
    <div id="hero-cta" className={WRAPPER_CLASS}>
      <Button href={`/kursus/${cheapest.slug}`} variant="whatsapp" size="lg" fullWidth className="sm:w-fit">
        <WhatsAppIcon className="w-5 h-5 mr-2" /> Chat Cece, Daftar Kelas
      </Button>
      <span className="text-sm text-charcoal-brown/60">
        Mulai {cheapest.price} · akses seumur hidup · nggak perlu bikin akun
      </span>
      <a
        href={waLink('Halo Cece, aku mau tanya-tanya soal kelasnya dulu')}
        target="_blank"
        rel="noopener noreferrer"
        className="tap-target text-sm font-medium text-terracotta hover:text-rust-ink"
      >
        Masih bingung? Tanya Cece dulu →
      </a>
      <Link href="/kursus" className="text-sm text-terracotta font-medium hover:text-rust-ink inline-flex items-center gap-1">
        Lihat semua kelas <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

/**
 * Hero's primary CTA. When the visitor arrived via ?v=<course-slug> (a
 * TikTok/IG link tagged to a specific video), the button and price line
 * target that course instead of the site-wide featured one -- someone who
 * just watched a lapis legit video registers for lapis legit, not bakso.
 * In that case the caption shows that course's own price (no "Mulai" --
 * it isn't a range claim), so it never disagrees with the headline or the
 * form the button opens. Only the untagged path claims a catalog-wide
 * "Mulai", and there it uses the cheapest course, not the signature one.
 */
export function HeroCta({ featured, courses }: HeroCtaProps) {
  const searchParams = useSearchParams();
  const [showLeadForm, setShowLeadForm] = useState(false);

  const v = searchParams.get('v') || searchParams.get('utm_content');
  const tagged = v ? courses.find((c) => c.slug === v) : undefined;
  const target = tagged || featured;
  const cheapest = cheapestCourse(courses, featured);

  return (
    <div id="hero-cta" className={WRAPPER_CLASS}>
      <Button
        type="button"
        onClick={() => {
          trackConversion('lead_form_open', target.slug, {
            contentName: target.title,
            contentType: 'course',
            value: parseIdr(target.price),
          });
          setShowLeadForm(true);
        }}
        variant="whatsapp"
        size="lg"
        fullWidth
        className="sm:w-fit"
      >
        <WhatsAppIcon className="w-5 h-5 mr-2" /> Chat Cece, Daftar Kelas
      </Button>
      <span className="text-sm text-charcoal-brown/60">
        {tagged ? target.price : `Mulai ${cheapest.price}`} · akses seumur hidup · nggak perlu bikin akun
      </span>
      <a
        href={waLink(`Halo Cece, aku mau tanya-tanya soal ${target.title} dulu`)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackConversion('whatsapp_open', target.slug, {
            contentName: target.title,
            contentType: 'course',
            value: parseIdr(target.price),
          })
        }
        className="tap-target text-sm font-medium text-terracotta hover:text-rust-ink"
      >
        Masih bingung? Tanya Cece dulu →
      </a>
      <Link href="/kursus" className="text-sm text-terracotta font-medium hover:text-rust-ink inline-flex items-center gap-1">
        Lihat semua kelas <ArrowRight className="w-3.5 h-3.5" />
      </Link>

      {showLeadForm && (
        <LeadFormModal
          courseSlug={target.slug}
          courseTitle={target.title}
          coursePrice={target.price}
          onClose={() => setShowLeadForm(false)}
        />
      )}
    </div>
  );
}
