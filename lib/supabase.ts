import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

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

// In the browser, use the cookie-backed client from @supabase/ssr so the
// session is visible to middleware.ts and the /admin routes can be enforced
// server-side. On the server (API routes), fall back to a plain stateless
// anon client.
export const supabase = typeof window === 'undefined'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createBrowserClient(supabaseUrl, supabaseAnonKey)

// Stateless anon client for public, unauthenticated reads (product catalog,
// search, etc.). Unlike `supabase` above, this never touches GoTrueClient's
// navigator.locks-based session init, so it can't hang if that lock is ever
// left stuck held by another tab/session. Use this instead of `supabase` for
// any client-side fetch that doesn't need the logged-in user's session.
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

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
