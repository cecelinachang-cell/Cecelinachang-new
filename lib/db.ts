import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Server-only Postgres access (Neon, over HTTP). Never import from a client
 * component: DATABASE_URL carries the database password.
 *
 * Neon's free plan wakes the compute for 5 minutes on every query and allows
 * 100 compute-hours a month, so public reads go through Next's cache
 * (CACHE_SECONDS) and the site never writes on a plain page view.
 */
let client: NeonQueryFunction<false, false> | null = null;

/** How long public pages may serve cached catalog data before re-reading. */
export const CACHE_SECONDS = 3600;

/** Cache tags, revalidated by the admin API after a save. */
export const TAGS = {
  courses: 'db:courses',
  items: 'db:items',
  settings: 'db:settings',
  testimonials: 'db:testimonials',
} as const;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  client ??= neon(url);
  return client;
}

export type DbResult<T> = { data: T[] | null; error: Error | null };

/**
 * Runs a query and returns supabase-style `{ data, error }` instead of
 * throwing, so callers keep their existing fallback-on-error paths.
 */
export async function dbQuery<T>(
  run: (sql: NeonQueryFunction<false, false>) => Promise<Record<string, unknown>[]>,
): Promise<DbResult<T>> {
  try {
    if (!isDbConfigured()) return { data: null, error: new Error('DATABASE_URL is not set') };
    return { data: (await run(getSql())) as T[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
