import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, SESSION_MS, createSessionToken, safeEqual } from '@/lib/adminSession';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Single shared admin password (ADMIN_PASSWORD). A correct password gets a
// signed, httpOnly session cookie; see lib/adminSession.ts.
export async function POST(request: Request) {
  if (isRateLimited(`admin-login:${getClientIp(request)}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' }, { status: 429 });
  }

  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) {
    return NextResponse.json({ error: 'Login admin belum disiapkan (ADMIN_PASSWORD / ADMIN_SESSION_SECRET).' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const given = typeof body?.password === 'string' ? body.password : '';
  if (!safeEqual(given, password)) {
    return NextResponse.json({ error: 'Password salah.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MS / 1000,
  });
  return response;
}
