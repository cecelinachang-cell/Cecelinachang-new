'use client';

import { useSearchParams } from 'next/navigation';

function headlineContent(topic: string | null) {
  if (topic) {
    return (
      <>
        Baru Lihat Video <br />
        <span className="text-terracotta italic font-normal capitalize">{topic}</span>?
      </>
    );
  }
  return (
    <>
      Belajar Baking <br />
      <span className="text-terracotta italic font-normal">Anti Gagal</span>
    </>
  );
}

const HEADLINE_CLASS = 'text-fluid-h1 font-serif font-bold text-charcoal-brown leading-[1.1] mb-4 sm:mb-6';

/**
 * Static SSR shell shown while HeroHeadline (which needs useSearchParams,
 * and therefore a Suspense boundary) hasn't hydrated yet. Matches the
 * no-?v= copy exactly so most visitors see zero layout shift.
 */
export function HeroHeadlineFallback() {
  return <h1 className={HEADLINE_CLASS}>{headlineContent(null)}</h1>;
}

/**
 * Swaps the hero headline to reference whatever TikTok/IG video the
 * visitor is arriving from, via ?v= or ?utm_content= on the link in bio.
 */
export function HeroHeadline() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('v') || searchParams.get('utm_content');
  const topic = raw ? raw.replace(/[-_]/g, ' ') : null;
  return <h1 className={HEADLINE_CLASS}>{headlineContent(topic)}</h1>;
}
