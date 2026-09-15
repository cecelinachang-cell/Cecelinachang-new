import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { supabase } from '@/lib/supabase';

export type SiteAssets = Record<string, string>;

// Wrapped the same way as getCourseBySlug (lib/courses.ts): unstable_cache
// keeps repeat calls consistent within the revalidate window, and React's
// per-request cache() dedupes calls that share the exact same `keys` array
// within one render pass. See the comment on getCourseBySlug for the
// production hydration crash (React #419) this pattern exists to avoid.
export const getSiteAssets = cache(unstable_cache(
  async (keys: string[]): Promise<SiteAssets> => {
    try {
      const { data, error } = await supabase.from('settings').select('id, logo_url').in('id', keys);
      if (error || !data) return {};
      const assets: SiteAssets = {};
      data.forEach((item) => {
        if (item.logo_url) assets[item.id] = item.logo_url;
      });
      return assets;
    } catch {
      return {};
    }
  },
  ['site-assets'],
  { revalidate: 60 },
));
