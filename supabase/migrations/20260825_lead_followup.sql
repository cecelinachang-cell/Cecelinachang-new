alter table public.leads
  add column if not exists welcome_email_sent_at timestamptz,
  add column if not exists reminder_email_sent_at timestamptz;

-- Cron route reads leads via the service role key, bypassing RLS.
-- No new policy needed: anon still only gets the existing insert-only policy.
