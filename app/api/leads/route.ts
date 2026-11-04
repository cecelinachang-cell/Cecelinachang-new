import { NextRequest, NextResponse } from 'next/server';
import { getSql, isDbConfigured } from '@/lib/db';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';
import { resend, isResendConfigured, FROM_ADDRESS, REPLY_TO_ADDRESS } from '@/lib/resend';
import { buildWelcomeEmail } from '@/lib/emails/lead-emails';
import { sanitizeAgeRange, sanitizeName, sanitizeQuizAnswers, sanitizeSource } from '@/lib/leadFields';

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

  if (!isDbConfigured()) {
    // Not ok: the client keeps the lead queued until the database is back.
    return NextResponse.json({ ok: false }, { status: 503 });
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
  // Landing-page extras (app/lp). Plain course sign-ups leave them null.
  const quizAnswers = sanitizeQuizAnswers(body.quizAnswers);
  const source = sanitizeSource(body.source);
  const ageRange = sanitizeAgeRange(body.ageRange);
  const name = sanitizeName(body.name);
  const extras = {
    ...(name ? { name } : {}),
    ...(quizAnswers ? { quiz_answers: quizAnswers } : {}),
    ...(source ? { source } : {}),
    ...(ageRange ? { age_range: ageRange } : {}),
  };

  let id: string | null = null;
  try {
    const sql = getSql();
    const [row] = await sql`
      insert into leads (course_slug, course_title, email, phone, city, tiktok_handle, name, quiz_answers, source, age_range)
      values (
        ${baseRow.course_slug}, ${baseRow.course_title}, ${baseRow.email}, ${baseRow.phone}, ${baseRow.city},
        ${baseRow.tiktok_handle}, ${extras.name ?? null},
        ${extras.quiz_answers ? JSON.stringify(extras.quiz_answers) : null}::jsonb,
        ${extras.source ?? null}, ${extras.age_range ?? null}
      )
      returning id`;
    id = (row?.id as string) ?? null;
  } catch (err) {
    console.error('Error inserting lead:', err instanceof Error ? err.message : err);
    // Non-2xx so the client keeps the lead in its retry queue.
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Best-effort: a failed welcome email never fails the lead capture itself.
  // Awaited (not fire-and-forget) so the send completes before the
  // serverless function is torn down after the response is sent.
  if (id && email && isResendConfigured()) {
    try {
      const { subject, html } = buildWelcomeEmail(courseTitle);
      const { error: sendError } = await resend.emails.send(
        { from: FROM_ADDRESS, replyTo: REPLY_TO_ADDRESS, to: [email], subject, html },
        { idempotencyKey: `lead-welcome/${id}` },
      );
      if (sendError) {
        console.error('Error sending welcome email:', sendError.message);
      } else {
        await getSql()`update leads set welcome_email_sent_at = now() where id = ${id}`;
      }
    } catch (err) {
      console.error('Unexpected welcome email error:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
