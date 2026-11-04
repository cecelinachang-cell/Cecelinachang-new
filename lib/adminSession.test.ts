import { describe, expect, it } from 'vitest';
import { ADMIN_COOKIE, SESSION_MS, createSessionToken, isAdminRequest, safeEqual, verifySessionToken } from './adminSession';

const SECRET = 'test-secret-0123456789abcdef';

describe('admin session token', () => {
  it('accepts a fresh token signed with the same secret', async () => {
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, SECRET)).toBe(true);
  });

  it('rejects a token signed with another secret', async () => {
    const token = await createSessionToken('other-secret');
    expect(await verifySessionToken(token, SECRET)).toBe(false);
  });

  it('rejects an expired token', async () => {
    const issued = Date.now() - SESSION_MS - 1000;
    const token = await createSessionToken(SECRET, issued);
    expect(await verifySessionToken(token, SECRET)).toBe(false);
  });

  it('rejects a token whose expiry was pushed forward', async () => {
    const token = await createSessionToken(SECRET);
    const [, signature] = token.split('.');
    const forged = `${Date.now() + 10 * SESSION_MS}.${signature}`;
    expect(await verifySessionToken(forged, SECRET)).toBe(false);
  });

  it('rejects missing or malformed tokens and a missing secret', async () => {
    expect(await verifySessionToken(undefined, SECRET)).toBe(false);
    expect(await verifySessionToken('garbage', SECRET)).toBe(false);
    expect(await verifySessionToken('abc.def', SECRET)).toBe(false);
    expect(await verifySessionToken(await createSessionToken(SECRET), undefined)).toBe(false);
  });

  it('reads the cookie from a request', async () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    const token = await createSessionToken(SECRET);
    const ok = new Request('https://x.test/api/admin/db', { headers: { cookie: `other=1; ${ADMIN_COOKIE}=${encodeURIComponent(token)}` } });
    const none = new Request('https://x.test/api/admin/db');
    expect(await isAdminRequest(ok)).toBe(true);
    expect(await isAdminRequest(none)).toBe(false);
  });
});

describe('safeEqual', () => {
  it('compares strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});
