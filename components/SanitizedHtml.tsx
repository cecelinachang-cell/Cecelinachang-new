'use client';

import { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// isomorphic-dompurify (jsdom-backed) so sanitizing produces the same output
// during SSR and on the client -- the plain browser `dompurify` package
// silently no-ops without `window`, which made the server-rendered HTML
// differ from the client's and triggered React hydration errors.
export function SanitizedHtml({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(() => DOMPurify.sanitize(html || ''), [html]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
