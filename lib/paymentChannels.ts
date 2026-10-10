// Tripay channels offered in the checkout form. Its own module (no
// node:crypto) so the client form and the server share one list.
//
// Each must also be switched on in the Tripay dashboard (Merchant > Opsi
// Kanal Pembayaran); Tripay rejects a transaction for a channel the merchant
// hasn't enabled. Cards are left out on purpose: personal merchants don't
// get them.
export const PAYMENT_CHANNELS = [
  { code: 'QRIS', label: 'QRIS (semua e-wallet & m-banking)' },
  { code: 'BCAVA', label: 'BCA Virtual Account' },
  { code: 'BRIVA', label: 'BRI Virtual Account' },
  { code: 'MANDIRIVA', label: 'Mandiri Virtual Account' },
  { code: 'BNIVA', label: 'BNI Virtual Account' },
  { code: 'PERMATAVA', label: 'Permata Virtual Account' },
  { code: 'DANA', label: 'DANA' },
  { code: 'SHOPEEPAY', label: 'ShopeePay' },
  { code: 'OVO', label: 'OVO' },
] as const;

export type PaymentChannelCode = (typeof PAYMENT_CHANNELS)[number]['code'];

export function isPaymentChannel(code: unknown): code is PaymentChannelCode {
  return typeof code === 'string' && PAYMENT_CHANNELS.some((c) => c.code === code);
}
