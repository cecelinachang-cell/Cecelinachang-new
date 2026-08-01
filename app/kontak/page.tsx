import { MessageCircle, Mail, MapPin, Send } from 'lucide-react';
import Faq from '@/components/Faq';

export default function KontakPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-24">
      <div className="text-center mb-10 sm:mb-16">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-rust-ink mb-4 sm:mb-6">Hubungi Saya</h1>
        <p className="text-base sm:text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
          Punya pertanyaan seputar resep, ingin konsultasi alat baking, atau butuh bantuan pendaftaran kelas? Jangan ragu untuk menghubungi saya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
        {/* Contact Info & WhatsApp */}
        <div className="flex flex-col justify-center">
          <div className="bg-butter/15 rounded-3xl p-6 sm:p-8 lg:p-12 border border-butter/30 mb-6 sm:mb-8">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-6 sm:mb-8">Cara Tercepat Menghubungi Kami</h2>

            <a
              href="https://wa.me/6281284250718"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full bg-green-500 hover:bg-green-600 text-white p-4 sm:p-6 rounded-2xl transition-colors shadow-md mb-6 sm:mb-8 group"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mr-4 sm:mr-6 shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="text-base sm:text-xl font-bold mb-1">Chat WhatsApp Admin</div>
                <div className="text-sm sm:text-base text-green-100">Respon cepat di jam kerja (09:00 - 17:00)</div>
              </div>
            </a>

            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-terracotta mr-4 shadow-sm flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-charcoal-brown mb-1">Email</div>
                  <a href="mailto:halo@cecelinachang.com" className="text-charcoal-brown/70 hover:text-terracotta transition-colors">halo@cecelinachang.com</a>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-terracotta mr-4 shadow-sm flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-charcoal-brown mb-1">Lokasi Pengiriman Toko</div>
                  <div className="text-charcoal-brown/70">Jakarta Barat, Indonesia<br/>(Hanya melayani pengiriman online)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg border border-butter/30">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-6 sm:mb-8">Kirim Pesan</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-charcoal-brown mb-2">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                className="w-full px-5 py-4 rounded-xl border border-butter/40 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent bg-butter/5"
                placeholder="Masukkan nama Anda"
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-charcoal-brown mb-2">Nomor WhatsApp</label>
              <input
                type="tel"
                id="whatsapp"
                className="w-full px-5 py-4 rounded-xl border border-butter/40 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent bg-butter/5"
                placeholder="Contoh: 0812xxxx"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-charcoal-brown mb-2">Pesan Anda</label>
              <textarea
                id="message"
                rows={5}
                className="w-full px-5 py-4 rounded-xl border border-butter/40 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent bg-butter/5 resize-none"
                placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
              ></textarea>
            </div>
            <button
              type="button"
              className="w-full flex justify-center items-center px-8 py-4 text-lg font-bold rounded-xl text-white bg-terracotta hover:bg-rust-ink transition-colors shadow-md"
            >
              <Send className="w-5 h-5 mr-3" /> Kirim Pesan
            </button>
            <p className="text-sm text-charcoal-brown/60 text-center mt-4">
              Kami akan membalas pesan Anda melalui WhatsApp secepatnya.
            </p>
          </form>
        </div>
      </div>

      <Faq categories={['general', 'shipping', 'course', 'refund']} />
    </div>
  );
}
