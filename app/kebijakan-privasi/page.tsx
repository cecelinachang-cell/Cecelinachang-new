import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Cece Lina Chang',
  description: 'Informasi tentang data dan cookie yang dipakai di cecelinachang.com.',
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-24">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-rust-ink mb-2">Kebijakan Privasi</h1>
      <p className="text-sm text-charcoal-brown/50 mb-10">Terakhir diperbarui: September 2026</p>

      <div className="space-y-8 text-charcoal-brown/80 leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Data apa yang kami simpan</h2>
          <p>
            Saat kamu mengisi form pendaftaran kelas, form kontak, atau chat dengan admin lewat WhatsApp,
            kami menyimpan nama, nomor WhatsApp, email, dan pesan yang kamu kirim. Data ini dipakai untuk
            menghubungimu balik soal kelas, pesanan, atau pertanyaanmu — tidak dijual atau dibagikan ke
            pihak lain di luar itu.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Cookie yang kami pakai</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-rust-ink">Cookie wajib.</strong> Dipakai untuk fitur login admin
              website. Tanpa ini beberapa fitur nggak akan jalan.
            </li>
            <li>
              <strong className="text-rust-ink">Cookie analitik &amp; iklan (TikTok Pixel, Meta Pixel).</strong>{' '}
              Membantu kami memahami halaman mana yang kamu kunjungi, dan menampilkan iklan kelas/produk
              yang lebih relevan buat kamu di TikTok dan Instagram/Facebook. Cookie ini diatur oleh
              TikTok dan Meta sesuai kebijakan privasi masing-masing.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Kontrol kamu</h2>
          <p>
            Kamu bisa menghapus atau memblokir cookie kapan saja lewat pengaturan browser. Ini bisa
            membuat beberapa bagian website (misalnya rekomendasi iklan yang relevan) jadi kurang akurat,
            tapi nggak menghalangi kamu untuk melihat kelas atau produk di sini.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-rust-ink mb-2">Pertanyaan?</h2>
          <p>
            Kalau ada pertanyaan soal data atau privasi, hubungi kami lewat halaman{' '}
            <a href="/kontak" className="text-terracotta font-semibold hover:text-rust-ink">Kontak</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
