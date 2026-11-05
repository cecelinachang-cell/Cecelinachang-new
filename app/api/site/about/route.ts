import { NextResponse } from 'next/server';
import { getSiteAssets } from '@/lib/settings';
import { STUDENTS_TOTAL } from '@/lib/course-stats';

// Data for the client-rendered /tentang page. Both reads are cached server-side
// (lib/db.ts), so this doesn't wake the database on each visit.
export async function GET() {
  const assets = await getSiteAssets(['about_image']);
  return NextResponse.json({
    aboutImage: assets.about_image ?? null,
    students: STUDENTS_TOTAL,
  });
}
