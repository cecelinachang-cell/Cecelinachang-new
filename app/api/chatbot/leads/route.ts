import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const clean = (value: unknown, maxLength: number) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Penyimpanan pesan belum dikonfigurasi.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const name = clean(body.name, 120);
    const whatsapp = clean(body.whatsapp, 40);
    const email = clean(body.email, 160);
    const topic = clean(body.topic, 160);
    const message = clean(body.message, 2000);
    const pagePath = clean(body.pagePath, 200);
    const chatSummary = clean(body.chatSummary, 5000);

    if (!message) {
      return NextResponse.json({ error: 'Tulis pesan Anda terlebih dahulu.' }, { status: 400 });
    }
    if (!whatsapp && !email) {
      return NextResponse.json({ error: 'Masukkan nomor WhatsApp atau email agar kami dapat menghubungi Anda.' }, { status: 400 });
    }

    const { error } = await supabase.from('customer_inquiries').insert({
      name: name || null,
      whatsapp: whatsapp || null,
      email: email || null,
      topic: topic || null,
      message,
      page_path: pagePath || null,
      chat_summary: chatSummary || null,
    });

    if (error) {
      console.error('Unable to save chatbot inquiry:', error);
      return NextResponse.json({ error: 'Pesan belum dapat disimpan. Silakan gunakan WhatsApp admin.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Chatbot lead error:', error);
    return NextResponse.json({ error: 'Pesan belum dapat disimpan. Silakan gunakan WhatsApp admin.' }, { status: 500 });
  }
}
