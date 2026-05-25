import { MessageCircle, Mail, MapPin, Send } from 'lucide-react';

export default function KontakPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-orange-900 mb-6">Hubungi Kami</h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Punya pertanyaan seputar resep, ingin konsultasi alat baking, atau butuh bantuan pendaftaran kelas? Jangan ragu untuk menghubungi tim kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info & WhatsApp */}
        <div className="flex flex-col justify-center">
          <div className="bg-orange-50 rounded-3xl p-8 sm:p-12 border border-orange-100 mb-8">
            <h2 className="font-serif text-2xl font-bold text-orange-900 mb-8">Cara Tercepat Menghubungi Kami</h2>
            
            <a
              href="https://wa.me/6281284250718"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full bg-green-500 hover:bg-green-600 text-white p-6 rounded-2xl transition-colors shadow-md mb-8 group"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xl font-bold mb-1">Chat WhatsApp Admin</div>
                <div className="text-green-100">Respon cepat di jam kerja (09:00 - 17:00)</div>
              </div>
            </a>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-600 mr-4 shadow-sm flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-stone-800 mb-1">Email</div>
                  <a href="mailto:halo@cecelinachang.com" className="text-stone-600 hover:text-orange-600 transition-colors">halo@cecelinachang.com</a>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-600 mr-4 shadow-sm flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-stone-800 mb-1">Lokasi Pengiriman Toko</div>
                  <div className="text-stone-600">Jakarta Barat, Indonesia<br/>(Hanya melayani pengiriman online)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-stone-100">
          <h2 className="font-serif text-2xl font-bold text-orange-900 mb-8">Kirim Pesan</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-stone-50"
                placeholder="Masukkan nama Anda"
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-stone-700 mb-2">Nomor WhatsApp</label>
              <input
                type="tel"
                id="whatsapp"
                className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-stone-50"
                placeholder="Contoh: 0812xxxx"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">Pesan Anda</label>
              <textarea
                id="message"
                rows={5}
                className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-stone-50 resize-none"
                placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
              ></textarea>
            </div>
            <button
              type="button"
              className="w-full flex justify-center items-center px-8 py-4 text-lg font-bold rounded-xl text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md"
            >
              <Send className="w-5 h-5 mr-3" /> Kirim Pesan
            </button>
            <p className="text-sm text-stone-500 text-center mt-4">
              Kami akan membalas pesan Anda melalui WhatsApp secepatnya.
            </p>
          </form>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-24 max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-orange-900 mb-12 text-center">Pertanyaan yang Sering Diajukan (FAQ)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { q: 'Bagaimana cara membeli alat masak?', a: 'Sangat mudah! Anda tinggal klik tombol "Beli Sekarang" di halaman produk, lalu Anda akan langsung diarahkan ke WhatsApp admin kami untuk proses pemesanan tanpa perlu membuat akun.' },
            { q: 'Apakah pengiriman aman ke luar kota?', a: 'Tentu saja. Kami menggunakan bubble wrap tebal dan kardus khusus untuk memastikan loyang dan alat masak lainnya sampai dengan aman tanpa penyok.' },
            { q: 'Bagaimana cara ikut kelas online?', a: 'Pilih kelas yang Anda inginkan di halaman Kursus, klik "Daftar", dan admin kami akan membantu proses pendaftaran via WhatsApp. Setelah itu Anda akan mendapat link akses video.' },
            { q: 'Apakah resep di website ini gratis?', a: 'Ya, semua resep yang ada di halaman Resep bisa Anda akses secara gratis kapan saja.' }
          ].map((faq, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100">
              <h3 className="font-bold text-lg text-stone-800 mb-3">{faq.q}</h3>
              <p className="text-stone-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
