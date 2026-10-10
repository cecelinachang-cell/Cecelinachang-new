# Online course payments (Tripay)

Course pages can take payment online through [Tripay](https://tripay.co.id). Tripay was
picked because it lets an individual open a **Perorangan** merchant account
verified with just a **KTP** (plus a selfie and a bank account in the same name).
No NIB, SIUP or akta badan usaha is needed. Buyers can pay by QRIS, bank virtual
account (BCA, BRI, Mandiri, BNI, Permata) or e-wallet (DANA, ShopeePay, OVO).
Credit cards aren't offered to personal merchants.

Tripay changes its sign-up rules from time to time, so confirm the current
document list in the dashboard while you register.

## How it works

1. A buyer taps **Bayar Sekarang** on `/kursus/[slug]`, then fills in their name,
   email and WhatsApp number and picks a payment method (`components/CheckoutModal.tsx`).
2. `POST /api/checkout` looks up the price from the catalog (never from the browser),
   saves an `UNPAID` row in `public.orders` and creates a Tripay transaction. The buyer
   is then sent to Tripay's payment page.
3. After paying, Tripay sends the buyer back to `/pembayaran/<order-ref>`. That page
   refreshes itself until the payment is confirmed.
4. Tripay calls `POST /api/tripay/callback`. The route checks the HMAC signature,
   marks the order `PAID` (it ignores duplicate or out-of-order callbacks), then emails
   the buyer a receipt and emails halo@cecelinachang.com an "order paid" notice.
5. Cece shares the Google Drive class with the buyer's email, then ticks
   **Akses dikirim** in `/admin/orders`.

WhatsApp sign-up stays available as a second button the whole time.

## Setup

1. **Register** at tripay.co.id as **Perorangan**, upload your KTP and selfie, and add a
   bank account for payouts.
2. **Database:** run `supabase/migrations/20261010_course_orders.sql` in the Supabase SQL editor.
3. **Sandbox first:** copy the sandbox API key, private key and merchant code
   (Merchant → Simulator) into Vercel env vars:
   - `TRIPAY_API_KEY`, `TRIPAY_PRIVATE_KEY`, `TRIPAY_MERCHANT_CODE`
   - `TRIPAY_IS_PRODUCTION=false`
   - `NEXT_PUBLIC_TRIPAY_ENABLED=true` (shows the button; it's a build-time variable, so redeploy afterwards)
   - `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` must already be set
4. **Callback URL:** in the Tripay dashboard set it to
   `https://www.cecelinachang.com/api/tripay/callback`. Use the `www` host: the apex
   domain redirects, and a redirected callback is lost.
5. **Payment channels:** switch on every channel listed in `lib/paymentChannels.ts`
   (Merchant → Opsi Kanal Pembayaran). To offer fewer, remove them from that file.
6. **Test** a purchase in sandbox, then pay it with Tripay's simulator. Check that
   the order turns `PAID` in `/admin/orders` and that both emails arrive.
7. **Go live:** once Tripay approves the account, swap in the production keys, set
   `TRIPAY_IS_PRODUCTION=true` and redeploy.

Leave `NEXT_PUBLIC_TRIPAY_ENABLED` unset to hide online payment again. The site falls
back to WhatsApp-only sign-up.
