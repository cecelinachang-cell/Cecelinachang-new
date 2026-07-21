// Minimal in-memory fixed-window rate limiter for the public API routes.
// State is per server instance, so this is abuse mitigation (LLM cost burn,
// lead-table spam), not a hard distributed guarantee — good enough for a
// single-instance deployment without adding Redis.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(k);
    }
    if (buckets.size > MAX_BUCKETS) buckets.clear();
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  existing.count += 1;
  return existing.count > limit;
}
