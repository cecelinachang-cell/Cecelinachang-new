'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isMetaPixelPath, META_PIXEL_ID, trackMeta } from '@/lib/meta-pixel';

// The base snippet sends PageView for the document's first URL when that URL
// is public. Client-side route changes need their own call, or Meta only
// records the landing page.
let decidedInitial = false;
let initialWasPublic = false;
let lastTrackedPath: string | null = null;

export default function MetaPixel() {
  const pathname = usePathname() || '/';
  const enabled = isMetaPixelPath(pathname);

  useEffect(() => {
    if (!decidedInitial) {
      decidedInitial = true;
      initialWasPublic = isMetaPixelPath(pathname);
    }
    if (!isMetaPixelPath(pathname) || lastTrackedPath === pathname) return;
    const baseSnippetAlreadyTracked = lastTrackedPath === null && initialWasPublic;
    lastTrackedPath = pathname;
    if (baseSnippetAlreadyTracked) return;
    trackMeta('PageView');
  }, [pathname]);

  if (!enabled) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        alt=""
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
