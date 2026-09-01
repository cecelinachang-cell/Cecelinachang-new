'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { withTimeout } from '@/lib/withTimeout';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);

  const checkAdminStatus = async (currentUser: User): Promise<boolean> => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('users')
          .select('role')
          .eq('id', currentUser.id)
          .single(),
        10_000,
        'Admin role check timed out',
      );
      
      return !error && data?.role === 'admin';
    } catch (e) {
      console.error("checkAdminStatus error:", e);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // A stale GoTrue browser lock can leave getSession pending forever. Do not
    // keep the app (especially /admin) behind a permanent loading screen.
    withTimeout(
      supabase.auth.getSession(),
      10_000,
      'Supabase session check timed out',
    ).then(({ data: { session } }) => {
      if (!isMounted) return;
      const currentUser = session?.user || null;
      setAdminLoading(Boolean(currentUser));
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
      }
      setSessionLoading(false);
    }).catch((e) => {
      if (!isMounted) return;
      console.error("getSession error:", e);
      setUser(null);
      setIsAdmin(false);
      setAdminLoading(false);
      setSessionLoading(false);
    });

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!isMounted) return;
          const currentUser = session?.user || null;
          setAdminLoading(Boolean(currentUser));
          setUser(currentUser);
          if (!currentUser) {
            setIsAdmin(false);
          }
          setSessionLoading(false);
        }
      );

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } catch (e) {
      if (!isMounted) return;
      console.error("onAuthStateChange error:", e);
      window.setTimeout(() => {
        if (isMounted) setSessionLoading(false);
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    let isActive = true;

    checkAdminStatus(user)
      .then((admin) => {
        if (isActive) setIsAdmin(admin);
      })
      .finally(() => {
        if (isActive) setAdminLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) console.error('Error signing in with Google', error.message);
    } catch (error) {
      console.error('Error signing in with Google', error instanceof Error ? error.message : String(error));
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_bypass_user');
      }
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setAdminLoading(false);
    } catch (error) {
      console.error('Error signing out', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading: sessionLoading || adminLoading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
