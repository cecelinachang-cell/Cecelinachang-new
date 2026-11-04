'use client';

import type { Filter, Order, QuerySpec } from '@/lib/adminQuery';

/**
 * Supabase-style query client for the admin pages, backed by
 * app/api/admin/db (Neon). It covers only what the admin pages use:
 * select / insert / upsert / update / delete with eq / in / order / limit /
 * single, rpc(), and channel() for refresh-after-save.
 *
 * Supabase pushed table changes over realtime; here a successful write calls
 * the same-tab listeners registered with channel().on(...) instead, so the
 * pages that re-fetch on change keep working.
 */
export type AdminError = { message: string };
/**
 * Rows like supabase-js returns them: an array of rows, or one row after
 * .single(). Typed as both so the existing pages type-check either way.
 */
export type AdminRows = Record<string, any>[] & Record<string, any>;
export type AdminResult<T = AdminRows> = { data: T | null; error: AdminError | null; count?: number | null };

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function notify(table: string) {
  listeners.get(table)?.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}

async function run(spec: QuerySpec): Promise<AdminResult> {
  try {
    const res = await fetch('/api/admin/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spec),
      cache: 'no-store',
    });
    const body = (await res.json().catch(() => null)) as AdminResult | null;
    if (!body) return { data: null, error: { message: `Admin API error (${res.status})` } };
    if (!body.error && spec.kind !== 'select' && spec.kind !== 'rpc') notify(spec.table);
    return body;
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

class QueryBuilder implements PromiseLike<AdminResult> {
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private limitN?: number;
  private singleMode: 'single' | 'maybe' | null = null;
  private kind: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select';
  private columns = '*';
  private values: any;
  private onConflict?: string;
  private returning = false;
  private count = false;
  private head = false;

  constructor(private table: string) {}

  select(columns = '*', opts?: { count?: 'exact'; head?: boolean }) {
    if (this.kind === 'select') {
      this.columns = columns;
      this.count = opts?.count === 'exact';
      this.head = Boolean(opts?.head);
    } else {
      this.returning = true; // .insert(...).select() returns the written rows
    }
    return this;
  }
  insert(values: any) {
    this.kind = 'insert';
    this.values = values;
    return this;
  }
  upsert(values: any, opts?: { onConflict?: string }) {
    this.kind = 'upsert';
    this.values = values;
    this.onConflict = opts?.onConflict;
    return this;
  }
  update(values: any) {
    this.kind = 'update';
    this.values = values;
    return this;
  }
  delete() {
    this.kind = 'delete';
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push({ column, op: 'eq', value });
    return this;
  }
  in(column: string, value: unknown[]) {
    this.filters.push({ column, op: 'in', value });
    return this;
  }
  order(column: string, opts?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: opts?.ascending ?? true });
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single() {
    this.singleMode = 'single';
    this.returning = this.returning || this.kind !== 'select';
    return this;
  }
  maybeSingle() {
    this.singleMode = 'maybe';
    this.returning = this.returning || this.kind !== 'select';
    return this;
  }

  private spec(): QuerySpec {
    const t = this.table;
    switch (this.kind) {
      case 'select':
        return { kind: 'select', table: t, columns: this.columns, filters: this.filters, order: this.orders, limit: this.limitN, count: this.count, head: this.head };
      case 'insert':
        return { kind: 'insert', table: t, values: this.values, returning: this.returning };
      case 'upsert':
        return { kind: 'upsert', table: t, values: this.values, onConflict: this.onConflict, returning: this.returning };
      case 'update':
        return { kind: 'update', table: t, values: this.values, filters: this.filters, returning: this.returning };
      case 'delete':
        return { kind: 'delete', table: t, filters: this.filters };
    }
  }

  private async exec(): Promise<AdminResult> {
    const result = await run(this.spec());
    if (result.error || !this.singleMode) return result;
    const rows = Array.isArray(result.data) ? result.data : [];
    if (rows.length === 1) return { ...result, data: rows[0] as AdminRows };
    if (rows.length === 0 && this.singleMode === 'maybe') return { ...result, data: null };
    return { data: null, error: { message: rows.length ? 'More than one row returned' : 'No rows returned' } };
  }

  then<R1 = AdminResult, R2 = never>(
    onfulfilled?: ((value: AdminResult) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

class Channel {
  private registered: Array<[string, Listener]> = [];
  on(_event: string, filter: { event?: string; schema?: string; table?: string }, callback: Listener) {
    if (filter?.table) {
      if (!listeners.has(filter.table)) listeners.set(filter.table, new Set());
      listeners.get(filter.table)!.add(callback);
      this.registered.push([filter.table, callback]);
    }
    return this;
  }
  subscribe() {
    return this;
  }
  unsubscribeAll() {
    this.registered.forEach(([table, cb]) => listeners.get(table)?.delete(cb));
    this.registered = [];
  }
}

export const adminDb = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  rpc(fn: string, args?: Record<string, unknown>): PromiseLike<AdminResult> {
    return run({ kind: 'rpc', fn, args });
  },
  channel(_name: string) {
    return new Channel();
  },
  removeChannel(channel: Channel) {
    channel.unsubscribeAll();
  },
};

export type AdminDb = typeof adminDb;
