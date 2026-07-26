'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Inbox, RefreshCw, MessageSquare, GraduationCap, AlertCircle } from 'lucide-react';

/**
 * Two tables feed this page:
 *  - public.leads             course sign-up forms (app/api/leads/route.ts)
 *  - public.customer_inquiries chatbot follow-up requests (app/api/chatbot/leads/route.ts)
 *
 * Both need the admin SELECT policies from
 * supabase/migrations/20260719_analytics_rollups.sql, or this page renders empty.
 */

type CourseLead = {
  id: string;
  created_at: string;
  course_slug: string;
  course_title: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  tiktok_handle: string | null;
};

type Inquiry = {
  id: string;
  created_at: string;
  name: string | null;
  whatsapp: string | null;
  email: string | null;
  topic: string | null;
  message: string;
  page_path: string | null;
  chat_summary: string | null;
  status: string;
};

type Tab = 'courses' | 'chatbot';

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Pure loader: no React state, so the effect below can apply the result after
 * awaiting rather than setting state synchronously on mount. */
async function loadLeads() {
  const [leadsRes, inquiriesRes] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(500),
    supabase
      .from('customer_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  const failure = leadsRes.error || inquiriesRes.error;
  return {
    courseLeads: (leadsRes.data ?? []) as CourseLead[],
    inquiries: (inquiriesRes.data ?? []) as Inquiry[],
    error: !failure
      ? null
      : failure.message.includes('does not exist') || failure.message.includes('schema cache')
        ? 'Lead tables not found. Apply supabase/migrations/20260719_analytics_rollups.sql.'
        : `Could not load leads: ${failure.message}`,
  };
}

export default function LeadsPage() {
  const [tab, setTab] = useState<Tab>('courses');
  const [courseLeads, setCourseLeads] = useState<CourseLead[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadLeads();
      if (cancelled) return;
      setCourseLeads(result.courseLeads);
      setInquiries(result.inquiries);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await loadLeads();
    setCourseLeads(result.courseLeads);
    setInquiries(result.inquiries);
    setError(result.error);
    setLoading(false);
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    // Optimistic: the select is the only control, so a failed write is visible
    // on the next refresh rather than silently diverging.
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    const { error: updateError } = await supabase
      .from('customer_inquiries')
      .update({ status })
      .eq('id', id);
    if (updateError) setError(`Could not update status: ${updateError.message}`);
  }, []);

  const newInquiries = useMemo(
    () => inquiries.filter((i) => i.status === 'new').length,
    [inquiries],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-orange-600">
            <Inbox className="h-5 w-5" />
            <span className="text-sm font-semibold">Incoming interest</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900">Leads</h1>
          <p className="mt-2 max-w-2xl text-stone-500">
            Everyone who left their contact details — through a course form or through Lina, the
            chatbot.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 font-medium text-stone-600 transition hover:border-orange-200 hover:text-orange-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <TabButton
          active={tab === 'courses'}
          onClick={() => setTab('courses')}
          icon={<GraduationCap className="h-4 w-4" />}
          label="Course sign-ups"
          count={courseLeads.length}
        />
        <TabButton
          active={tab === 'chatbot'}
          onClick={() => setTab('chatbot')}
          icon={<MessageSquare className="h-4 w-4" />}
          label="Chatbot inquiries"
          count={inquiries.length}
          badge={newInquiries > 0 ? newInquiries : undefined}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-stone-500">Loading leads…</div>
        ) : tab === 'courses' ? (
          courseLeads.length === 0 ? (
            <EmptyState text="No course sign-ups yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-stone-100 bg-stone-50 text-left">
                  <tr>
                    <Th>Course</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>City</Th>
                    <Th>TikTok</Th>
                    <Th className="text-right">When</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {courseLeads.map((lead) => (
                    <tr key={lead.id} className="transition-colors hover:bg-stone-50">
                      <td className="px-5 py-3 font-medium text-stone-900">{lead.course_title}</td>
                      <td className="px-5 py-3 text-stone-600">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="hover:text-orange-600">
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-stone-600">
                        {lead.phone ?? <span className="text-stone-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-stone-600">
                        {lead.city ?? <span className="text-stone-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-stone-600">
                        {lead.tiktok_handle ?? <span className="text-stone-300">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-stone-500">
                        {formatWhen(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : inquiries.length === 0 ? (
          <EmptyState text="No chatbot inquiries yet." />
        ) : (
          <div className="divide-y divide-stone-100">
            {inquiries.map((inq) => (
              <article key={inq.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-stone-900">{inq.name || 'Anonymous'}</span>
                    {inq.topic && (
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        {inq.topic}
                      </span>
                    )}
                    <span className="text-xs text-stone-400">{formatWhen(inq.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
                    {inq.message}
                  </p>
                  {inq.chat_summary && (
                    <p className="mt-2 rounded-lg bg-stone-50 p-3 text-xs italic text-stone-500">
                      Chat summary: {inq.chat_summary}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-stone-500">
                    {inq.whatsapp && <span>WA: {inq.whatsapp}</span>}
                    {inq.email && <span>{inq.email}</span>}
                    {inq.page_path && <span>from {inq.page_path}</span>}
                  </div>
                </div>
                <select
                  value={inq.status}
                  onChange={(e) => updateStatus(inq.id, e.target.value)}
                  aria-label={`Status for inquiry from ${inq.name || 'anonymous visitor'}`}
                  className="shrink-0 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-5 py-3 font-medium text-stone-500 ${className}`}>{children}</th>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-12 text-center">
      <Inbox className="mx-auto mb-3 h-10 w-10 text-orange-300" />
      <p className="text-sm text-stone-500">{text}</p>
      {/* Under RLS a non-permitted SELECT returns an empty set, not an error, so
          "nothing here" and "you can't see it" look identical. Say so. */}
      <p className="mx-auto mt-2 max-w-md text-xs text-stone-400">
        If you expected entries here, check that your account has role
        <code className="mx-1 rounded bg-stone-100 px-1 py-0.5">admin</code>
        in the <code className="rounded bg-stone-100 px-1 py-0.5">users</code> table — RLS returns
        an empty list rather than an error when access is denied.
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
        active
          ? 'bg-orange-600 text-white'
          : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
      }`}
    >
      {icon}
      {label}
      <span className={active ? 'text-orange-100' : 'text-stone-400'}>({count})</span>
      {badge !== undefined && (
        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge} new
        </span>
      )}
    </button>
  );
}
