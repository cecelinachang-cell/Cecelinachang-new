-- Landing-page leads (app/lp/[slug]) carry the visitor's quiz answers and the
-- UTM source of the video that sent them, plus an optional age range. /api/leads retries without these
-- columns until this is applied, so leads are never lost in the meantime.
alter table public.leads
  add column if not exists quiz_answers jsonb,
  add column if not exists source text,
  add column if not exists age_range text;

-- No new policy needed: anon keeps the existing insert-only policy, and the
-- admin SELECT policy already covers every column.
