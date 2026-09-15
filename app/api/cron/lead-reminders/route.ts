import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { resend, isResendConfigured, FROM_ADDRESS, REPLY_TO_ADDRESS } from '@/lib/resend';
import { buildReminderEmail } from '@/lib/emails/lead-emails';

export const maxDuration = 60;

// Runs once a day (see vercel.json). Catches every welcomed lead that's
// 44-96h old and hasn't been reminded yet — the wide window means a lead
// created shortly before the previous run still gets caught by this one.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin || !isResendConfigured()) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 'not configured' });
  }

  const now = Date.now();
  const windowStart = new Date(now - 96 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now - 44 * 60 * 60 * 1000).toISOString();

  const { data: leads, error } = await admin
    .from('leads')
    .select('id, email, course_title, created_at')
    .not('email', 'is', null)
    .not('welcome_email_sent_at', 'is', null)
    .is('reminder_email_sent_at', null)
    .gte('created_at', windowStart)
    .lte('created_at', windowEnd);

  if (error) {
    console.error('lead-reminders: query failed', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  let sent = 0;
  for (const lead of leads ?? []) {
    if (!lead.email) continue;
    const { subject, html } = buildReminderEmail(lead.course_title);
    const { error: sendError } = await resend.emails.send(
      { from: FROM_ADDRESS, replyTo: REPLY_TO_ADDRESS, to: [lead.email], subject, html },
      { idempotencyKey: `lead-reminder/${lead.id}` },
    );
    if (sendError) {
      console.error(`lead-reminders: send failed for ${lead.id}`, sendError.message);
      continue;
    }
    await admin
      .from('leads')
      .update({ reminder_email_sent_at: new Date().toISOString() })
      .eq('id', lead.id);
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent, checked: leads?.length ?? 0 });
}
