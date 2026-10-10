import { describe, expect, it } from 'vitest';
import { createHmac } from 'crypto';
import { isValidCallbackSignature, newMerchantRef, parseTripayStatus, transactionSignature } from './tripay';

describe('transactionSignature', () => {
  it('is HMAC-SHA256 of merchant_code + merchant_ref + amount', () => {
    const expected = createHmac('sha256', 'priv').update('T0001CLC-1-AB299000').digest('hex');
    expect(transactionSignature('priv', 'T0001', 'CLC-1-AB', 299000)).toBe(expected);
  });
});

describe('isValidCallbackSignature', () => {
  const body = '{"merchant_ref":"CLC-1-AB","status":"PAID"}';
  const sig = createHmac('sha256', 'priv').update(body).digest('hex');

  it('accepts the signature of the raw body', () => {
    expect(isValidCallbackSignature('priv', body, sig)).toBe(true);
  });

  it('rejects a missing, wrong-key or tampered signature', () => {
    expect(isValidCallbackSignature('priv', body, null)).toBe(false);
    expect(isValidCallbackSignature('other', body, sig)).toBe(false);
    expect(isValidCallbackSignature('priv', body.replace('PAID', 'paid'), sig)).toBe(false);
    expect(isValidCallbackSignature('priv', body, 'abc')).toBe(false);
  });
});

describe('parseTripayStatus', () => {
  it('only accepts known statuses', () => {
    expect(parseTripayStatus('PAID')).toBe('PAID');
    expect(parseTripayStatus('paid')).toBeNull();
    expect(parseTripayStatus(undefined)).toBeNull();
  });
});

describe('newMerchantRef', () => {
  it('is unique and matches the /pembayaran route pattern', () => {
    const a = newMerchantRef();
    expect(a).toMatch(/^CLC-[A-Z0-9-]{8,40}$/);
    expect(newMerchantRef()).not.toBe(a);
  });
});
