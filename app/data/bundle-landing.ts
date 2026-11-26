import type { PreviewVideo } from '@/components/landing/SelfHostedPreview';
import type { ClassBundle } from '@/lib/bundles';

/**
 * Copy for a bundle's own landing page (components/landing/BundleLandingBody.tsx),
 * the plain layout: large text, one pay button, nothing to work out.
 *
 * Same rule as app/data/landing-pages.ts: every line repeats a fact from the
 * class catalogue, the Lynk product or the guarantee in lib/bundles.ts.
 * Prices, class names and video lengths are NOT typed here; the page reads
 * them from the live catalogue.
 */
export interface BundleLandingCopy {
  bundleKey: ClassBundle['key'];
  hook: string;
  /** One or two short sentences under the headline. */
  what: string;
  /** Shown right after the price. */
  priceNote: string;
  /** What happens after "Bayar Sekarang", in the order the buyer meets it. */
  steps: string[];
  stepsHelp: string;
  /** Besides the videos themselves. */
  includes: string[];
  /** Self-hosted vertical video, small enough for a phone. */
  previewVideo?: PreviewVideo;
  /** The refund question is added by the page from the bundle's guarantee. */
  faq: { question: string; answer: string }[];
}

export const bundleLandingPages: Record<string, BundleLandingCopy> = {
  // /lp/semua-kelas, for the "S1-semua-kelas" ad (26 Nov 2026).
  'semua-kelas': {
    bundleKey: 'semua',
    hook: '8 kelas masak Cece dalam 1 paket.',
    what: 'Semua kelas online Cece, dari bakso sampai lapis legit. Videonya ditonton di HP dari rumah, boleh diulang-ulang.',
    priceNote: 'Sekali bayar. Akses seumur hidup.',
    steps: [
      'Klik "Bayar Sekarang". Isi nama, email, dan nomor WhatsApp, lalu tulis alamat Gmail kamu (yang belakangnya @gmail.com).',
      'Pilih cara bayar: QRIS, e-wallet, atau transfer bank (Virtual Account). Ada biaya admin kecil dari cara bayarnya.',
      'Ke-8 kelas langsung masuk ke Gmail kamu lewat Google Drive. Buka pakai Gmail yang sama, tonton kapan saja.',
    ],
    stepsHelp: 'Belum punya Gmail atau bingung caranya? Klik "Tanya Cece dulu lewat WhatsApp", nanti dibantu.',
    includes: ['E-book resep (PDF) untuk tiap kelas', 'Konsultasi langsung dengan Cece lewat WhatsApp'],
    // Web copy of the S1 ad video without its price card (the page shows the
    // price itself): Cece's own voice over clips from five of her reels.
    previewVideo: {
      src: '/videos/semua-kelas-cece.mp4',
      poster: '/videos/semua-kelas-cece.jpg',
      label: 'Tonton: kelas-kelas masak Cece',
    },
    faq: [
      {
        question: 'Saya pemula, bisa ikut?',
        answer:
          'Bisa. Videonya boleh diulang kapan saja, dan kalau ada yang bingung kamu bisa konsultasi langsung dengan Cece lewat WhatsApp.',
      },
      {
        question: 'Harus selesai dalam waktu tertentu?',
        answer:
          'Tidak. Aksesnya seumur hidup, jadi boleh mulai dari kelas mana saja dan ditonton pelan-pelan. Yang ada batas waktunya hanya garansi: 30 hari sejak beli.',
      },
      {
        question: 'Saya sudah punya salah satu kelasnya, gimana?',
        answer:
          'Tanya Cece dulu lewat WhatsApp sebelum bayar, supaya dicek kelas mana yang sudah kamu punya.',
      },
      {
        question: 'Saya nggak punya Gmail, gimana?',
        answer:
          'Akses kelasnya lewat Google Drive, jadi perlu alamat Gmail (yang belakangnya @gmail.com). HP Android biasanya sudah punya Gmail. Kalau bingung, klik "Tanya Cece dulu lewat WhatsApp", nanti dibantu.',
      },
      {
        question: 'Sudah bayar tapi kelasnya belum masuk?',
        answer:
          'Cek dulu folder Spam atau Promosi di Gmail kamu, dan pastikan kamu buka pakai Gmail yang sama dengan yang ditulis waktu bayar. Kalau masih belum ada, kirim bukti bayarnya ke WhatsApp Cece, nanti dicek.',
      },
    ],
  },
};

export function getBundleLanding(slug: string): BundleLandingCopy | null {
  return bundleLandingPages[slug] ?? null;
}
