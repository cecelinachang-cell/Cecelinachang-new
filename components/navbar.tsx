'use client';

import Link from 'next/link';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/', label: 'Beranda' },
    { href: '/toko', label: 'Toko' },
    { href: '/kursus', label: 'Kursus' },
    { href: '/tentang', label: 'Tentang Saya' },
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-[#FFFBF5]/90 backdrop-blur-md border-b border-orange-100 shadow-sm' : 'bg-[#FFFBF5] border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-serif text-2xl font-bold text-orange-800">Cece Lina Chang</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition-colors hover:text-orange-600 ${
                  pathname === link.href ? 'text-orange-800 border-b-2 border-orange-800' : 'text-stone-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/toko" className="text-orange-800 hover:text-orange-600">
              <ShoppingBag className="w-6 h-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Link href="/toko" className="text-orange-800 hover:text-orange-600 mr-4">
              <ShoppingBag className="w-6 h-6" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-orange-800 hover:bg-orange-100 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#FFFBF5] border-b border-orange-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? 'bg-orange-100 text-orange-800'
                    : 'text-stone-600 hover:bg-orange-50 hover:text-orange-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
