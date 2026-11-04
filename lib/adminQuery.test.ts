import { describe, expect, it } from 'vitest';
import { AdminQueryError, compileAdminQuery } from './adminQuery';

describe('compileAdminQuery', () => {
  it('builds a filtered, ordered, limited select with bind parameters', () => {
    expect(
      compileAdminQuery({
        kind: 'select',
        table: 'leads',
        filters: [{ column: 'course_slug', op: 'eq', value: 'fu-kian' }],
        order: [{ column: 'created_at', ascending: false }],
        limit: 500,
      }),
    ).toEqual({
      text: 'select * from "leads" where "course_slug" = $1 order by "created_at" desc limit 500',
      params: ['fu-kian'],
    });
  });

  it('selects named columns and "in" filters', () => {
    expect(
      compileAdminQuery({ kind: 'select', table: 'settings', columns: 'id, logo_url', filters: [{ column: 'id', op: 'in', value: ['a', 'b'] }] }),
    ).toEqual({ text: 'select "id", "logo_url" from "settings" where "id" = any($1)', params: [['a', 'b']] });
  });

  it('adds a count query when asked', () => {
    const c = compileAdminQuery({ kind: 'select', table: 'courses', columns: 'id', count: true, head: true });
    expect(c.countText).toBe('select count(*)::int as count from "courses"');
  });

  it('inserts with defaults for missing keys and returns rows', () => {
    expect(
      compileAdminQuery({ kind: 'insert', table: 'testimonials', values: [{ name: 'A', rating: 5 }, { name: 'B' }], returning: true }),
    ).toEqual({
      text: 'insert into "testimonials" ("name", "rating") values ($1, $2), ($3, default) returning *',
      params: ['A', 5, 'B'],
    });
  });

  it('upserts on the id by default', () => {
    expect(compileAdminQuery({ kind: 'upsert', table: 'settings', values: { id: 'hero_image', logo_url: 'u' } })).toEqual({
      text: 'insert into "settings" ("id", "logo_url") values ($1, $2) on conflict ("id") do update set "logo_url" = excluded."logo_url"',
      params: ['hero_image', 'u'],
    });
  });

  it('updates and deletes by filter only', () => {
    expect(compileAdminQuery({ kind: 'update', table: 'courses', values: { orderIndex: 2 }, filters: [{ column: 'id', op: 'eq', value: 'x' }] })).toEqual({
      text: 'update "courses" set "orderIndex" = $1 where "id" = $2',
      params: [2, 'x'],
    });
    expect(compileAdminQuery({ kind: 'delete', table: 'items', filters: [{ column: 'id', op: 'eq', value: 'x' }] })).toEqual({
      text: 'delete from "items" where "id" = $1',
      params: ['x'],
    });
    expect(() => compileAdminQuery({ kind: 'delete', table: 'items' })).toThrow(AdminQueryError);
    expect(() => compileAdminQuery({ kind: 'update', table: 'items', values: { name: 'x' } })).toThrow(AdminQueryError);
  });

  it('keeps text[] arrays as arrays and turns objects into JSON', () => {
    const c = compileAdminQuery({ kind: 'update', table: 'courses', values: { benefits: ['a', 'b'] }, filters: [{ column: 'id', op: 'eq', value: 'x' }] });
    expect(c.params[0]).toEqual(['a', 'b']);
  });

  it('rejects unknown tables, columns, functions and writes to read-only tables', () => {
    expect(() => compileAdminQuery({ kind: 'select', table: 'users' })).toThrow(/Unknown table/);
    expect(() => compileAdminQuery({ kind: 'select', table: 'toString' })).toThrow(/Unknown table/);
    expect(() => compileAdminQuery({ kind: 'select', table: 'leads', columns: 'email; drop table leads' })).toThrow(/Unknown column/);
    expect(() => compileAdminQuery({ kind: 'select', table: 'leads', order: [{ column: 'x"', ascending: true }] })).toThrow(/Unknown column/);
    expect(() => compileAdminQuery({ kind: 'delete', table: 'leads', filters: [{ column: 'id', op: 'eq', value: 1 }] })).toThrow(/read-only/);
    expect(() => compileAdminQuery({ kind: 'rpc', fn: 'pg_sleep' })).toThrow(/Unknown function/);
  });

  it('calls whitelisted functions with named arguments', () => {
    expect(compileAdminQuery({ kind: 'rpc', fn: 'analytics_dashboard', args: { days: 30, lim: 8 } })).toEqual({
      text: 'select public.analytics_dashboard(days => $1, lim => $2) as result',
      params: [30, 8],
    });
  });
});
