import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminSession';
import { landingPages } from '@/app/data/landing-pages';
import { matchAdVariant } from '@/lib/adVariant';

// Ad-matched landing pages: a visitor from the "pabrik" ad gets the "pabrik"
// headline (copy.adVariants). Rewrite, not redirect: the address bar and the
// ad tags stay on /lp/[slug]. Anything else under /lp passes straight through.
function landingRewrite(request: NextRequest): NextResponse {
  const m = /^\/lp\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  const copy = m ? landingPages[m[1]] : undefined;
  const key = copy ? matchAdVariant(copy.adVariants, request.nextUrl.searchParams.get('utm_content')) : null;
  if (!m || !key) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/lp/${m[1]}/v/${key}`;
  return NextResponse.rewrite(url);
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
