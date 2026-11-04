-- Run once on Neon after loading the filtered Supabase dump.
--
-- supabase/migrations/20260903000000_add_shopee_url.sql was never applied to
-- the old production database, so the admin item/course forms (which send
-- "shopeeUrl") failed there. Add the columns now.
ALTER TABLE public.items   ADD COLUMN IF NOT EXISTS "shopeeUrl" TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "shopeeUrl" TEXT;
