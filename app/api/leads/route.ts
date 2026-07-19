import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // honeypot: bots fill hidden fields, humans never see them
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const courseSlug = String(body.courseSlug || '').slice(0, 200);
  const courseTitle = String(body.courseTitle || '').slice(0, 300);

  if (!courseSlug || !courseTitle) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from('leads').insert({
    course_slug: courseSlug,
    course_title: courseTitle,
    email: String(body.email || '').slice(0, 300) || null,
    phone: String(body.phone || '').slice(0, 50) || null,
    city: String(body.city || '').slice(0, 100) || null,
    tiktok_handle: String(body.tiktokHandle || '').slice(0, 100) || null,
  });

  if (error) {
    console.error('Error inserting lead:', error.message);
  }

  return NextResponse.json({ ok: true });
}
