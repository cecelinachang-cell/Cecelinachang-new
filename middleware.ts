import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminSession';
import { landingPages } from '@/app/data/landing-pages';
import { matchAdVariant } from '@/lib/adVariant';
import { LP_SPLIT_COOKIE, LP_SPLIT_MAX_AGE, armPath, chooseArm, isSplitActive } from '@/lib/lpSplit';

// Landing pages. Two things pick the page a visitor sees, both by rewrite so
// the address bar and the ad tags stay on /lp/[slug]:
// 1. Ad-matched headline: a visitor from the "pabrik" ad gets the "pabrik"
//    headline (copy.adVariants, matched on utm_content = the ad name).
// 2. The first-screen split test (lib/lpSplit.ts): arm A or B, kept in a
//    cookie so a returning visitor sees the same version.
// Anything else under /lp passes straight through.
function landingRewrite(request: NextRequest): NextResponse {
  const m = /^\/lp\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  const slug = m?.[1];
  const copy = slug ? landingPages[slug] : undefined;
  if (!slug || !copy) return NextResponse.next();

  const key = matchAdVariant(copy.adVariants, request.nextUrl.searchParams.get('utm_content'));
  const split = isSplitActive(slug)
    ? chooseArm(request.nextUrl.searchParams.get('lp'), request.cookies.get(LP_SPLIT_COOKIE)?.value)
    : null;

  const target = armPath(slug, split?.arm ?? 'a', key);
  let response: NextResponse;
  if (target === request.nextUrl.pathname.replace(/\/$/, '')) {
    response = NextResponse.next();
  } else {
    const url = request.nextUrl.clone();
    url.pathname = target;
    response = NextResponse.rewrite(url);
  }
  if (split?.fresh) {
    response.cookies.set(LP_SPLIT_COOKIE, split.arm, { maxAge: LP_SPLIT_MAX_AGE, path: '/', sameSite: 'lax' });
  }
  return response;
}

// Server-side gate for the admin area. The /admin layout only redirects in
// client-side JS, which protects nothing against a direct request, so every
// admin page and admin API call is checked here against the signed session
// cookie (lib/adminSession.ts). The admin API routes check it again
// themselves, so a matcher change can't silently open them.
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/api/admin/login', '/api/admin/session']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Landing pages are public; never fall through to the admin gate below.
  if (pathname.startsWith('/lp/')) {
    return landingRewrite(request);
  }

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Vercel Blob calls this route back after an upload, without the cookie; the
  // route verifies Blob's own signature instead (see app/api/admin/upload).
  if (pathname === '/api/admin/upload' && request.headers.has('x-vercel-signature')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/lp/:path*'],
};
