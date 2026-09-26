-- Landing-page leads now ask for a name, so Cece knows who she is replying to.
-- /api/leads retries without the landing-page extras until this is applied,
-- so leads are never lost in the meantime.
alter table public.leads
  add column if not exists name text;

-- components/AnalyticsTracker.tsx has been writing duration_seconds on every
-- heartbeat, but the column never existed in production, so each update 400'd
-- and time-on-page was unknown. analytics_schema.sql already declares it.
alter table public.page_views
  add column if not exists duration_seconds integer;
