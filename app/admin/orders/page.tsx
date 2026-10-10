'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * Online course payments (public.orders), written by app/api/checkout and
 * app/api/midtrans/notification. Needs supabase/migrations/20261010_course_orders.sql.
 * The only thing an admin changes here is "Akses dikirim", ticked once the
 * Google Drive class access has been shared with the buyer.
 */

type Order = {
  id: string;
  created_at: string;
  merchant_ref: string;
  course_title: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: string | null;
  status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND';
  paid_at: string | null;
  access_sent_at: string | null;
};

type Filter = 'paid' | 'all';

const STATUS_STYLE: Record<Order['status'], string> = {
  PAID: 'bg-green-50 text-green-700',
  UNPAID: 'bg-amber-50 text-amber-700',
  EXPIRED: 'bg-stone-100 text-stone-500',
  FAILED: 'bg-red-50 text-red-600',
  REFUND: 'bg-purple-50 text-purple-700',
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const rupiah = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

async function loadOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  return {
    orders: (data ?? []) as Order[],
    error: !error
      ? null
      : error.message.includes('does not exist') || error.message.includes('schema cache')
        ? 'Orders table not found. Apply supabase/migrations/20261010_course_orders.sql.'
        : `Could not load orders: ${error.message}`,
  };
}

export default function OrdersPage() {
  const [filter, setFilter] = useState<Filter>('paid');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadOrders();
      if (cancelled) return;
      setOrders(result.orders);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await loadOrders();
    setOrders(result.orders);
    setError(result.error);
    setLoading(false);
  }, []);

  const toggleAccess = useCallback(async (order: Order) => {
    const access_sent_at = order.access_sent_at ? null : new Date().toISOString();
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, access_sent_at } : o)));
    const { error: updateError } = await supabase.from('orders').update({ access_sent_at }).eq('id', order.id);
    if (updateError) setError(`Could not update order: ${updateError.message}`);
  }, []);

  const paid = useMemo(() => orders.filter((o) => o.status === 'PAID'), [orders]);
  const shown = filter === 'paid' ? paid : orders;
  const revenue = useMemo(() => paid.reduce((sum, o) => sum + o.amount, 0), [paid]);
  const awaitingAccess = useMemo(() => paid.filter((o) => !o.access_sent_at).length, [paid]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-orange-600">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-semibold">Midtrans payments</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900">Orders</h1>
          <p className="mt-2 max-w-2xl text-stone-500">
            Paid online checkouts. Share the class&apos;s Google Drive access with the buyer&apos;s email, then tick
            &quot;Akses dikirim&quot;.
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Paid orders" value={String(paid.length)} />
        <Stat label="Revenue (gross)" value={rupiah(revenue)} />
        <Stat label="Waiting for access" value={String(awaitingAccess)} highlight={awaitingAccess > 0} />
      </div>

      <div className="flex gap-2">
        {(['paid', 'all'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              filter === f ? 'bg-orange-600 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {f === 'paid' ? `Paid (${paid.length})` : `All checkouts (${orders.length})`}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-stone-500">Loading orders…</div>
        ) : shown.length === 0 ? (
          <div className="p-12 text-center text-sm text-stone-500">
            <Wallet className="mx-auto mb-3 h-10 w-10 text-orange-300" />
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100 bg-stone-50 text-left">
                <tr>
                  <Th>Course</Th>
                  <Th>Buyer</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Akses dikirim</Th>
                  <Th className="text-right">When</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {shown.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-stone-900">{o.course_title}</div>
                      <div className="text-xs text-stone-400">{o.merchant_ref}</div>
                    </td>
                    <td className="px-5 py-3 text-stone-600">
                      <div className="font-semibold text-stone-900">{o.customer_name}</div>
                      <a href={`mailto:${o.customer_email}`} className="hover:text-orange-600">
                        {o.customer_email}
                      </a>
                      <div className="text-xs text-stone-400">{o.customer_phone}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-stone-600">
                      {rupiah(o.amount)}
                      <div className="text-xs text-stone-400">{o.payment_method}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {o.status === 'PAID' ? (
                        <input
                          type="checkbox"
                          checked={Boolean(o.access_sent_at)}
                          onChange={() => toggleAccess(o)}
                          aria-label={`Access sent to ${o.customer_name}`}
                          className="h-5 w-5 accent-orange-600"
                        />
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-stone-500">
                      {formatWhen(o.paid_at ?? o.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${highlight ? 'text-orange-600' : 'text-stone-900'}`}>{value}</div>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-5 py-3 font-medium text-stone-500 ${className}`}>{children}</th>;
}
