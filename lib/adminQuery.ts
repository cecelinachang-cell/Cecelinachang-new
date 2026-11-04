/**
 * Turns the small query spec sent by lib/adminDb.ts (the admin pages'
 * supabase-style client) into parameterized SQL. Pure, so it is unit-tested
 * without a database; app/api/admin/db runs the result.
 *
 * Only the tables, columns and operations below are reachable. Identifiers
 * come from these lists, never from the request, and every value is a
 * bind parameter.
 */

type TableRule = { columns: readonly string[]; write: boolean };

export const ADMIN_TABLES: Record<string, TableRule> = {
  courses: {
    columns: ['id', 'slug', 'title', 'description', 'price', 'imageUrl', 'createdAt', 'orderIndex', 'originalPrice', 'students', 'duration', 'modules', 'video', 'benefits', 'isSignature', 'shopeeUrl'],
    write: true,
  },
  items: {
    columns: ['id', 'name', 'description', 'price', 'category', 'imageUrl', 'rating', 'reviews', 'createdAt', 'shopeeUrl'],
    write: true,
  },
  settings: { columns: ['id', 'title', 'description', 'logo_url', 'updated_at'], write: true },
  testimonials: { columns: ['id', 'name', 'text', 'rating', 'imageUrl', 'createdAt'], write: true },
  customer_inquiries: {
    columns: ['id', 'name', 'whatsapp', 'email', 'topic', 'message', 'page_path', 'chat_summary', 'status', 'created_at'],
    write: true,
  },
  leads: {
    columns: ['id', 'created_at', 'course_slug', 'course_title', 'email', 'phone', 'city', 'tiktok_handle', 'welcome_email_sent_at', 'reminder_email_sent_at', 'quiz_answers', 'source', 'age_range', 'name'],
    write: false,
  },
};

/** Database functions the admin dashboard may call, with their named args in order. */
export const ADMIN_RPCS: Record<string, readonly string[]> = {
  analytics_dashboard: ['days', 'lim'],
  analytics_active_now: [],
};

export type Filter = { column: string; op: 'eq' | 'in'; value: unknown };
export type Order = { column: string; ascending: boolean };

export type QuerySpec =
  | { kind: 'select'; table: string; columns?: string; filters?: Filter[]; order?: Order[]; limit?: number; count?: boolean; head?: boolean }
  | { kind: 'insert'; table: string; values: Record<string, unknown> | Record<string, unknown>[]; returning?: boolean }
  | { kind: 'upsert'; table: string; values: Record<string, unknown> | Record<string, unknown>[]; onConflict?: string; returning?: boolean }
  | { kind: 'update'; table: string; values: Record<string, unknown>; filters?: Filter[]; returning?: boolean }
  | { kind: 'delete'; table: string; filters?: Filter[] }
  | { kind: 'rpc'; fn: string; args?: Record<string, unknown> };

export type CompiledQuery = { text: string; params: unknown[]; countText?: string; countParams?: unknown[] };

export class AdminQueryError extends Error {}

const q = (ident: string) => `"${ident}"`;

function rule(table: string, needWrite: boolean): TableRule {
  const r = Object.prototype.hasOwnProperty.call(ADMIN_TABLES, table) ? ADMIN_TABLES[table] : undefined;
  if (!r) throw new AdminQueryError(`Unknown table: ${table}`);
  if (needWrite && !r.write) throw new AdminQueryError(`Table is read-only: ${table}`);
  return r;
}

function column(r: TableRule, table: string, name: string): string {
  if (!r.columns.includes(name)) throw new AdminQueryError(`Unknown column ${table}.${name}`);
  return q(name);
}

/** Postgres needs arrays/objects as JSON for json(b) columns; text[] columns take JS arrays as-is. */
function bindValue(value: unknown): unknown {
  if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    return JSON.stringify(value);
  }
  return value;
}

function where(r: TableRule, table: string, filters: Filter[] | undefined, params: unknown[]): string {
  if (!filters?.length) return '';
  const parts = filters.map((f) => {
    const col = column(r, table, f.column);
    if (f.op === 'eq') {
      params.push(f.value);
      return `${col} = $${params.length}`;
    }
    if (f.op === 'in') {
      if (!Array.isArray(f.value)) throw new AdminQueryError('"in" needs an array');
      params.push(f.value);
      return `${col} = any($${params.length})`;
    }
    throw new AdminQueryError(`Unsupported filter: ${String((f as Filter).op)}`);
  });
  return ` where ${parts.join(' and ')}`;
}

