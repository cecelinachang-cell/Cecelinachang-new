import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { PaymentChannelCode } from '@/lib/paymentChannels';

// Tripay (tripay.co.id) payment gateway. Chosen because it accepts a
// personal ("Perorangan") merchant account verified with just a KTP -- no
// NIB/SIUP/akta badan usaha -- and still offers QRIS, bank virtual accounts
// and e-wallets. Server-only: the private key signs requests and verifies
// callbacks, so never import this from a client component.
//
// Docs: https://tripay.co.id/developer

export type TripayConfig = {
  apiKey: string;
  privateKey: string;
  merchantCode: string;
  baseUrl: string;
};

export function getTripayConfig(): TripayConfig | null {
  const apiKey = process.env.TRIPAY_API_KEY;
  const privateKey = process.env.TRIPAY_PRIVATE_KEY;
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE;
  if (!apiKey || !privateKey || !merchantCode) return null;
  const production = process.env.TRIPAY_IS_PRODUCTION === 'true';
  return {
    apiKey,
    privateKey,
    merchantCode,
    baseUrl: production ? 'https://tripay.co.id/api' : 'https://tripay.co.id/api-sandbox',
  };
}

/** Order id we hand Tripay. Random, so the /pembayaran/<ref> status page can't be enumerated. */
export function newMerchantRef(): string {
  return `CLC-${Date.now().toString(36).toUpperCase()}-${randomBytes(6).toString('hex').toUpperCase()}`;
}

/** Signature for transaction/create: HMAC-SHA256(merchant_code + merchant_ref + amount). */
export function transactionSignature(
  privateKey: string,
  merchantCode: string,
  merchantRef: string,
  amount: number,
): string {
  return createHmac('sha256', privateKey).update(`${merchantCode}${merchantRef}${amount}`).digest('hex');
}

/**
 * Tripay signs each callback with HMAC-SHA256 of the raw JSON body in the
 * X-Callback-Signature header. Must be checked against the raw text, before
 * JSON.parse -- re-serialising changes the bytes.
 */
export function isValidCallbackSignature(
  privateKey: string,
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  const expected = createHmac('sha256', privateKey).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature.trim().toLowerCase(), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export type TripayStatus = 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND';

const STATUSES: readonly TripayStatus[] = ['UNPAID', 'PAID', 'EXPIRED', 'FAILED', 'REFUND'];

export function parseTripayStatus(value: unknown): TripayStatus | null {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value)
    ? (value as TripayStatus)
    : null;
}

export type CreateTransactionInput = {
  method: PaymentChannelCode;
  merchantRef: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  item: { sku: string; name: string; price: number };
  returnUrl: string;
  callbackUrl: string;
  expiresInSeconds: number;
};

export type CreateTransactionResult =
  | { ok: true; reference: string; checkoutUrl: string; expiredTime: number | null }
  | { ok: false; message: string };

export async function createTransaction(
  config: TripayConfig,
  input: CreateTransactionInput,
): Promise<CreateTransactionResult> {
  const body = {
    method: input.method,
    merchant_ref: input.merchantRef,
    amount: input.amount,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    order_items: [{ sku: input.item.sku, name: input.item.name, price: input.item.price, quantity: 1 }],
    return_url: input.returnUrl,
    callback_url: input.callbackUrl,
    expired_time: Math.floor(Date.now() / 1000) + input.expiresInSeconds,
    signature: transactionSignature(config.privateKey, config.merchantCode, input.merchantRef, input.amount),
  };

  let res: Response;
  try {
    res = await fetch(`${config.baseUrl}/transaction/create`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
  } catch (err) {
    return { ok: false, message: `Tripay unreachable: ${err instanceof Error ? err.message : String(err)}` };
  }

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: { reference?: string; checkout_url?: string; expired_time?: number };
  } | null;

  if (!res.ok || !json?.success || !json.data?.reference || !json.data.checkout_url) {
    return { ok: false, message: json?.message || `Tripay HTTP ${res.status}` };
  }

  return {
    ok: true,
    reference: json.data.reference,
    checkoutUrl: json.data.checkout_url,
    expiredTime: typeof json.data.expired_time === 'number' ? json.data.expired_time : null,
  };
}
