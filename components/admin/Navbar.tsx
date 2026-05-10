'use client';

import { useAuth } from '@/context/AuthContext';
import { UserCircle, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-6">
      <div className="font-medium text-stone-600">
        Welcome back, Admin
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-stone-500">
          {user?.email}
        </div>
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
          <UserCircle className="w-6 h-6" />
        </div>
        <button 
          onClick={logout}
          className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
