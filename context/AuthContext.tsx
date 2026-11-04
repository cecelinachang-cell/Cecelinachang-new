'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { withTimeout } from '@/lib/withTimeout';

// Admin access is one shared password (see lib/adminSession.ts), so there is
// no per-person account: an admin session shows up as this fixed user.
interface AdminUser {
  email: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  /** Re-reads the session cookie, e.g. right after a successful login. */
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const ADMIN_USER: AdminUser = { email: 'Admin' };

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  refresh: async () => false,
  logout: async () => {},
});

async function fetchIsAdmin(): Promise<boolean> {
  try {
    const res = await withTimeout(fetch('/api/admin/session', { cache: 'no-store' }), 10_000, 'Admin session check timed out');
    if (!res.ok) return false;
    const body = (await res.json()) as { isAdmin?: boolean };
    return body.isAdmin === true;
  } catch (e) {
    console.error('Admin session check failed:', e);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Only the admin area needs the session; public pages skip the request.
  const inAdmin = pathname?.startsWith('/admin') ?? false;
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const admin = await fetchIsAdmin();
    setIsAdmin(admin);
    setLoading(false);
    return admin;
  }, []);

  useEffect(() => {
    if (!inAdmin) return;
    let active = true;
    fetchIsAdmin().then((admin) => {
      if (!active) return;
      setIsAdmin(admin);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [inAdmin]);

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error signing out', error instanceof Error ? error.message : String(error));
    }
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ user: isAdmin ? ADMIN_USER : null, isAdmin, loading: inAdmin && loading, refresh, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
