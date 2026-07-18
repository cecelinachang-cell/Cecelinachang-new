'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Settings, LogOut, BookOpen, MessageSquareQuote, Image, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Banner & Assets', href: '/admin/assets', icon: Image },
    { name: 'Items', href: '/admin/items', icon: Package },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
    { name: 'Chatbot Knowledge', href: '/admin/chatbot-knowledge', icon: BrainCircuit },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-stone-900 text-stone-300 min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-orange-600 text-white' 
                  : 'hover:bg-stone-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
