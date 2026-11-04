import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { CACHE_SECONDS, TAGS, dbQuery } from '@/lib/db';

export type SiteAssets = Record<string, string>;

// Wrapped the same way as getCourseBySlug (lib/courses.ts): unstable_cache
// keeps repeat calls consistent within the revalidate window, and React's
// per-request cache() dedupes calls that share the exact same `keys` array
// within one render pass. See the comment on getCourseBySlug for the
// production hydration crash (React #419) this pattern exists to avoid.
export const getSiteAssets = cache(unstable_cache(
  async (keys: string[]): Promise<SiteAssets> => {
    try {
      const { data, error } = await dbQuery<{ id: string; logo_url: string | null }>(
        (sql) => sql`select id, logo_url from settings where id = any(${keys})`,
      );
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
  { revalidate: CACHE_SECONDS, tags: [TAGS.settings] },
));

export type SettingRow = { id: string; title: string | null; description: string | null; logo_url: string | null };

/** Full settings rows (title, description, image), cached like getSiteAssets. */
export const getSettingRows = cache(unstable_cache(
  async (ids: string[]): Promise<SettingRow[]> => {
    const { data } = await dbQuery<SettingRow>(
      (sql) => sql`select id, title, description, logo_url from settings where id = any(${ids})`,
    );
    return data ?? [];
  },
  ['setting-rows'],
  { revalidate: CACHE_SECONDS, tags: [TAGS.settings] },
));