function rowsOf(values: Record<string, unknown> | Record<string, unknown>[]): Record<string, unknown>[] {
  const rows = Array.isArray(values) ? values : [values];
  if (!rows.length) throw new AdminQueryError('No rows to write');
  return rows;
}

function valuesClause(r: TableRule, table: string, rows: Record<string, unknown>[], params: unknown[]) {
  const cols = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const quoted = cols.map((c) => column(r, table, c));
  const tuples = rows.map((row) => {
    const placeholders = cols.map((c) => {
      if (!(c in row)) return 'default';
      params.push(bindValue(row[c]));
      return `$${params.length}`;
    });
    return `(${placeholders.join(', ')})`;
  });
  return { cols, quoted, tuples };
}

export function compileAdminQuery(spec: QuerySpec): CompiledQuery {
  const params: unknown[] = [];

  if (spec.kind === 'rpc') {
    const argNames = Object.prototype.hasOwnProperty.call(ADMIN_RPCS, spec.fn) ? ADMIN_RPCS[spec.fn] : undefined;
    if (!argNames) throw new AdminQueryError(`Unknown function: ${spec.fn}`);
    const args = argNames.map((name) => {
      params.push(spec.args?.[name] ?? null);
      return `${name} => $${params.length}`;
    });
    // A function returning a scalar or json comes back as one row, one column.
    return { text: `select public.${spec.fn}(${args.join(', ')}) as result`, params };
  }

  if (spec.kind === 'select') {
    const r = rule(spec.table, false);
    const cols = !spec.columns || spec.columns.trim() === '*'
      ? '*'
      : spec.columns.split(',').map((c) => column(r, spec.table, c.trim())).join(', ');
    const whereSql = where(r, spec.table, spec.filters, params);
    const order = spec.order?.length
      ? ` order by ${spec.order.map((o) => `${column(r, spec.table, o.column)} ${o.ascending ? 'asc' : 'desc'}`).join(', ')}`
      : '';
    let limit = '';
    if (spec.limit !== undefined) {
      if (!Number.isInteger(spec.limit) || spec.limit < 0 || spec.limit > 5000) throw new AdminQueryError('Bad limit');
      limit = ` limit ${spec.limit}`;
    }
    const compiled: CompiledQuery = { text: `select ${cols} from ${q(spec.table)}${whereSql}${order}${limit}`, params };
    if (spec.count) {
      compiled.countText = `select count(*)::int as count from ${q(spec.table)}${whereSql}`;
      compiled.countParams = [...params];
    }
    return compiled;
  }

  if (spec.kind === 'insert' || spec.kind === 'upsert') {
    const r = rule(spec.table, true);
    const rows = rowsOf(spec.values);
    const { cols, quoted, tuples } = valuesClause(r, spec.table, rows, params);
    let text = `insert into ${q(spec.table)} (${quoted.join(', ')}) values ${tuples.join(', ')}`;
    if (spec.kind === 'upsert') {
      const conflict = column(r, spec.table, spec.onConflict || 'id');
      const updates = cols.filter((c) => c !== (spec.onConflict || 'id')).map((c) => `${q(c)} = excluded.${q(c)}`);
      text += updates.length ? ` on conflict (${conflict}) do update set ${updates.join(', ')}` : ` on conflict (${conflict}) do nothing`;
    }
    return { text: `${text}${spec.returning ? ' returning *' : ''}`, params };
  }

  if (spec.kind === 'update') {
    const r = rule(spec.table, true);
    const entries = Object.entries(spec.values);
    if (!entries.length) throw new AdminQueryError('Nothing to update');
    const sets = entries.map(([c, v]) => {
      params.push(bindValue(v));
      return `${column(r, spec.table, c)} = $${params.length}`;
    });
    if (!spec.filters?.length) throw new AdminQueryError('Update needs a filter');
    const whereSql = where(r, spec.table, spec.filters, params);
    return { text: `update ${q(spec.table)} set ${sets.join(', ')}${whereSql}${spec.returning ? ' returning *' : ''}`, params };
  }

  if (spec.kind === 'delete') {
    const r = rule(spec.table, true);
    if (!spec.filters?.length) throw new AdminQueryError('Delete needs a filter');
    return { text: `delete from ${q(spec.table)}${where(r, spec.table, spec.filters, params)}`, params };
  }

  throw new AdminQueryError('Unknown query kind');
}
