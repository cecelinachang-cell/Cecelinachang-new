-- Run in Supabase SQL Editor after supabase_rls_policies.sql (needs public.is_admin()).
-- Bucket `admin-media` was already created via the Storage REST API (public: true).

CREATE POLICY "public read admin-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'admin-media');

CREATE POLICY "admin insert admin-media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'admin-media' AND public.is_admin());

CREATE POLICY "admin update admin-media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'admin-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'admin-media' AND public.is_admin());

CREATE POLICY "admin delete admin-media" ON storage.objects
  FOR DELETE USING (bucket_id = 'admin-media' AND public.is_admin());
