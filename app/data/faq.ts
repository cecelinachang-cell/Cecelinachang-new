import { POLICIES } from '@/lib/policies';

export type FaqCategory = 'general' | 'shipping' | 'course' | 'refund';

export interface FaqItem {
  q: string;
  a: string;
  category: FaqCategory;
}

export const faqs: FaqItem[] = [
  {
    q: 'Bagaimana cara membeli alat masak?',
    a: 'Sangat mudah! Anda tinggal klik tombol "Beli Sekarang" di halaman produk, lalu Anda akan langsung diarahkan ke WhatsApp admin kami untuk proses pemesanan tanpa perlu membuat akun.',
    category: 'general',
  },
  {
    q: 'Apakah pengiriman aman ke luar kota?',
    a: 'Tentu saja. Kami menggunakan bubble wrap tebal dan kardus khusus untuk memastikan loyang dan alat masak lainnya sampai dengan aman tanpa penyok.',
    category: 'shipping',
  },
  {
    q: 'Bagaimana cara ikut kelas online?',
    a: 'Pilih kelas yang Anda inginkan di halaman Kursus, klik "Daftar", dan admin kami akan membantu proses pendaftaran via WhatsApp. Setelah itu Anda akan mendapat link akses video.',
    category: 'course',
  },
  {
    q: 'Apakah resep di website ini gratis?',
    a: 'Ya, semua resep yang ada di halaman Resep bisa Anda akses secara gratis kapan saja.',
    category: 'general',
  },
  {
    q: 'Apakah kelas ini cocok untuk pemula yang belum pernah baking?',
    a: 'Sangat cocok! Semua materi dijelaskan dari nol, mulai dari pengenalan alat dan bahan hingga teknik dasar.',
    category: 'course',
  },
  {
    q: 'Bagaimana cara mengakses video kelasnya?',
    a: 'Setelah pembayaran, Anda akan diberikan link khusus dan password untuk menonton video kapan saja melalui HP atau laptop.',
    category: 'course',
  },
  {
    q: 'Apakah ada batas waktu untuk menonton video?',
    a: 'Tidak ada. Akses video berlaku seumur hidup. Anda bisa menonton ulang berkali-kali.',
    category: 'course',
  },
  {
    q: 'Kalau ada yang bingung, apakah bisa bertanya?',
    a: 'Tentu saja! Anda akan mendapatkan akses konsultasi langsung dengan cece lina chang untuk tanya jawab.',
    category: 'course',
  },
  {
    q: 'Apakah bisa mengembalikan produk yang sudah dibeli?',
    a: POLICIES.PRODUCT_RETURN,
    category: 'refund',
  },
  {
    q: 'Berapa lama garansi alat masaknya?',
    a: POLICIES.PRODUCT_WARRANTY,
    category: 'shipping',
  },
  {
    q: 'Apakah biaya kelas online bisa dikembalikan (refund)?',
    a: POLICIES.COURSE_REFUND,
    category: 'refund',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Pembayaran dilakukan via transfer bank, dikonfirmasi langsung oleh admin melalui WhatsApp setelah Anda checkout.',
    category: 'general',
  },
];
