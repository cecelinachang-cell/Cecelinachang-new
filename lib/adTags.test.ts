import { describe, expect, it } from 'vitest';
import { adSearch, fbcFor, rememberAdTags } from './adTags';

function memoryStore(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_794_000_000_000;

describe('fbcFor', () => {
  it('builds the Meta click ID format', () => {
    expect(fbcFor('abc', T0)).toBe(`fb.1.${T0}.abc`);
  });
});

describe('adSearch', () => {
  it('is empty for a visitor without ad tags', () => {
    expect(adSearch('', memoryStore(), T0)).toBe('');
  });

  it('keeps utm tags and fbclid from the current URL and adds fbc', () => {
    const q = new URLSearchParams(adSearch('?utm_source=meta&utm_content=B&fbclid=xyz&ref=1', memoryStore(), T0));
    expect(q.get('utm_source')).toBe('meta');
    expect(q.get('utm_content')).toBe('B');
    expect(q.get('fbclid')).toBe('xyz');
    expect(q.get('fbc')).toBe(`fb.1.${T0}.xyz`);
    expect(q.has('ref')).toBe(false);
  });

  it('remembers ad tags for a later page in the same visit', () => {
    const store = memoryStore();
    rememberAdTags('?utm_source=meta&utm_campaign=bakso_nov26&fbclid=xyz', store, T0);
    const q = new URLSearchParams(adSearch('', store, T0 + 60_000));
    expect(q.get('utm_campaign')).toBe('bakso_nov26');
    expect(q.get('fbc')).toBe(`fb.1.${T0}.xyz`);
  });

  it('keeps the first click time when the same fbclid comes back', () => {
    const store = memoryStore();
    rememberAdTags('?utm_source=meta&fbclid=xyz', store, T0);
    rememberAdTags('?utm_source=meta&fbclid=xyz', store, T0 + DAY);
    expect(new URLSearchParams(adSearch('', store, T0 + DAY)).get('fbc')).toBe(`fb.1.${T0}.xyz`);
  });

  it('forgets ad tags after 7 days', () => {
    const store = memoryStore();
    rememberAdTags('?utm_source=meta&fbclid=xyz', store, T0);
    expect(adSearch('', store, T0 + 8 * DAY)).toBe('');
  });

  it('ignores a URL without ad tags and does not overwrite the stored ones', () => {
    const store = memoryStore();
    rememberAdTags('?utm_source=meta&fbclid=xyz', store, T0);
    rememberAdTags('?ref=home', store, T0 + 1000);
    expect(new URLSearchParams(adSearch('?ref=home', store, T0 + 1000)).get('fbclid')).toBe('xyz');
  });

  it('survives broken storage', () => {
    const broken = memoryStore();
    broken.setItem('clc_ad_tags', '{not json');
    expect(adSearch('', broken, T0)).toBe('');
    const throwing = { ...memoryStore(), getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } } as Storage;
    expect(() => rememberAdTags('?fbclid=x', throwing, T0)).not.toThrow();
    expect(adSearch('', throwing, T0)).toBe('');
    expect(adSearch('', undefined, T0)).toBe('');
  });
});
