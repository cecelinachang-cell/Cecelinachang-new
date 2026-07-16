'use client';

import Link from 'next/link';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SquiggleUnderline } from '@/components/SquiggleUnderline';

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
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-cream/90 backdrop-blur-md border-b border-butter/40 shadow-sm' : 'bg-cream border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-hand text-3xl text-rust-ink">Cece Lina Chang</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-base font-medium transition-colors hover:text-terracotta pb-1 ${
                  pathname === link.href ? 'text-rust-ink' : 'text-charcoal-brown/70'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <SquiggleUnderline className="absolute left-0 -bottom-0.5 w-full text-terracotta" />
                )}
              </Link>
            ))}
            <Link href="/toko" className="text-rust-ink hover:text-terracotta">
              <ShoppingBag className="w-6 h-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Link href="/toko" className="text-rust-ink hover:text-terracotta mr-4">
              <ShoppingBag className="w-6 h-6" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-rust-ink hover:bg-butter/20 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-cream border-b border-butter/40">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? 'bg-butter/30 text-rust-ink'
                    : 'text-charcoal-brown/70 hover:bg-butter/20 hover:text-rust-ink'
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
