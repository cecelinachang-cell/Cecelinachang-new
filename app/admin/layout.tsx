'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/admin/Sidebar';
import { Navbar } from '@/components/admin/Navbar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import './admin.css';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
