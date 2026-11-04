import { NextResponse } from 'next/server';
import { getTestimonials } from '@/lib/testimonials';

// Cached server-side (lib/testimonials.ts), so a visit doesn't wake the database.
export async function GET() {
  return NextResponse.json({ testimonials: await getTestimonials() });
}
