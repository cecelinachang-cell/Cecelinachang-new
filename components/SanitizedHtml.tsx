'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

// Server components can't run DOMPurify (needs `window`), so descriptions
// authored as HTML via the admin RichTextEditor are sanitized client-side
// here before being injected.
export function SanitizedHtml({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(() => DOMPurify.sanitize(html || ''), [html]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
