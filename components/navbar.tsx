'use client';

import Link from 'next/link';
import { Menu, X, ShoppingBag, Search, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SquiggleUnderline } from '@/components/SquiggleUnderline';
import { waLink } from '@/lib/links';
import { trackConversion } from '@/lib/analytics';

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

  // Close the mobile panel on route change (e.g. browser back) and lock
  // background scroll while it's open.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const links = [
    { href: '/', label: 'Beranda' },
    { href: '/toko', label: 'Toko' },
    { href: '/kursus', label: 'Kursus' },
    { href: '/tentang', label: 'Tentang Saya' },
  ];

  return (
    <nav data-site-chrome className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-cream/90 backdrop-blur-md border-b border-butter/40 shadow-sm' : 'bg-cream border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center min-w-0">
              <span className="font-hand text-2xl sm:text-3xl text-rust-ink truncate">Cece Lina Chang</span>
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
            <Link href="/toko" className="text-rust-ink hover:text-terracotta" aria-label="Toko">
              <ShoppingBag className="w-6 h-6" />
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('toko:open-search'))}
              aria-label="Cari produk atau kelas"
              className="text-rust-ink hover:text-terracotta"
            >
              <Search className="w-6 h-6" />
            </button>
            <Link
              href="/kursus"
              className="bg-terracotta text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-rust-ink transition-colors"
            >
              Daftar Kelas
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-1 md:hidden">
            <Link
              href="/kursus"
              className="tap-target flex items-center justify-center bg-terracotta text-white text-sm font-bold px-3 rounded-full hover:bg-rust-ink transition-colors"
            >
              Daftar Kelas
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('toko:open-search'))}
              aria-label="Cari produk atau kelas"
              className="tap-target flex items-center justify-center text-rust-ink hover:text-terracotta"
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
              className="tap-target inline-flex items-center justify-center rounded-md text-rust-ink hover:bg-butter/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div id="mobile-menu" className="md:hidden bg-cream border-b border-butter/40">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 tap-target rounded-md text-base font-medium ${
                  pathname === link.href
                    ? 'bg-butter/30 text-rust-ink'
                    : 'text-charcoal-brown/70 hover:bg-butter/20 hover:text-rust-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/toko"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 tap-target rounded-md text-base font-medium text-charcoal-brown/70 hover:bg-butter/20 hover:text-rust-ink"
            >
              <ShoppingBag className="w-5 h-5" /> Toko Alat Baking
            </Link>
            <a
              href={waLink('Halo Cece, aku mau tanya-tanya')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackConversion('whatsapp_open');
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-3 tap-target rounded-md text-base font-medium text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="w-5 h-5" /> Chat Cece via WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
