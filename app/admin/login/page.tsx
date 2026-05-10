'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('signoratangerangclc@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!supabase) {
      setError('Supabase configuration is missing.');
      return;
    }

    setLoading(true);

    try {
      // Local Bypass for dev/testing when rate limits are hit
      if (
        (email === 'signoratangerangclc@gmail.com' || email === 'cecelinachang@gmail.com') && 
        password === 'HL121073'
      ) {
        const mockUser = {
          id: 'mock-admin-id-1234',
          email: email,
          role: 'admin',
        };
        localStorage.setItem('admin_bypass_user', JSON.stringify(mockUser));
        window.location.href = '/admin/dashboard';
        return;
      }

      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      let session = signInData?.session;

      if (signInErr) {
        if (
          (email === 'signoratangerangclc@gmail.com' || email === 'cecelinachang@gmail.com') &&
          signInErr.message.includes('Invalid login credentials')
        ) {
          // Attempt to register
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
          });
          if (signUpErr) {
            if (signUpErr.message.toLowerCase().includes('rate limit')) {
              throw new Error('Email rate limit exceeded. Please wait a bit or adjust rate limits in your Supabase Auth settings.');
            }
            throw signUpErr;
          }
          
          if (signUpData.user) {
            session = signUpData.session;
            
            // If session is null (needs confirmation), try to sign in again just in case
            if (!session) {
              const { data: retryData } = await supabase.auth.signInWithPassword({ email, password });
              if (retryData?.session) session = retryData.session;
            }

             const { error: insertErr } = await supabase.from('users').upsert({
               id: signUpData.user.id,
               email: email,
               role: 'admin',
               created_at: new Date().toISOString()
             });
             if (insertErr) {
               if (insertErr.message && (insertErr.message.includes('schema cache') || insertErr.message.includes('row-level security policy'))) {
                 console.warn('Supabase schema not initialized yet or RLS prevents creation, skipping admin user record creation.');
               } else {
                 console.error('Error creating admin user record', insertErr.message || insertErr);
               }
             }
          }
        } else {
          throw signInErr;
        }
      }

      if (!session) {
        const { data: sessionData } = await supabase.auth.getSession();
        session = sessionData.session;
      }

      const currentUser = session?.user;

      if (!currentUser) throw new Error("No user session found. Please check your credentials or verify your email.");

      let isAdminUser = email === 'signoratangerangclc@gmail.com' || email === 'cecelinachang@gmail.com';
      if (!isAdminUser) {
        const { data: userDoc, error: userDocErr } = await supabase.from('users').select('role').eq('id', currentUser.id).single();
        if (userDoc?.role === 'admin') isAdminUser = true;
      }

      if (isAdminUser) {
        router.push('/admin/dashboard');
      } else {
        await supabase.auth.signOut();
        setError('Access denied. Admin privileges required.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-stone-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-stone-900">Admin Login</h2>
          <p className="text-stone-500 mt-2">Sign in to access the dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="hidden">
            <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <Link href="/" className="text-stone-500 hover:text-orange-600 text-sm font-medium transition-colors">
            &larr; Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
