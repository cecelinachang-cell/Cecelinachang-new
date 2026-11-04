/**
 * Admin session for the single shared admin password (ADMIN_PASSWORD).
 *
 * The cookie value is `<expiresAtMs>.<signature>`, where the signature is an
 * HMAC-SHA256 of the expiry under ADMIN_SESSION_SECRET. Web Crypto only, so
 * the same code runs in middleware (edge) and in route handlers (node).
 * Changing ADMIN_SESSION_SECRET logs every admin out.
 */
export const ADMIN_COOKIE = 'cece_admin';
export const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = '';
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(`admin:${payload}`)));
}

/** Compares in time independent of where the strings first differ. */
export function safeEqual(a: string, b: string): boolean {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

export async function createSessionToken(secret: string, now = Date.now()): Promise<string> {
  const expires = String(now + SESSION_MS);
  return `${expires}.${await sign(expires, secret)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token || !secret) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) <= now) return false;
  return safeEqual(signature, await sign(expires, secret));
}

/** Reads the admin cookie from a request and verifies it. */
export async function isAdminRequest(request: Request): Promise<boolean> {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.split(/;\s*/).find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  const token = match ? decodeURIComponent(match.slice(ADMIN_COOKIE.length + 1)) : undefined;
  return verifySessionToken(token, process.env.ADMIN_SESSION_SECRET);
}
