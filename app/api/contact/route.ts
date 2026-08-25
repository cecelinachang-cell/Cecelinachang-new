import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (isRateLimited(`contact:${getClientIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = await req.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // honeypot: bots fill hidden fields, humans never see them
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name || '').slice(0, 200);
  const whatsapp = String(body.whatsapp || '').slice(0, 50);
  const message = String(body.message || '').slice(0, 2000);

  if (!name || !whatsapp || !message) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from('customer_inquiries').insert({
    name,
    whatsapp,
    message,
    topic: 'Formulir Kontak',
  });

  if (error) {
    console.error('Error inserting contact message:', error.message);
  }

  return NextResponse.json({ ok: true });
}
