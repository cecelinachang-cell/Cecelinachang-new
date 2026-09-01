'use client';

import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/admin/Sidebar';
import { Navbar } from '@/components/admin/Navbar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './admin.css';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarState, setSidebarState] = useState({ open: false, pathname });
  const sidebarOpen = sidebarState.pathname === pathname && sidebarState.open;
  const setSidebarOpen = (value: boolean | ((current: boolean) => boolean)) => {
    setSidebarState((current) => ({
      pathname,
      open: typeof value === 'function' ? value(current.pathname === pathname && current.open) : value,
    }));
  };

  useEffect(() => {
    document.body.classList.add('admin-mode');
    return () => document.body.classList.remove('admin-mode');
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } else if (pathname === '/admin/login') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, isAdmin, loading, router, pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // AuthProvider already wraps the complete application in app/layout.tsx.
  // Mounting a second provider here can race the same Supabase auth session
  // initialization and leave this gate permanently loading.
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
