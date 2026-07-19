-- Analytics rollups + admin read access for lead tables.
--
-- Why: the admin dashboard used to pull every page_views row into the browser
-- and aggregate in JS. These functions push that work into Postgres and return
-- daily time series, which is also what the trend/forecast charts need.
--
-- *** PREREQUISITES -- run in this order, or this migration fails ***
--   1. supabase_rls_policies.sql must already have run: it defines
--      public.is_admin(), which every function below calls. Without it this
--      file errors while compiling require_admin().
--   2. At least one row in public.users with role = 'admin' must exist (see
--      section 7 of that file). is_admin() is the only gate now, so with no
--      admin row seeded, every RPC here raises and the dashboard shows only an
--      error banner.
--
-- Day bucketing uses CURRENT_DATE and DATE->timestamptz coercion, both in the
-- database's timezone. On a UTC server serving a WIB (UTC+7) business, day
-- boundaries fall at 07:00 local, so late-evening events count toward the next
-- day. Consistent across every function here and immaterial to trend shape; add
-- AT TIME ZONE 'Asia/Jakarta' if exact local-day totals ever matter.

-- ---------------------------------------------------------------------------
-- 1. Indexes. Every rollup below filters on created_at.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_session_id_idx ON public.page_views (session_id);
CREATE INDEX IF NOT EXISTS clicks_created_at_idx ON public.clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS customer_inquiries_created_at_idx ON public.customer_inquiries (created_at DESC);

