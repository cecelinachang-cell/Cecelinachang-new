import { describe, expect, it } from 'vitest';
import { createHash } from 'crypto';
import {
  isValidNotificationSignature,
  mapTransactionStatus,
  newMerchantRef,
  parseGrossAmount,
  paymentLabel,
} from './midtrans';

describe('isValidNotificationSignature', () => {
  const n = { order_id: 'CLC-1-AB', status_code: '200', gross_amount: '399000.00' };
  const signature_key = createHash('sha512').update('CLC-1-AB200399000.00SB-key').digest('hex');

  it('accepts SHA512(order_id + status_code + gross_amount + server_key)', () => {
    expect(isValidNotificationSignature('SB-key', { ...n, signature_key })).toBe(true);
  });

  it('rejects a wrong key, tampered amount or missing fields', () => {
    expect(isValidNotificationSignature('other', { ...n, signature_key })).toBe(false);
    expect(isValidNotificationSignature('SB-key', { ...n, gross_amount: '1.00', signature_key })).toBe(false);
    expect(isValidNotificationSignature('SB-key', { ...n })).toBe(false);
    expect(isValidNotificationSignature('SB-key', { ...n, gross_amount: 399000, signature_key })).toBe(false);
  });
});

describe('mapTransactionStatus', () => {
  it('maps Midtrans statuses onto order states', () => {
    expect(mapTransactionStatus('settlement')).toBe('PAID');
    expect(mapTransactionStatus('capture', 'accept')).toBe('PAID');
    expect(mapTransactionStatus('capture', 'challenge')).toBeNull();
    expect(mapTransactionStatus('capture', 'deny')).toBe('FAILED');
    expect(mapTransactionStatus('pending')).toBeNull();
    expect(mapTransactionStatus('expire')).toBe('EXPIRED');
    expect(mapTransactionStatus('cancel')).toBe('FAILED');
    expect(mapTransactionStatus('refund')).toBe('REFUND');
    expect(mapTransactionStatus('partial_refund')).toBeNull();
    expect(mapTransactionStatus(undefined)).toBeNull();
  });
});

describe('parseGrossAmount', () => {
  it('parses Midtrans decimal strings', () => {
    expect(parseGrossAmount('399000.00')).toBe(399000);
    expect(parseGrossAmount('abc')).toBeNull();
    expect(parseGrossAmount(undefined)).toBeNull();
  });
});

describe('paymentLabel', () => {
  it('names the bank for VAs and falls back to the raw type', () => {
    expect(paymentLabel({ payment_type: 'bank_transfer', va_numbers: [{ bank: 'bca' }] })).toBe('BCA Virtual Account');
    expect(paymentLabel({ payment_type: 'qris' })).toBe('QRIS');
    expect(paymentLabel({ payment_type: 'cstore', store: 'alfamart' })).toBe('Alfamart');
    expect(paymentLabel({ payment_type: 'something_new' })).toBe('something_new');
    expect(paymentLabel({})).toBeNull();
  });
});

describe('newMerchantRef', () => {
  it('is unique, Midtrans-safe and matches the /pembayaran route pattern', () => {
    const a = newMerchantRef();
    expect(a).toMatch(/^CLC-[A-Z0-9-]{8,40}$/);
    expect(a.length).toBeLessThanOrEqual(50);
    expect(newMerchantRef()).not.toBe(a);
  });
});
