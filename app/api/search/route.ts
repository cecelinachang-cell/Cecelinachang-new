import { NextResponse } from 'next/server';
import { getCatalogData, searchCatalog } from '@/lib/search';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (isRateLimited(`search:${getClientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Terlalu banyak pencarian. Coba lagi sebentar lagi ya.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').slice(0, 200);

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const catalog = await getCatalogData();
  const results = searchCatalog(query, catalog).slice(0, 20);

  return NextResponse.json({ results });
}
