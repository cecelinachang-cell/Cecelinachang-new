'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { stripHtml } from '@/lib/utils';

// DOMPurify needs a real DOM, so it cannot run while the page is rendered on
// the server. Rather than omitting the content there — which would hide it from
// crawlers — the server (and the first client render, so hydration matches)
// emits the text with tags stripped, and the sanitized rich markup is swapped
// in once the component mounts in the browser.
export function SanitizedHtml({ html, className }: { html: string; className?: string }) {
  const [clean, setClean] = useState<string | null>(null);

  useEffect(() => {
    setClean(DOMPurify.sanitize(html || ''));
  }, [html]);

  if (clean === null) {
    return <div className={className}>{stripHtml(html || '')}</div>;
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
