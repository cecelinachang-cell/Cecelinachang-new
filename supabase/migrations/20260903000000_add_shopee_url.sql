-- Per-product Shopee link; NULL falls back to the shop-wide Shopee URL in the app.
ALTER TABLE public.items   ADD COLUMN IF NOT EXISTS "shopeeUrl" TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "shopeeUrl" TEXT;
