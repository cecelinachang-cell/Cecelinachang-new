-- Script to create analytics tracking tables
-- Copy and paste this into your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  path TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  link_text TEXT,
  path TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security to allow tracking from public website
ALTER TABLE public.page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks DISABLE ROW LEVEL SECURITY;
