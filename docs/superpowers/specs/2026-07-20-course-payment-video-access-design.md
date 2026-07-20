# Course Payment & Video Access — Design Spec

## Context

`/kursus` currently sells courses via a WhatsApp handoff: buyer clicks "Chat Cece, Daftar Kelas," pays by manual bank transfer, and the admin manually sends a private link + password for video access. There is no real video player wired up (the play-button on the course detail page is decorative), no payment gateway, and no customer accounts — the site explicitly tells visitors "Tidak perlu membuat akun."

This spec replaces that manual flow with an online payment (Midtrans) that, on success, unlocks real course videos directly on the course detail page for the buyer.

## Goals

- Buyer pays online via Midtrans (QRIS, VA, e-wallet, cards) instead of WhatsApp + bank transfer.
- On successful payment, buyer gets lifetime access to that course's videos, watchable on `/kursus/[slug]`.
- Access is tied to buyer identity via email magic-link login (Supabase Auth), not a shareable secret link.
- Admin can manage per-module video content (title + Google Drive video URL) from the existing admin CMS.
- WhatsApp checkout is removed from the buy flow (Midtrans becomes the only purchase path).

## Out of scope

- Video hosting migration (stays on Google Drive, "anyone with the link" embeds — link-sharing leakage is accepted for now).
- Refunds/cancellations UI (handled manually by admin for now).
- Bundles/subscriptions — per-course lifetime purchase only.
- Mobile app / native player.

## Buyer flow

1. Visitor lands on `/kursus/[slug]`, sees pricing card with a "Beli Sekarang" (Buy Now) button (replaces WhatsApp CTA).
2. Clicking it prompts for email (simple inline field, no full signup).
3. Server creates a Midtrans Snap transaction for that course + email, returns a Snap token; client opens the Midtrans Snap popup.
4. Buyer completes payment in the popup (QRIS/VA/e-wallet/card).
5. Midtrans calls our server-to-server webhook on payment settlement. Webhook verifies signature, marks the order `paid`, creates/links a `purchases` row (email + course_id).
6. Server emails the buyer a Supabase magic link (passwordless login).
7. Buyer clicks the magic link → authenticated session → redirected back to `/kursus/[slug]`.
8. Page now detects the logged-in user owns this course and renders the real module list with playable Google Drive video embeds instead of the locked/placeholder module list.
9. A lightweight "Kelas Saya" (My Courses) page lists all courses the logged-in buyer has purchased, each linking to its detail page.

Returning buyers: they can revisit `/kursus/[slug]` any time, log in via magic link if their session expired, and immediately see their unlocked videos — no repurchase.

## Data model changes (Supabase)

New tables:

- **`purchases`**: `id, email, course_id, order_id (midtrans), status (pending/paid/failed), amount, created_at, paid_at`. RLS: a user can only read their own rows (matched by auth email).
- **`course_modules`**: `id, course_id, title, video_url (Google Drive), sort_order`. Replaces the current fake `modules` *count* field for display purposes; admin-editable. `courses.modules` (count) stays for list-page display but detail page prefers real modules when present.

Existing tables unaffected (`courses`, `users`, `testimonials`, `settings`).

RLS currently disabled repo-wide (dev-only, noted in `supabase_schema.sql`) — this spec turns RLS **on** for `purchases` specifically, since it gates paid content; other tables' RLS posture is unchanged (out of scope).

## New/changed routes

- `app/kursus/[slug]/page.tsx` — replace WhatsApp CTA with "Beli Sekarang"; render real modules with locked/unlocked state based on purchase check.
- `app/api/checkout/route.ts` (new) — creates Midtrans Snap transaction, returns token.
- `app/api/midtrans/webhook/route.ts` (new) — verifies Midtrans notification signature, updates `purchases`, triggers magic-link email.
- `app/kelas-saya/page.tsx` (new) — "My Courses" page, requires login, lists purchased courses.
- `app/admin/courses/[id]/modules/page.tsx` (new, or extend existing admin course editor) — CRUD for `course_modules`.

## Auth

Reuse Supabase Auth (already used for admin Google OAuth) but add **email magic link** (`signInWithOtp`) for customers — separate from the admin password/Google flow. No new provider setup needed beyond enabling email OTP in the Supabase project (default-available).

## Payment integration

- **Midtrans Snap** (sandbox first; production keys once the user's Midtrans merchant account is approved).
- Env vars: `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`.
- Server-side transaction creation only (never expose server key to client).
- Webhook signature verification per Midtrans docs (SHA512 of order_id + status_code + gross_amount + server_key).

## Video access gating

- Google Drive video URLs embedded via Drive's `/preview` iframe.
- Gating happens server-side on page render: `[slug]/page.tsx` checks the logged-in user's session email against `purchases` (status=paid, course_id=this course) before including real `video_url`s in the rendered HTML — unpurchased visitors never receive the Drive links in the page source, only locked placeholders.

## Error handling

- Checkout: if Snap transaction creation fails, show inline error, don't lose the buyer's email input.
- Webhook: verify signature; reject/ignore invalid requests; idempotent on `order_id` (re-deliveries don't double-create purchases).
- Magic link email failure: log server-side; buyer can request resend from a "didn't get the email?" link on a confirmation page.
- Module video missing/broken Drive link: admin CMS should validate URL format on save; rendered page falls back to "Video sedang diperbarui" message rather than a broken iframe.

## Testing / verification

- Sandbox Midtrans transaction end-to-end (test card/QRIS) confirms webhook fires and `purchases` row is created.
- Magic link email arrives and logs buyer in.
- Logged-in purchaser sees real modules + playable video on `/kursus/[slug]`; a non-purchaser (or logged-out) sees locked state only, and page source contains no Drive URLs for that course.
- `/kelas-saya` lists correct purchased courses only.
- Admin can add/edit/reorder modules and video URLs via CMS; changes reflect immediately (or after `revalidate = 60`).
