-- Security hardening: chatbot_knowledge was created with RLS DISABLED in
-- supabase_schema.sql and no later migration ever locked it down. That let
-- anyone holding the public anon key (shipped in the JS bundle) INSERT,
-- UPDATE, or DELETE knowledge entries — i.e. inject arbitrary text into the
-- chatbot's system prompt or deface answers shown to visitors.
--
-- Intended model: visitors read only published entries (the chatbot API
-- reads with the anon key); only admins write.

-- Keep is_admin() in place even if supabase_rls_policies.sql wasn't run.
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

ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read published knowledge" ON public.chatbot_knowledge;
CREATE POLICY "public can read published knowledge" ON public.chatbot_knowledge
  FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "admin can insert knowledge" ON public.chatbot_knowledge;
CREATE POLICY "admin can insert knowledge" ON public.chatbot_knowledge
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin can update knowledge" ON public.chatbot_knowledge;
CREATE POLICY "admin can update knowledge" ON public.chatbot_knowledge
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin can delete knowledge" ON public.chatbot_knowledge;
CREATE POLICY "admin can delete knowledge" ON public.chatbot_knowledge
  FOR DELETE USING (public.is_admin());

-- Defense in depth: supabase_schema.sql explicitly DISABLEd RLS on these
-- tables. Re-assert it here so a re-run of the schema file can't silently
-- reopen them (policies for these already exist in earlier migrations /
-- supabase_rls_policies.sql; ENABLE is idempotent).
ALTER TABLE public.customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
