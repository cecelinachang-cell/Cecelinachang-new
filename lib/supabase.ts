import { createClient } from '@supabase/supabase-js'

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = rawSupabaseUrl && isValidHttpUrl(rawSupabaseUrl) ? rawSupabaseUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = (): boolean => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return false;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url.includes('placeholder') || url.includes('YOUR_SUPABASE') || url === '') {
    return false;
  }
  if (key.includes('placeholder') || key.includes('YOUR_SUPABASE') || key === '') {
    return false;
  }
  return true;
};
