# Online course payments (Midtrans)

Course pages can take payment online through [Midtrans](https://midtrans.com), which is
part of GoTo and licensed by Bank Indonesia. An **Individu** account needs only the
owner's **KTP** and **NPWP**, plus a bank account in the same name. Since 2024 the NIK
on your KTP doubles as your personal NPWP. No NIB, SIUP or akta badan usaha is needed.

Buyers choose how to pay on the Midtrans page: QRIS, GoPay, ShopeePay, or a bank
virtual account (BRI, BNI, Permata, Mandiri Bill, plus BCA if Midtrans enables it for
your account). Individual accounts may not get card payments.

Midtrans changes its sign-up rules from time to time, so confirm the current document
list in the dashboard while you register.

## How it works

1. A buyer taps **Bayar Sekarang** on `/kursus/[slug]` and fills in their name, email
   and WhatsApp number (`components/CheckoutModal.tsx`).
2. `POST /api/checkout` looks up the price from the catalog (never from the browser),
   saves an `UNPAID` row in `public.orders` and creates a Midtrans Snap transaction.
   The buyer is then sent to the Midtrans payment page.
3. After paying, Midtrans sends the buyer back to `/pembayaran/<order-ref>`. That page
   refreshes itself until the payment is confirmed.
4. Midtrans calls `POST /api/midtrans/notification`. The route checks the SHA512
   `signature_key`, marks the order `PAID` (it ignores duplicate or out-of-order
   notifications), then emails the buyer a receipt and emails halo@cecelinachang.com
   an "order paid" notice.
5. Cece shares the Google Drive class with the buyer's email, then ticks
   **Akses dikirim** in `/admin/orders`.

WhatsApp sign-up stays available as a second button the whole time.

## Setup

1. **Register** at dashboard.midtrans.com as **Individu**, upload your KTP and enter your
   NPWP (your NIK), then add a bank account in your own name for payouts.
2. **Database:** run `supabase/migrations/20261010_course_orders.sql` in the Supabase SQL editor.
3. **Sandbox first:** switch the dashboard to Sandbox and copy the server key
   (Settings → Access Keys, starts with `SB-Mid-server-`) into Vercel env vars:
   - `MIDTRANS_SERVER_KEY`
   - `MIDTRANS_IS_PRODUCTION=false`
   - `NEXT_PUBLIC_PAYMENTS_ENABLED=true` (shows the button; it's a build-time variable, so redeploy afterwards)
   - `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` must already be set
4. **Notification URL:** checkout sends it with every transaction. Also set it in the
   dashboard (Settings → Payment → Notification URL) to
   `https://www.cecelinachang.com/api/midtrans/notification`. Use the `www` host: the
   apex domain redirects, and a redirected notification is lost.
5. **Test** a purchase in sandbox and pay it with the
   [Midtrans simulator](https://simulator.sandbox.midtrans.com). Check that the order
   turns `PAID` in `/admin/orders` and that both emails arrive.
6. **Go live:** once Midtrans approves the account, switch the dashboard to Production,
   use the production server key, set `MIDTRANS_IS_PRODUCTION=true`, set the
   notification URL again under Production, and redeploy.

Leave `NEXT_PUBLIC_PAYMENTS_ENABLED` unset to hide online payment again. The site falls
back to WhatsApp-only sign-up.
