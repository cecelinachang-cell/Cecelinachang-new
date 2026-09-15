import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';
import { resend, isResendConfigured, FROM_ADDRESS, REPLY_TO_ADDRESS } from '@/lib/resend';
import { buildWelcomeEmail } from '@/lib/emails/lead-emails';

const clean = (value: unknown, maxLength: number) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export async function POST(request: Request) {
  if (isRateLimited(`chatbot-leads:${getClientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Silakan coba lagi sebentar lagi.' }, { status: 429 });
  }

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

    const { data, error } = await supabase
      .from('customer_inquiries')
      .insert({
        name: name || null,
        whatsapp: whatsapp || null,
        email: email || null,
        topic: topic || null,
        message,
        page_path: pagePath || null,
        chat_summary: chatSummary || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Unable to save chatbot inquiry:', error);
      return NextResponse.json({ error: 'Pesan belum dapat disimpan. Silakan gunakan WhatsApp admin.' }, { status: 500 });
    }

    // Best-effort: a failed welcome email never fails the inquiry capture
    // itself. Awaited so the send completes before the serverless function
    // is torn down after the response is sent (same reasoning as
    // app/api/leads/route.ts).
    if (data?.id && email && isResendConfigured()) {
      try {
        const { subject, html } = buildWelcomeEmail();
        const { error: sendError } = await resend.emails.send(
          { from: FROM_ADDRESS, replyTo: REPLY_TO_ADDRESS, to: [email], subject, html },
          { idempotencyKey: `inquiry-welcome/${data.id}` },
        );
        if (sendError) {
          console.error('Error sending chatbot welcome email:', sendError.message);
        }
      } catch (err) {
        console.error('Unexpected chatbot welcome email error:', err);
      }
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (error) {
    console.error('Chatbot lead error:', error);
    return NextResponse.json({ error: 'Pesan belum dapat disimpan. Silakan gunakan WhatsApp admin.' }, { status: 500 });
  }
}