-- ---------------------------------------------------------------------------
-- 1b. Admin guard.
--
-- The rollups below are SECURITY DEFINER, so they read straight past RLS on
-- page_views/clicks/leads. Sign-in is Google OAuth and anyone can complete it,
-- which means every visitor who logs in holds the `authenticated` role -- a
-- GRANT to that role alone would expose traffic and lead counts to any signed-in
-- user, not just admins. Each function therefore re-checks is_admin() itself and
-- raises insufficient_privilege rather than quietly returning an empty set.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.require_admin()
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin privileges required'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.require_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.require_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Daily series.
--
-- Each returns one row per day for the last `days` days, gap-filled with 0 so
-- the chart has a continuous x-axis and the forecast sees real zeros instead
-- of missing points.
--
-- Sessions counts DISTINCT session_id, not rows: AnalyticsTracker re-inserts a
-- page_view every 60s as a dwell-time heartbeat, so raw row counts measure
-- time-on-site rather than traffic.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.analytics_daily_sessions(days INT DEFAULT 30)
RETURNS TABLE (day DATE, sessions BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN QUERY
  WITH calendar AS (
    SELECT generate_series(
      (CURRENT_DATE - (GREATEST(days, 1) - 1) * INTERVAL '1 day')::date,
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS day
  )
  SELECT
    c.day,
    COUNT(DISTINCT pv.session_id)::bigint AS sessions
  FROM calendar c
  LEFT JOIN public.page_views pv
    ON pv.created_at >= c.day
   AND pv.created_at < c.day + INTERVAL '1 day'
  GROUP BY c.day
  ORDER BY c.day;
END;
$$;

CREATE OR REPLACE FUNCTION public.analytics_daily_clicks(days INT DEFAULT 30)
RETURNS TABLE (day DATE, clicks BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN QUERY
  WITH calendar AS (
    SELECT generate_series(
      (CURRENT_DATE - (GREATEST(days, 1) - 1) * INTERVAL '1 day')::date,
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS day
  )
  SELECT
    c.day,
    COUNT(cl.id)::bigint AS clicks
  FROM calendar c
  LEFT JOIN public.clicks cl
    ON cl.created_at >= c.day
   AND cl.created_at < c.day + INTERVAL '1 day'
  GROUP BY c.day
  ORDER BY c.day;
END;
$$;

-- Leads = course sign-up forms (public.leads) + chatbot follow-up requests
-- (public.customer_inquiries). Both are conversion events; the dashboard
-- treats them as one series.
CREATE OR REPLACE FUNCTION public.analytics_daily_leads(days INT DEFAULT 30)
RETURNS TABLE (day DATE, leads BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN QUERY
  WITH calendar AS (
    SELECT generate_series(
      (CURRENT_DATE - (GREATEST(days, 1) - 1) * INTERVAL '1 day')::date,
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS day
  ),
  events AS (
    SELECT created_at FROM public.leads
    UNION ALL
    SELECT created_at FROM public.customer_inquiries
  )
  SELECT
    c.day,
    COUNT(e.created_at)::bigint AS leads
  FROM calendar c
  LEFT JOIN events e
    ON e.created_at >= c.day
   AND e.created_at < c.day + INTERVAL '1 day'
  GROUP BY c.day
  ORDER BY c.day;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Top pages. Views is raw row count (dwell-weighted), sessions is the
-- distinct-visitor count -- showing both makes the heartbeat inflation legible
-- instead of misleading.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_top_pages(days INT DEFAULT 30, lim INT DEFAULT 5)
RETURNS TABLE (path TEXT, views BIGINT, sessions BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN QUERY
  SELECT
    pv.path,
    COUNT(*)::bigint AS views,
    COUNT(DISTINCT pv.session_id)::bigint AS sessions
  FROM public.page_views pv
  WHERE pv.created_at >= CURRENT_DATE - (GREATEST(days, 1) - 1) * INTERVAL '1 day'
    AND pv.path IS NOT NULL
  GROUP BY pv.path
  ORDER BY 2 DESC
  LIMIT GREATEST(lim, 1);
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Summary: current window vs the immediately preceding equal window, so the
-- dashboard can show a % delta on each stat card.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_summary(days INT DEFAULT 30)
RETURNS TABLE (
  sessions BIGINT,
  clicks BIGINT,
  leads BIGINT,
  prev_sessions BIGINT,
  prev_clicks BIGINT,
  prev_leads BIGINT,
  active_now BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN QUERY
  WITH bounds AS (
    SELECT
      (CURRENT_DATE - (GREATEST(days, 1) - 1) * INTERVAL '1 day') AS cur_start,
      (CURRENT_DATE - (2 * GREATEST(days, 1) - 1) * INTERVAL '1 day') AS prev_start
  ),
  lead_events AS (
    SELECT created_at FROM public.leads
    UNION ALL
    SELECT created_at FROM public.customer_inquiries
  )
  SELECT
    (SELECT COUNT(DISTINCT session_id) FROM public.page_views, bounds
       WHERE created_at >= bounds.cur_start)::bigint,
    (SELECT COUNT(*) FROM public.clicks, bounds
       WHERE created_at >= bounds.cur_start)::bigint,
    (SELECT COUNT(*) FROM lead_events, bounds
       WHERE created_at >= bounds.cur_start)::bigint,
    (SELECT COUNT(DISTINCT session_id) FROM public.page_views, bounds
       WHERE created_at >= bounds.prev_start AND created_at < bounds.cur_start)::bigint,
    (SELECT COUNT(*) FROM public.clicks, bounds
       WHERE created_at >= bounds.prev_start AND created_at < bounds.cur_start)::bigint,
    (SELECT COUNT(*) FROM lead_events, bounds
       WHERE created_at >= bounds.prev_start AND created_at < bounds.cur_start)::bigint,
    (SELECT COUNT(DISTINCT session_id) FROM public.page_views
       WHERE created_at >= NOW() - INTERVAL '5 minutes')::bigint;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. Access. These functions are SECURITY DEFINER, so they bypass RLS on the
-- underlying tables -- they must therefore check is_admin() themselves via a
-- REVOKE from anon and an explicit grant to authenticated only. Admin-gating
-- happens at the RLS layer for raw tables (below) and here by role.
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.analytics_daily_sessions(INT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.analytics_daily_clicks(INT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.analytics_daily_leads(INT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.analytics_top_pages(INT, INT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.analytics_summary(INT) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.analytics_daily_sessions(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_daily_clicks(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_daily_leads(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_top_pages(INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_summary(INT) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. RLS for the lead tables.
--
-- public.leads had RLS on with an anon-INSERT policy only, so an admin SELECT
-- returned zero rows. public.customer_inquiries had RLS disabled entirely,
-- meaning anon could read every submitted name/email/WhatsApp number.
-- ---------------------------------------------------------------------------
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin can read leads" ON public.leads;
CREATE POLICY "admin can read leads" ON public.leads
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin can delete leads" ON public.leads;
CREATE POLICY "admin can delete leads" ON public.leads
  FOR DELETE USING (public.is_admin());

ALTER TABLE public.customer_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon can insert customer_inquiries" ON public.customer_inquiries;
CREATE POLICY "anon can insert customer_inquiries" ON public.customer_inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "admin can read customer_inquiries" ON public.customer_inquiries;
CREATE POLICY "admin can read customer_inquiries" ON public.customer_inquiries
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin can update customer_inquiries" ON public.customer_inquiries;
CREATE POLICY "admin can update customer_inquiries" ON public.customer_inquiries
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin can delete customer_inquiries" ON public.customer_inquiries;
CREATE POLICY "admin can delete customer_inquiries" ON public.customer_inquiries
  FOR DELETE USING (public.is_admin());
