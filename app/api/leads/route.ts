import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';
import { resend, isResendConfigured, FROM_ADDRESS, REPLY_TO_ADDRESS } from '@/lib/resend';
import { buildWelcomeEmail } from '@/lib/emails/lead-emails';
import { isMissingColumnError, sanitizeAgeRange, sanitizeQuizAnswers, sanitizeSource } from '@/lib/leadFields';

export async function POST(req: NextRequest) {
  // 20/min: Indonesian mobile carriers put many users behind one IP (CGNAT),
  // and a video going viral sends them all here at once.
  if (isRateLimited(`leads:${getClientIp(req)}`, 20, 60_000)) {
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

  const courseSlug = String(body.courseSlug || '').slice(0, 200);
  const courseTitle = String(body.courseTitle || '').slice(0, 300);

  if (!courseSlug || !courseTitle) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email || '').slice(0, 300) || null;

  const baseRow = {
    course_slug: courseSlug,
    course_title: courseTitle,
    email,
    phone: String(body.phone || '').slice(0, 50) || null,
    city: String(body.city || '').slice(0, 100) || null,
    tiktok_handle: String(body.tiktokHandle || '').slice(0, 100) || null,
  };
  // Landing-page extras (app/lp). Only sent when present, so plain course
  // sign-ups insert exactly the columns they always did.
  const quizAnswers = sanitizeQuizAnswers(body.quizAnswers);
  const source = sanitizeSource(body.source);
  const ageRange = sanitizeAgeRange(body.ageRange);
  const extras = {
    ...(quizAnswers ? { quiz_answers: quizAnswers } : {}),
    ...(source ? { source } : {}),
    ...(ageRange ? { age_range: ageRange } : {}),
  };

  let { data, error } = await supabase
    .from('leads')
    .insert({ ...baseRow, ...extras })
    .select('id')
    .single();

  // The quiz_answers/source/age_range migration may not be applied yet. Never
  // lose the lead over it: retry with only the original columns.
  if (error && Object.keys(extras).length > 0 && isMissingColumnError(error)) {
    console.warn(`Lead extras skipped (${error.code}); apply supabase/migrations/20260922_lead_quiz_answers.sql`);
    ({ data, error } = await supabase.from('leads').insert(baseRow).select('id').single());
  }

  if (error) {
    console.error('Error inserting lead:', error.message);
    // Non-2xx so the client keeps the lead in its retry queue.
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Best-effort: a failed welcome email never fails the lead capture itself.
  // Awaited (not fire-and-forget) so the send completes before the
  // serverless function is torn down after the response is sent.
  if (data?.id && email && isResendConfigured()) {
    try {
      const { subject, html } = buildWelcomeEmail(courseTitle);
      const { error: sendError } = await resend.emails.send(
        { from: FROM_ADDRESS, replyTo: REPLY_TO_ADDRESS, to: [email], subject, html },
        { idempotencyKey: `lead-welcome/${data.id}` },
      );
      if (sendError) {
        console.error('Error sending welcome email:', sendError.message);
      } else {
        await supabase
          .from('leads')
          .update({ welcome_email_sent_at: new Date().toISOString() })
          .eq('id', data.id);
      }
    } catch (err) {
      console.error('Unexpected welcome email error:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
