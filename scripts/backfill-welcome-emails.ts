// One-off backfill: sends the welcome email to every existing lead that
// predates the automatic send wired into app/api/leads/route.ts, then marks
// them so app/api/cron/lead-reminders never re-contacts them as "new".
// Run once: npx tsx scripts/backfill-welcome-emails.ts
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildWelcomeEmail } from '../lib/emails/lead-emails';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = 'Cece Lina Chang <hello@cecelinachang.com>';
const REPLY_TO_ADDRESS = 'halo@cecelinachang.com';

async function main() {
  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: leads, error } = await admin
    .from('leads')
    .select('id, email, course_title')
    .is('welcome_email_sent_at', null)
    .not('email', 'is', null)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!leads?.length) {
    console.log('Nothing to backfill.');
    return;
  }

  const seenEmails = new Set<string>();
  let sent = 0;
  let skipped = 0;

  for (const lead of leads) {
    const email = lead.email!.trim().toLowerCase();
    const alreadySentToThisEmail = seenEmails.has(email);
    seenEmails.add(email);

    if (!alreadySentToThisEmail) {
      const { subject, html } = buildWelcomeEmail(lead.course_title);
      const { error: sendError } = await resend.emails.send(
        { from: FROM_ADDRESS, replyTo: REPLY_TO_ADDRESS, to: [lead.email!], subject, html },
        { idempotencyKey: `lead-welcome-backfill/${lead.id}` },
      );
      if (sendError) {
        console.error(`FAILED ${lead.email}: ${sendError.message}`);
        continue;
      }
      sent += 1;
      console.log(`SENT ${lead.email}`);
      // Resend's default rate limit is 2 req/s.
      await new Promise((r) => setTimeout(r, 600));
    } else {
      skipped += 1;
    }

    await admin
      .from('leads')
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq('id', lead.id);
  }

  console.log(`Done. Sent: ${sent}, skipped (duplicate email): ${skipped}, total rows marked: ${leads.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
