import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { isAdminRequest } from '@/lib/adminSession';
import { AdminQueryError, compileAdminQuery, type QuerySpec } from '@/lib/adminQuery';
import { TAGS, getSql, isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public pages cache these tables (lib/db.ts); a save must show up right away.
const TAG_FOR_TABLE: Record<string, string> = {
  courses: TAGS.courses,
  items: TAGS.items,
  settings: TAGS.settings,
  testimonials: TAGS.testimonials,
};

/**
 * Admin data endpoint behind lib/adminDb.ts. Returns supabase-style
 * `{ data, error, count }` so the admin pages keep their error handling.
 */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ data: null, error: { message: 'DATABASE_URL is not set' } }, { status: 503 });
  }

  const spec = (await request.json().catch(() => null)) as QuerySpec | null;
  if (!spec || typeof spec !== 'object') {
    return NextResponse.json({ data: null, error: { message: 'Bad request' } }, { status: 400 });
  }

  try {
    const compiled = compileAdminQuery(spec);
    const sql = getSql();
    const rows = (await sql.query(compiled.text, compiled.params)) as Record<string, unknown>[];
    let count: number | null = null;
    if (compiled.countText) {
      const [countRow] = (await sql.query(compiled.countText, compiled.countParams)) as { count: number }[];
      count = countRow?.count ?? 0;
    }

    if (spec.kind !== 'select' && spec.kind !== 'rpc' && TAG_FOR_TABLE[spec.table]) {
      revalidateTag(TAG_FOR_TABLE[spec.table]);
    }

    let data: unknown = rows;
    if (spec.kind === 'rpc') data = rows[0]?.result ?? null;
    if (spec.kind === 'select' && spec.head) data = null;
    return NextResponse.json({ data, error: null, count });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = err instanceof AdminQueryError ? 400 : 500;
    if (status === 500) console.error('Admin query failed:', message);
    return NextResponse.json({ data: null, error: { message } }, { status });
  }
}
