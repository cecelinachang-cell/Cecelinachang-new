# Move the website off Supabase to Neon Postgres

**Why:** the Supabase project `yjxvrsmubrasvoipkwvn` is paused and can't be resumed while the org owes a $22.25 invoice. Since 26 Oct the site shows cover photos instead of testimonials, ad-form leads aren't saved server-side, and the admin is down. The decision (Bertrand, 4 Nov) is to move to Neon's free plan in one PR rather than pay.

**Data source:** the Supabase backups downloaded on 4 Nov:
- `db_cluster-26-10-2026@02-00-21.backup.gz`, a plain SQL cluster dump (PG 17)
- `yjxvrsmubrasvoipkwvn.storage.zip`, 30 files in bucket `admin-media`

Nothing written after 26 Oct exists anywhere. Leads from that window only reached WhatsApp, or are queued in visitors' browsers and get re-sent on their next visit once the API works again.

## Target stack (all $0)

| Need | Now | After |
|---|---|---|
| Database | Supabase Postgres via `supabase-js` (PostgREST) | **Neon Postgres** through the Vercel Marketplace, queried server-side with `@neondatabase/serverless` |
| Files | Supabase Storage `admin-media` | **Vercel Blob** for new admin uploads. The 30 migrated files ship as static files in `public/images/uploads/` (the Blob token is sensitive and can't be pulled locally), and their URLs are rewritten to those paths |
| Admin login | Supabase Auth (2 users, email + password, `users.role = admin`) | **One shared admin password** (approved by Bertrand, 4 Nov): (`ADMIN_PASSWORD` env) plus an HMAC-signed, httpOnly session cookie (`ADMIN_SESSION_SECRET`), checked in `middleware.ts` and in every admin API route |
| Browser-side queries | Client components call Supabase directly (RLS) | Neon can't be reached from the browser safely, so every read/write moves behind a **server route or server component** |

## Staying inside Neon Free (100 CU-hours/month, 5-min scale-to-zero, 1 GB)

Every query wakes the compute for at least 5 minutes. At the 0.25 CU minimum, the database can be awake about 400 hours a month, roughly 13 h/day. Woken all day, it runs out mid-month and suspends, which repeats the Supabase outage. So:
- **No per-visit writes** (approved by Bertrand, 4 Nov). Page-view, click and conversion tracking stop writing to the database. The Meta/TikTok pixels keep recording them; GA4 exists only on the unmerged `fix/lp-funnel` branch, so the admin dashboard has no new traffic numbers until that ships. The old analytics rows are loaded **read-only**, so the admin dashboard keeps its history.
- **Cached public reads.** Classes, products, settings and testimonials are read through Next's cache (`revalidate` of about 1 hour, plus on-demand revalidation when an admin saves). A visit doesn't wake the database; at most a few cache refreshes an hour do.
- **What still wakes it:** lead/contact submissions, the daily lead-reminder cron, cache refreshes, admin use.
- Check in Neon's usage page after the first week; target under 50 CU-h/month.

## Data to migrate

| Table | Rows | Keep? |
|---|---|---|
| leads | 166 | yes |
| testimonials | 3 | yes (imageUrl → Blob) |
| items | 84 | yes (image URLs → Blob) |
| courses | 8 | yes (image URLs → Blob) |
| settings | 5 | yes (hero/home images → Blob) |
| chatbot_knowledge | 3 | yes |
| clicks / conversions / page_views | 11,979 / 1,122 / 45,529 | yes, **read-only history** (about 10 MB). No new rows (see above) |
| customer_inquiries, purchases, certificates, course_modules, module_progress | 0 | schema only |
| users (public) / auth.users | 2 | **dropped** (replaced by the admin password) |

Only `public` schema tables are restored. Supabase roles, RLS policies, `auth` and `storage` schemas are not. Policies reference `auth.uid()`, which doesn't exist on Neon. Access control moves into the server routes.

## Scope by area

1. **DB layer** (`lib/db.ts`): a Neon client plus small typed query helpers per table. Delete `lib/supabase.ts`, `lib/supabase-admin.ts` and both `@supabase/*` deps.
2. **Public reads** (server-side): `lib/courses.ts`, `lib/products.ts`, `lib/settings.ts`, `lib/search.ts`, `app/tentang/page.tsx`, `app/layout.tsx`, `components/ProductDetail.tsx`. The static fallback catalog (`app/data/*`, `scripts/sync-fallback-catalog.ts`) keeps working, and the sync script reads Neon.
3. **Testimonials:** `GET /api/testimonials`, and `TestimonialCarousel` fetches it. The fallback stays as cover photos, used only if the API fails.
4. **Writes from the public site:** `app/api/leads/route.ts`, `app/api/contact/route.ts`, `app/api/cron/lead-reminders/route.ts`. **`/api/leads` must accept exactly the current request body**: leads sent since 26 Oct sit in visitors' localStorage and replay through `flushPendingLeads` only if the shape still matches. A test locks this. Analytics: `components/AnalyticsTracker.tsx` (database-only) is removed; `lib/analytics.ts` keeps firing the pixels and drops its database write.
5. **`next.config.ts`:** replace the Supabase host with `*.public.blob.vercel-storage.com` in `images.remotePatterns` and in any CSP header, or `next/image` rejects the migrated photos.
6. **Admin:** login, dashboard, leads, orders, testimonials, items, courses, settings, assets. Each page keeps its UI and swaps its Supabase calls for `fetch('/api/admin/...')`. Uploads go to Vercel Blob through `@vercel/blob` client uploads, with a token issued by an admin-only route.
7. **Midtrans checkout** (`app/api/checkout`, `app/api/midtrans/notification`, `app/pembayaran/[ref]`, `CheckoutModal`): **retired** (approved by Bertrand, 4 Nov). Lynk is the payment gateway now, Midtrans was never switched on, and it leans on Supabase Auth magic links for buyers. Its tables stay, so it can be rebuilt on Neon if ever needed.
8. **Tests:** update the tests that mock `supabase`. New tests cover the admin session cookie (sign/verify/expiry) and the testimonials and leads routes against a fake `sql` tag.

## Steps only Bertrand/Mama can do (accounts, terms, secrets)

1. In Vercel, team **cecelinachang-cells-projects** → project **cecelinachang-new** → **Storage** → **Create Database** → **Neon** (Free) → connect to Production, Preview and Development. This creates the Neon account and accepts its terms, and sets `DATABASE_URL`.
2. Same page → **Create** → **Blob** → connect to the project. This sets `BLOB_READ_WRITE_TOKEN`.
3. Project → Settings → Environment Variables: add `ADMIN_PASSWORD` (Mama's choice) and `ADMIN_SESSION_SECRET` (any long random string; Claude can generate one in a local file for you to paste).
4. On this Mac, run `vercel login` as the Mama account, then `vercel link` + `vercel env pull .env.local` in the repo, so Claude can restore the data and test against Neon locally.

## Cutover

0. **Rehearse the restore on local Postgres first.** Filter the cluster dump down to the `public` schema. Strip the `anon`/`authenticated`/`service_role` GRANTs, `CREATE POLICY`, `ALTER … OWNER`, publications, and any default or trigger that calls `auth.*` or `extensions.*`. Load it and check all 15 tables and their row counts. Delete the unpacked dump (it contains lead PII) when done; the originals in ~/Downloads stay as the rollback.
1. Restore the `public` schema and data into Neon from the dump. Copy the 30 storage files into `public/images/uploads/`, then rewrite their URLs in `testimonials`, `items`, `courses` and `settings`. **Done 4 Nov: counts match, 26 URLs rewritten.**
2. Open a PR. Check the Vercel preview against Neon: testimonials, a test lead from `/lp/bakso-sapi-premium` (deleted afterwards), admin login and the leads list, image upload, the cron route with its secret.
3. Merge, then remove the old `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY` env vars from Vercel.

**Rollback:** revert the merge commit. The Supabase project stays paused but restorable until 30 Nov 2027, and the backups stay in ~/Downloads.

## Out of scope

- The WhatsApp bot's Supabase project `xtjqqgwpikbyxvwccgqs` (same unpaid org).
- Paying or disputing the $22.25 invoice.

## Cutover commands (after the 4 user steps)

```bash
# in ~/.superset/projects/Cecelinachang-neon, after `vercel env pull .env.local`
set -a; . ./.env.local; set +a
python3 -I scripts/neon/filter-supabase-dump.py ~/Downloads/db_cluster-26-10-2026@02-00-21.backup > /tmp/public.sql   # from the gunzipped dump
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /tmp/public.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/neon/after-restore.sql
npx tsx scripts/neon/migrate-storage-to-repo.ts <unzipped storage backup dir> --dry-run
npx tsx scripts/neon/migrate-storage-to-repo.ts <unzipped storage backup dir>
rm /tmp/public.sql
```

Expected counts after the restore: leads 166, testimonials 3, items 84, courses 8, settings 5, chatbot_knowledge 3, clicks 11,979, conversions 1,122, page_views 45,529. Storage: 30 files; 26 database values point at them (items 10 across 2 rows, courses 8, settings 5, testimonials 3).
