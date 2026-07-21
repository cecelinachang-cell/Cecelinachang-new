-- Bundle the 5 dashboard RPCs (summary, 3 daily series, top pages) into one
-- call.
--
-- Why: app/admin/dashboard/page.tsx fired analytics_summary,
-- analytics_daily_sessions, analytics_daily_clicks, analytics_daily_leads and
-- analytics_top_pages as 5 separate round-trips on every load and every range
-- switch. Same underlying queries, wrapped in one SECURITY DEFINER function
-- returning a single jsonb payload. The five original functions stay in
-- place (analytics_daily_leads is still referenced by nothing else, but
-- dropping working, granted functions on a hunch is more risk than the reuse
-- is worth) -- this migration only adds the bundle on top.
--
-- *** PREREQUISITE: 20260719_analytics_rollups.sql must already be applied ***
-- (defines public.require_admin(), the indexes, and the tables this reads).

CREATE OR REPLACE FUNCTION public.analytics_dashboard(days INT DEFAULT 30, lim INT DEFAULT 8)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public.require_admin();

  WITH calendar AS (
    SELECT generate_series(
      (CURRENT_DATE - (GREATEST(days, 1) - 1) * INTERVAL '1 day')::date,
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS day
  ),
  lead_events AS (
    SELECT created_at FROM public.leads
    UNION ALL
    SELECT created_at FROM public.customer_inquiries
  ),
  bounds AS (
    SELECT
      (CURRENT_DATE - (GREATEST(days, 1) - 1) * INTERVAL '1 day') AS cur_start,
      (CURRENT_DATE - (2 * GREATEST(days, 1) - 1) * INTERVAL '1 day') AS prev_start
  ),
  sessions_daily AS (
    SELECT c.day, COUNT(DISTINCT pv.session_id)::bigint AS sessions
    FROM calendar c
    LEFT JOIN public.page_views pv
      ON pv.created_at >= c.day AND pv.created_at < c.day + INTERVAL '1 day'
    GROUP BY c.day
    ORDER BY c.day
  ),
  clicks_daily AS (
    SELECT c.day, COUNT(cl.id)::bigint AS clicks
    FROM calendar c
    LEFT JOIN public.clicks cl
      ON cl.created_at >= c.day AND cl.created_at < c.day + INTERVAL '1 day'
    GROUP BY c.day
    ORDER BY c.day
  ),
  leads_daily AS (
    SELECT c.day, COUNT(e.created_at)::bigint AS leads
    FROM calendar c
    LEFT JOIN lead_events e
      ON e.created_at >= c.day AND e.created_at < c.day + INTERVAL '1 day'
    GROUP BY c.day
    ORDER BY c.day
  ),
  top_pages AS (
    SELECT pv.path, COUNT(*)::bigint AS views, COUNT(DISTINCT pv.session_id)::bigint AS sessions
    FROM public.page_views pv, bounds
    WHERE pv.created_at >= bounds.cur_start
      AND pv.path IS NOT NULL
    GROUP BY pv.path
    ORDER BY 2 DESC
    LIMIT GREATEST(lim, 1)
  ),
  summary AS (
    SELECT
      (SELECT COUNT(DISTINCT session_id) FROM public.page_views, bounds
         WHERE created_at >= bounds.cur_start)::bigint AS sessions,
      (SELECT COUNT(*) FROM public.clicks, bounds
         WHERE created_at >= bounds.cur_start)::bigint AS clicks,
      (SELECT COUNT(*) FROM lead_events, bounds
         WHERE created_at >= bounds.cur_start)::bigint AS leads,
      (SELECT COUNT(DISTINCT session_id) FROM public.page_views, bounds
         WHERE created_at >= bounds.prev_start AND created_at < bounds.cur_start)::bigint AS prev_sessions,
      (SELECT COUNT(*) FROM public.clicks, bounds
         WHERE created_at >= bounds.prev_start AND created_at < bounds.cur_start)::bigint AS prev_clicks,
      (SELECT COUNT(*) FROM lead_events, bounds
         WHERE created_at >= bounds.prev_start AND created_at < bounds.cur_start)::bigint AS prev_leads,
      (SELECT COUNT(DISTINCT session_id) FROM public.page_views
         WHERE created_at >= NOW() - INTERVAL '5 minutes')::bigint AS active_now
  )
  SELECT jsonb_build_object(
    'summary', (SELECT to_jsonb(summary) FROM summary),
    'sessions', (SELECT COALESCE(jsonb_agg(row_to_json(sessions_daily)), '[]'::jsonb) FROM sessions_daily),
    'clicks', (SELECT COALESCE(jsonb_agg(row_to_json(clicks_daily)), '[]'::jsonb) FROM clicks_daily),
    'leads', (SELECT COALESCE(jsonb_agg(row_to_json(leads_daily)), '[]'::jsonb) FROM leads_daily),
    'top_pages', (SELECT COALESCE(jsonb_agg(row_to_json(top_pages)), '[]'::jsonb) FROM top_pages)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_dashboard(INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.analytics_dashboard(INT, INT) TO authenticated;

-- Active Now needs to move independently of the range-scoped bundle above
-- (polled every 30s regardless of the selected date range), so it's split
-- out into its own light function.
CREATE OR REPLACE FUNCTION public.analytics_active_now()
RETURNS BIGINT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN (
    SELECT COUNT(DISTINCT session_id) FROM public.page_views
    WHERE created_at >= NOW() - INTERVAL '5 minutes'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_active_now() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.analytics_active_now() TO authenticated;
