import Link from 'next/link';
import { Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-orange-900 text-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-serif text-2xl font-bold mb-4 block">Cece Lina Chang</span>
            <p className="text-orange-200 mb-6 max-w-sm">
              Belajar baking dari rumah dengan mudah. Misi saya adalah membantu ibu-ibu Indonesia menciptakan kebahagiaan dari dapur sendiri.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/cecelinachang" target="_blank" rel="noopener noreferrer" className="text-orange-200 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://tiktok.com/@lina_chang2" target="_blank" rel="noopener noreferrer" className="text-orange-200 hover:text-white transition-colors flex items-center justify-center w-6 h-6">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span className="sr-only">TikTok</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Menu Cepat</h3>
            <ul className="space-y-2">
              <li><Link href="/toko" className="text-orange-200 hover:text-white transition-colors">Toko Alat Masak</Link></li>
              <li><Link href="/kursus" className="text-orange-200 hover:text-white transition-colors">Kursus Online</Link></li>
              <li><Link href="/tentang" className="text-orange-200 hover:text-white transition-colors">Tentang Saya</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Bantuan</h3>
            <ul className="space-y-2">
              <li><Link href="/kontak" className="text-orange-200 hover:text-white transition-colors">Hubungi Saya</Link></li>
              <li><Link href="/kontak" className="text-orange-200 hover:text-white transition-colors">FAQ</Link></li>
              <li><a href="https://wa.me/6281284250718" target="_blank" rel="noopener noreferrer" className="text-orange-200 hover:text-white transition-colors">WhatsApp Admin</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-orange-800 mt-12 pt-8 text-center text-orange-300 text-sm">
          <p>&copy; {new Date().getFullYear()} Cece Lina Chang. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
