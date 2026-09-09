/**
 * Which image sources the Next.js image optimizer is allowed to fetch.
 *
 * `next/image` returns a 400 for any remote host missing from `remotePatterns`
 * in next.config.ts, and several images on this site come from admin-editable
 * settings rows that may point anywhere. Those must render with `unoptimized`,
 * so this mirrors the config allowlist and lets components decide per image.
 *
 * Keep in sync with `images.remotePatterns` in next.config.ts.
 */
const STATIC_ALLOWED_HOSTS = ['picsum.photos', 'i.postimg.cc', 'signora.co.id'];

function supabaseHost(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/** True when `src` can go through /_next/image; false means pass `unoptimized`. */
export function isOptimizableImage(src?: string | null): boolean {
  if (!src) return false;
  // Local files under /public are always optimizable.
  if (src.startsWith('/')) return true;
  if (src.startsWith('data:') || src.startsWith('blob:')) return false;

  try {
    const { hostname } = new URL(src);
    const supabase = supabaseHost();
    return STATIC_ALLOWED_HOSTS.includes(hostname) || (supabase !== null && hostname === supabase);
  } catch {
    return false;
  }
}
