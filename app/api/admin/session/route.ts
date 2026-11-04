import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminSession';

// Lets the client-side admin layout know whether the cookie is valid. Never
// cached: the answer depends on the visitor's cookie.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return NextResponse.json({ isAdmin: await isAdminRequest(request) }, { headers: { 'Cache-Control': 'no-store' } });
}
