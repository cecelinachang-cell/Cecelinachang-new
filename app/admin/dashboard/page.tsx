'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Package,
  Tags,
  Zap,
  PlusCircle,
  ExternalLink,
  BookOpen,
  Users,
  MousePointer2,
  Activity,
  RefreshCw,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import TrendChart from '@/components/admin/TrendChart';
import { percentChange, type SeriesPoint } from '@/lib/forecast';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

type Summary = {
  sessions: number;
  clicks: number;
  leads: number;
  prev_sessions: number;
  prev_clicks: number;
  prev_leads: number;
  active_now: number;
};

const EMPTY_SUMMARY: Summary = {
  sessions: 0,
  clicks: 0,
  leads: 0,
  prev_sessions: 0,
  prev_clicks: 0,
  prev_leads: 0,
  active_now: 0,
};

type TopPage = { path: string; views: number; sessions: number };

/**
 * The analytics rollups live in Postgres (see
 * supabase/migrations/20260719_analytics_rollups.sql and
 * 20260720_analytics_dashboard_bundle.sql, applied in that order). If they
 * haven't been applied yet the RPC 404s, so surface that instead of
 * rendering zeros.
 */
const MISSING_RPC_HINT =
  'Analytics functions not found. Apply supabase/migrations/20260719_analytics_rollups.sql then 20260720_analytics_dashboard_bundle.sql.';

function describeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('schema cache') || msg.includes('does not exist') || msg.includes('404')) {
    return MISSING_RPC_HINT;
  }
  if (msg.includes('Failed to fetch')) {
    return 'Could not reach the database. An ad blocker or network issue may be blocking Supabase.';
  }
  return msg;
}

