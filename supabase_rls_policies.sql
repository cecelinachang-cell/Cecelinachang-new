-- Run this in the Supabase SQL Editor to close the security hole left by
-- supabase_schema.sql, which disabled RLS on every table for initial dev.
--
-- *** REQUIRED PRE-STEP — READ FIRST, OR YOU WILL LOCK YOURSELF OUT ***
-- The app code no longer has the hardcoded bypass password or the
-- email-string admin whitelist. Admin access now depends ENTIRELY on a
-- `public.users` row with role = 'admin'. Before running section 1 below:
--   1. In Supabase Dashboard -> Authentication -> Users, confirm the real
--      admin account(s) already exist (sign up normally if not), and copy
--      their UUID.
--   2. Run the INSERT in section 7 at the bottom FIRST, with that UUID,
--      while RLS is still off (so the insert isn't itself blocked).
--   3. Only then run sections 1-6 to enable RLS and add policies.
-- If you enable RLS before seeding an admin row, nobody -- including you --
-- can sign in to /admin, since login now requires role='admin' in the DB
-- and there is no more bypass.

-- 1. Re-enable RLS on every table.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- 2. Admin-check helper. SECURITY DEFINER so the client can call it without
-- needing direct SELECT access to other users' rows in `users`.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Public catalog tables: anyone can read, only admins can write.
CREATE POLICY "public can read items" ON public.items
  FOR SELECT USING (true);
CREATE POLICY "admin can insert items" ON public.items
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin can update items" ON public.items
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin can delete items" ON public.items
  FOR DELETE USING (public.is_admin());

CREATE POLICY "public can read courses" ON public.courses
  FOR SELECT USING (true);
CREATE POLICY "admin can insert courses" ON public.courses
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin can update courses" ON public.courses
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin can delete courses" ON public.courses
  FOR DELETE USING (public.is_admin());

CREATE POLICY "public can read testimonials" ON public.testimonials
  FOR SELECT USING (true);
CREATE POLICY "admin can insert testimonials" ON public.testimonials
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin can update testimonials" ON public.testimonials
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin can delete testimonials" ON public.testimonials
  FOR DELETE USING (public.is_admin());

-- 4. Settings: site config, not admin-write-safe to expose to anon. Public
-- pages read title/description/logo, so allow public SELECT; write is
-- admin-only.
CREATE POLICY "public can read settings" ON public.settings
  FOR SELECT USING (true);
CREATE POLICY "admin can write settings" ON public.settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Analytics tables: anon visitors write tracking events, only admins
-- read them back.
CREATE POLICY "anon can insert page_views" ON public.page_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin can read page_views" ON public.page_views
  FOR SELECT USING (public.is_admin());

CREATE POLICY "anon can insert clicks" ON public.clicks
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin can read clicks" ON public.clicks
  FOR SELECT USING (public.is_admin());

-- 6. Users table: a user can read their own row (needed for the client-side
-- role lookup in AuthContext); only admins can read everyone's.
CREATE POLICY "self can read own row" ON public.users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "admin can read all users" ON public.users
  FOR SELECT USING (public.is_admin());
CREATE POLICY "admin can write users" ON public.users
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Seed the real admin account(s). RUN THIS BEFORE SECTION 1 (see the
-- pre-step note at the top of this file) -- replace the UUID/email below
-- with the actual auth.users id for each admin.
-- INSERT INTO public.users (id, email, role)
-- VALUES ('<auth-user-uuid>', '<admin-email>', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
