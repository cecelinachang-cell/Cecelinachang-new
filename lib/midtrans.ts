import { createHash, randomBytes, timingSafeEqual } from 'crypto';

// Midtrans (midtrans.com, part of GoTo, licensed by Bank Indonesia) Snap
// payment page. An "Individu" merchant account needs only the owner's KTP and
// NPWP -- for individuals the NIK on the KTP doubles as the NPWP -- so no
// business license. Server-only: the server key authorises API calls and
// verifies notifications, so never import this from a client component.
//
// Docs: https://docs.midtrans.com/docs/snap-snap-integration-guide

export type MidtransConfig = {
  serverKey: string;
  snapUrl: string;
};

export function getMidtransConfig(): MidtransConfig | null {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return null;
  const production = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  return {
    serverKey,
    snapUrl: production
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
  };
}

/** Midtrans order_id. Random, so the /pembayaran/<ref> status page can't be enumerated. */
export function newMerchantRef(): string {
  return `CLC-${Date.now().toString(36).toUpperCase()}-${randomBytes(6).toString('hex').toUpperCase()}`;
}

/**
 * Midtrans signs each HTTP notification with
 * signature_key = SHA512(order_id + status_code + gross_amount + server_key),
 * using the fields exactly as sent (gross_amount is a string like "399000.00").
 */
export function isValidNotificationSignature(
  serverKey: string,
  n: { order_id?: unknown; status_code?: unknown; gross_amount?: unknown; signature_key?: unknown },
): boolean {
  if (
    typeof n.order_id !== 'string' ||
    typeof n.status_code !== 'string' ||
    typeof n.gross_amount !== 'string' ||
    typeof n.signature_key !== 'string'
  ) {
    return false;
  }
  const expected = createHash('sha512')
    .update(`${n.order_id}${n.status_code}${n.gross_amount}${serverKey}`)
    .digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(n.signature_key.trim().toLowerCase(), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Our own order states (public.orders.status), independent of the gateway's vocabulary. */
export type OrderStatus = 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND';

/**
 * Maps a Midtrans transaction_status (+ fraud_status for cards) onto our
 * order states. null means "no change" (still pending, a card under fraud
 * review, a partial refund, or something unknown).
 */
export function mapTransactionStatus(transactionStatus: unknown, fraudStatus?: unknown): OrderStatus | null {
  switch (transactionStatus) {
    case 'settlement':
      return 'PAID';
    case 'capture':
      return fraudStatus === 'accept' || fraudStatus === undefined ? 'PAID' : fraudStatus === 'deny' ? 'FAILED' : null;
    case 'expire':
      return 'EXPIRED';
    case 'deny':
    case 'cancel':
    case 'failure':
      return 'FAILED';
    case 'refund':
      return 'REFUND';
    default:
      return null;
  }
}

/** "399000.00" -> 399000. */
export function parseGrossAmount(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

// Labels for the receipt email and /admin/orders; payment_type as Midtrans sends it.
const PAYMENT_TYPE_LABELS: Record<string, string> = {
  qris: 'QRIS',
  gopay: 'GoPay',
  shopeepay: 'ShopeePay',
  bank_transfer: 'Virtual Account',
  echannel: 'Mandiri Bill',
  permata: 'Permata VA',
  credit_card: 'Kartu kredit',
  cstore: 'Alfamart / Indomaret',
  akulaku: 'Akulaku',
  kredivo: 'Kredivo',
};

export function paymentLabel(n: {
  payment_type?: unknown;
  va_numbers?: unknown;
  store?: unknown;
}): string | null {
  if (typeof n.payment_type !== 'string') return null;
  if (n.payment_type === 'bank_transfer' && Array.isArray(n.va_numbers)) {
    const bank = (n.va_numbers[0] as { bank?: unknown } | undefined)?.bank;
    if (typeof bank === 'string') return `${bank.toUpperCase()} Virtual Account`;
  }
  if (n.payment_type === 'cstore' && typeof n.store === 'string') {
    return n.store.charAt(0).toUpperCase() + n.store.slice(1);
  }
  return PAYMENT_TYPE_LABELS[n.payment_type] ?? n.payment_type;
}

export type CreateSnapInput = {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  item: { id: string; name: string; price: number };
  finishUrl: string;
  notificationUrl: string;
  expiryHours: number;
};

export type CreateSnapResult =
  | { ok: true; token: string; redirectUrl: string }
  | { ok: false; message: string };

export async function createSnapTransaction(
  config: MidtransConfig,
  input: CreateSnapInput,
): Promise<CreateSnapResult> {
  const body = {
    transaction_details: { order_id: input.orderId, gross_amount: input.amount },
    // Midtrans caps item names at 50 characters and rejects longer ones.
    item_details: [{ id: input.item.id.slice(0, 50), name: input.item.name.slice(0, 50), price: input.item.price, quantity: 1 }],
    customer_details: { first_name: input.customerName, email: input.customerEmail, phone: input.customerPhone },
    callbacks: { finish: input.finishUrl },
    expiry: { unit: 'hours', duration: input.expiryHours },
  };

  let res: Response;
  try {
    res = await fetch(config.snapUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${config.serverKey}:`).toString('base64')}`,
        // Per-transaction notification URL, so it works without (and wins
        // over) the one in the dashboard.
        'X-Override-Notification': input.notificationUrl,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
  } catch (err) {
    return { ok: false, message: `Midtrans unreachable: ${err instanceof Error ? err.message : String(err)}` };
  }

  const json = (await res.json().catch(() => null)) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
  } | null;

  if (!res.ok || !json?.token || !json.redirect_url) {
    return { ok: false, message: json?.error_messages?.join('; ') || `Midtrans HTTP ${res.status}` };
  }
  return { ok: true, token: json.token, redirectUrl: json.redirect_url };
}