export default function Dashboard() {
  const [days, setDays] = useState(30);

  const [content, setContent] = useState({ totalItems: 0, totalCategories: 0, totalCourses: 0 });
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [sessionSeries, setSessionSeries] = useState<SeriesPoint[]>([]);
  const [clickSeries, setClickSeries] = useState<SeriesPoint[]>([]);
  const [leadSeries, setLeadSeries] = useState<SeriesPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);

  /**
   * Leads / sessions per day, as a percent. This is the number that actually
   * says whether traffic is "performing" -- sessions and leads can both climb
   * while the site is converting worse, and the raw count charts alone don't
   * show that.
   */
  const conversionSeries = useMemo(() => {
    const leadsByDay = new Map(leadSeries.map((p) => [p.day, p.value]));
    return sessionSeries.map((p) => ({
      day: p.day,
      value: p.value > 0 ? ((leadsByDay.get(p.day) ?? 0) / p.value) * 100 : 0,
    }));
  }, [sessionSeries, leadSeries]);

  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchContentStats = useCallback(async () => {
    try {
      const [{ count: itemsCount, data: itemsData }, { count: coursesCount }] = await Promise.all([
        supabase.from('items').select('category', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
      ]);

      const categories = new Set<string>();
      itemsData?.forEach((row) => {
        if (row.category && row.category !== 'Semua Produk') categories.add(row.category);
      });

      setContent({
        totalItems: itemsCount || 0,
        totalCategories: categories.size,
        totalCourses: coursesCount || 0,
      });
    } catch (err) {
      console.error('Error fetching content stats:', describeError(err));
    }
  }, []);

  /**
   * Switching range fires a new set of RPCs before the old ones settle. Only
   * the newest request may write state, or a slow 90-day response can land on
   * top of a fresh 7-day one.
   */
  const reqIdRef = useRef(0);

  /**
   * One RPC instead of five (summary + 3 daily series + top pages). Same
   * underlying queries, bundled server-side into one jsonb payload -- see
   * supabase/migrations/20260720_analytics_dashboard_bundle.sql. Cuts
   * round-trips on every load and every range switch from 5 to 1.
   */
  const fetchAnalytics = useCallback(async (range: number) => {
    const reqId = ++reqIdRef.current;
    const isStale = () => reqId !== reqIdRef.current;

    setAnalyticsError(null);
    try {
      const { data, error } = await supabase.rpc('analytics_dashboard', { days: range, lim: 8 });
      if (isStale()) return;
      if (error) throw error;

      const summaryData = data?.summary;
      setSummary(summaryData ? { ...EMPTY_SUMMARY, ...summaryData } : EMPTY_SUMMARY);

      setSessionSeries(
        (data?.sessions ?? []).map((d: { day: string; sessions: number }) => ({
          day: d.day,
          value: Number(d.sessions),
        })),
      );
      setClickSeries(
        (data?.clicks ?? []).map((d: { day: string; clicks: number }) => ({
          day: d.day,
          value: Number(d.clicks),
        })),
      );
      setLeadSeries(
        (data?.leads ?? []).map((d: { day: string; leads: number }) => ({
          day: d.day,
          value: Number(d.leads),
        })),
      );
      setTopPages(
        (data?.top_pages ?? []).map((p: { path: string; views: number; sessions: number }) => ({
          path: p.path,
          views: Number(p.views),
          sessions: Number(p.sessions),
        })),
      );
      setLastUpdated(new Date());
    } catch (err) {
      if (isStale()) return;
      setAnalyticsError(describeError(err));
    }
  }, []);

  /** Polled independently of the range-scoped bundle above -- "Active Now" is a live figure, not a range figure. */
  const fetchActiveNow = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('analytics_active_now');
      if (error) throw error;
      setSummary((prev) => ({ ...prev, active_now: Number(data ?? 0) }));
    } catch (err) {
      console.error('Error fetching active now:', describeError(err));
    }
  }, []);

  const refresh = useCallback(
    async (range: number) => {
      setLoading(true);
      await Promise.all([fetchContentStats(), fetchAnalytics(range)]);
      setLoading(false);
    },
    [fetchContentStats, fetchAnalytics],
  );

  useEffect(() => {
    refresh(days);
  }, [days, refresh]);

  useEffect(() => {
    const id = setInterval(fetchActiveNow, 30_000);
    return () => clearInterval(id);
  }, [fetchActiveNow]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Dashboard Overview</h1>
          <p className="text-stone-500 mt-2">
            Traffic and conversion trends, with a 7-day projection.
            {lastUpdated && (
              <span className="text-stone-400">
                {' '}
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 rounded-full p-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  days === r.days
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refresh(days)}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:text-orange-600 hover:border-orange-200 transition-colors disabled:opacity-50"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {analyticsError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Analytics could not be loaded.</p>
            <p className="text-red-600/80 mt-0.5">{analyticsError}</p>
          </div>
        </div>
      )}

      {/* Headline analytics, each compared against the previous equal window. */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Active Now (5m)"
          value={summary.active_now}
          icon={<Activity className="w-6 h-6" />}
          tone="red"
          live={summary.active_now > 0}
        />
        <StatCard
          label={`Sessions (${days}d)`}
          value={summary.sessions}
          delta={percentChange(summary.sessions, summary.prev_sessions)}
          icon={<Users className="w-6 h-6" />}
          tone="blue"
          hint="Browser tab sessions, not unique people — the session id resets per tab."
        />
        <StatCard
          label={`Link Clicks (${days}d)`}
          value={summary.clicks}
          delta={percentChange(summary.clicks, summary.prev_clicks)}
          icon={<MousePointer2 className="w-6 h-6" />}
          tone="indigo"
        />
        <StatCard
          label={`Leads (${days}d)`}
          value={summary.leads}
          delta={percentChange(summary.leads, summary.prev_leads)}
          icon={<Inbox className="w-6 h-6" />}
          tone="green"
          hint="Course sign-ups plus chatbot follow-up requests."
        />
      </div>

      {/* Trends + projection */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TrendChart
          title="Sessions"
          subtitle={`${summary.sessions.toLocaleString()} sessions in the last ${days} days`}
          series={sessionSeries}
          color="#3b82f6"
          loading={loading}
          error={analyticsError}
        />
        <TrendChart
          title="Leads"
          subtitle={`${summary.leads.toLocaleString()} leads in the last ${days} days`}
          series={leadSeries}
          color="#16a34a"
          loading={loading}
          error={analyticsError}
        />
        <TrendChart
          title="Link Clicks"
          subtitle={`${summary.clicks.toLocaleString()} clicks in the last ${days} days`}
          series={clickSeries}
          color="#6366f1"
          loading={loading}
          error={analyticsError}
        />
        <TrendChart
          title="Conversion Rate"
          subtitle="Leads as a share of sessions, per day"
          series={conversionSeries}
          color="#d97706"
          unit="%"
          decimals={1}
          aggregate="avg"
          loading={loading}
          error={analyticsError}
        />

        {/* Top Pages */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h3 className="font-semibold text-stone-900">Top Visited Pages</h3>
            <p className="text-sm text-stone-500 mt-1">Last {days} days</p>
          </div>
          {topPages.length > 0 ? (
            <table className="w-full text-sm table-fixed">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-stone-500 w-1/2">Page Path</th>
                  <th className="px-6 py-3 text-right font-medium text-stone-500 w-1/4">Sessions</th>
                  <th className="px-6 py-3 text-right font-medium text-stone-500 w-1/4">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {topPages.map((page) => (
                  <tr key={page.path} className="hover:bg-stone-50 transition-colors">
                    <td
                      className="px-6 py-3 font-medium text-stone-900 truncate"
                      title={page.path || '/'}
                    >
                      {page.path || '/'}
                    </td>
                    <td className="px-6 py-3 text-right text-stone-900">{page.sessions}</td>
                    <td className="px-6 py-3 text-right text-stone-500">{page.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-stone-500 text-sm">No page views recorded yet.</div>
          )}
        </div>
      </div>

      {/* Content inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
        <ContentCard
          label="Total Items"
          value={content.totalItems}
          caption="Published products in store"
          icon={<Package className="w-5 h-5" />}
          tone="orange"
        />
        <ContentCard
          label="Product Categories"
          value={content.totalCategories}
          caption="Active categories"
          icon={<Tags className="w-5 h-5" />}
          tone="blue"
        />
        <ContentCard
          label="Total Courses"
          value={content.totalCourses}
          caption="Published online courses"
          icon={<BookOpen className="w-5 h-5" />}
          tone="purple"
        />

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-stone-500 font-medium">Quick Actions</h3>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Link
              href="/admin/leads"
              className="flex items-center text-sm font-medium text-stone-700 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg -mx-2"
            >
              <Inbox className="w-4 h-4 mr-2" /> View Leads
            </Link>
            <Link
              href="/admin/items"
              className="flex items-center text-sm font-medium text-stone-700 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg -mx-2"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Add New Product
            </Link>
            <Link
              href="/toko"
              target="_blank"
              className="flex items-center text-sm font-medium text-stone-700 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg -mx-2"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> View Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-purple-100 text-purple-600',
};

function StatCard({
  label,
  value,
  delta,
  icon,
  tone,
  live,
  hint,
}: {
  label: string;
  value: number;
  delta?: number | null;
  icon: React.ReactNode;
  tone: string;
  live?: boolean;
  hint?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${TONES[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-stone-500 font-medium text-sm truncate" title={hint}>
          {label}
        </h3>
        <div className="text-3xl font-bold text-stone-900 flex items-baseline gap-2">
          {value.toLocaleString()}
          {live && (
            <span className="text-xs text-green-500 font-medium animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 block" /> Live
            </span>
          )}
        </div>
        {delta !== undefined && (
          <p className="text-xs mt-1">
            {delta === null ? (
              <span className="text-stone-400">No prior period to compare</span>
            ) : (
              <span
                className={
                  delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-stone-400'
                }
              >
                {delta > 0 ? '+' : ''}
                {delta.toFixed(0)}% vs previous period
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function ContentCard({
  label,
  value,
  caption,
  icon,
  tone,
}: {
  label: string;
  value: number;
  caption: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-stone-500 font-medium">{label}</h3>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${TONES[tone]}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-stone-900">{value}</div>
      <div className="text-sm text-stone-500 mt-2">{caption}</div>
    </div>
  );
}
