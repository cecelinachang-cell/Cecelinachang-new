import { NextResponse } from 'next/server';
import { getAllCourses } from '@/lib/courses';
import { getSiteAssets } from '@/lib/settings';
import { totalStudents } from '@/lib/course-stats';

// Data for the client-rendered /tentang page. Both reads are cached server-side
// (lib/db.ts), so this doesn't wake the database on each visit.
export async function GET() {
  const [assets, courses] = await Promise.all([getSiteAssets(['about_image']), getAllCourses()]);
  return NextResponse.json({
    aboutImage: assets.about_image ?? null,
    students: totalStudents(courses),
  });
}
