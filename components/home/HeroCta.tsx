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
import type { Course } from '@/lib/courses';

interface HeroCtaProps {
  featured: Course;
  courses: Course[];
}

// Shared with the real component so the DOM id StickyCtaBar's
// IntersectionObserver looks for (see components/home/HomeStickyCta.tsx)
// exists from first paint, before this island hydrates.
const WRAPPER_CLASS = 'flex flex-col items-center lg:items-start gap-3';

export function HeroCtaFallback({ featured }: { featured: Course }) {
  return (
    <div id="hero-cta" className={WRAPPER_CLASS}>
      <Button href={`/kursus/${featured.slug}`} variant="whatsapp" size="lg" fullWidth className="sm:w-fit">
        <WhatsAppIcon className="w-5 h-5 mr-2" /> Chat Cece, Daftar Kelas
      </Button>
      <span className="text-sm text-charcoal-brown/60">
        Mulai {featured.price} · akses seumur hidup · nggak perlu bikin akun
      </span>
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
 */
export function HeroCta({ featured, courses }: HeroCtaProps) {
  const searchParams = useSearchParams();
  const [showLeadForm, setShowLeadForm] = useState(false);

  const v = searchParams.get('v') || searchParams.get('utm_content');
  const target = (v && courses.find((c) => c.slug === v)) || featured;

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
        Mulai {target.price} · akses seumur hidup · nggak perlu bikin akun
      </span>
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
