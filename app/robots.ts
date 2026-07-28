import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Admin and API routes hold no content worth crawling. /admin also sends
      // an X-Robots-Tag noindex header (see next.config.ts) since a robots.txt
      // block alone stops crawling, not indexing.
      disallow: ['/admin', '/admin/', '/api/'],
    },
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
