// Copy for the social-traffic landing pages at /lp/[slug]. One entry per
// course; adding a course's landing page is a data change, no code change.
//
// Every claim here must trace back to something the owner confirmed (see
// docs/superpowers/specs/2026-09-23-lp-bakso-landing-design.md, "Facts from
// the interview"). No invented numbers, urgency, discounts or guarantees.

export interface QuizQuestion {
  question: string;
  /** Short label saved with the lead, e.g. "Bakso keras/lembek/pecah". */
  label: string;
  /**
   * Set on questions that name a pain. A "yes" is echoed back on the result
   * screen and in the WhatsApp "Kendala saya" line. Commitment questions
   * ("siap belajar?") leave it unset.
   */
  pain?: string;
  /** A "yes" here means the visitor is a fit for the offline class upsell. */
  offlineFit?: boolean;
}

/** In-person class offered on the quiz result to visitors who fit it. From the owner's flyer. */
export interface OfflineClass {
  title: string;
  price: string;
  /** Value of the equipment included in the price. */
  equipmentValue: string;
  equipment: string[];
  learn: string[];
  perks: string[];
  duration: string;
  groupSize: string;
  location: string;
  /** Omit when there's no fixed date; the result then says to ask Cece. */
  schedule?: { label: string; startsAt: string };
  /** Why it's recommended, shown on the offline option. */
  fitReason: string;
}

export interface LandingCopy {
  hook: string;
  subhook: string;
  ctaLabel: string;
  /** YouTube id of the course preview shown in the hero; falls back to the course image. */
  previewVideoId?: string;
  /** Short facts shown under the hero video; the live student count is appended. */
  proofPoints: string[];
  painTitle: string;
  pains: string[];
  painClose: string;
  rootCauseTitle: string;
  rootCauseIntro: string;
  rootCauses: { title: string; body: string }[];
  rootCauseLine: string;
  story: {
    title: string;
    /** Paragraphs in Cece's own voice. Owner approves the wording before it ships. */
    paragraphs: string[];
    note: string;
  };
  beforeAfter: { before: string; after: string }[];
  benefitsNote: string;
  studentResults: string[];
  equipment: {
    title: string;
    answer: string;
    body: string;
    /** Product id from app/data/products.ts; recommended, never required. */
    recommendedProductId: string;
  };
  offerIncludes: string[];
  offerValueLine: string;
  offerRiskLine: string;
  /** "{count}" and "{price}" are filled in by lib/quizCopy.ts. */
  quizIntro: string;
  quiz: QuizQuestion[];
  resultNoPain: string;
  offlineClass?: OfflineClass;
  /**
   * Real WhatsApp screenshots from students (public/images/testimonials/<slug>/).
   * alt is a transcript, so the message is readable without the image.
   */
  testimonials: { src: string; alt: string; width: number; height: number }[];
  /** One short, verbatim student quote shown right above the quiz. */
  quizQuote?: { text: string; source: string };
  /** nearQuiz: also shown right above the quiz, where the last doubts come up. */
  faq: { question: string; answer: string; nearQuiz?: boolean }[];
}

export const landingPages: Record<string, LandingCopy> = {
  'bakso-sapi-premium': {
    hook: 'Bakso bikinanmu keras kayak karet, pecah waktu direbus, atau malah rasa tepung?',
    subhook:
      'Bukan salah tanganmu. Yang kurang cuma teknik pabrik yang nggak pernah ditulis di resep gratisan.',
    ctaLabel: 'Cek kecocokanmu (1 menit)',
    previewVideoId: 's80iBe2H6n8',
    proofPoints: ['18 tahun punya pabrik bakso', 'Puluhan ton per bulan'],

    painTitle: 'Kalau kamu pernah ngalamin ini…',
    pains: [
      'Baksonya keras, gampang hancur, atau pecah waktu direbus',
      'Rasanya malah rasa tepung, atau bau amis',
      'Bentuknya nggak bisa bulat rapi',
      'Daging sapi yang mahal akhirnya terbuang, atau dimakan sambil malu',
      'Nonton 10 video YouTube, dapat 10 takaran yang beda-beda',
    ],
    painClose:
      'Dan yang paling nggak enak: waktu disajikan ke keluarga, kamu sudah tahu duluan hasilnya nggak seperti yang kamu harapkan.',

    rootCauseTitle: 'Kenapa bakso rumahan sering gagal?',
    rootCauseIntro:
      'Di pabrik, ada tiga hal yang dijaga ketat setiap hari. Resep rumahan hampir nggak pernah menyebutnya.',
    rootCauses: [
      {
        title: 'Suhu daging & es',
        body: 'Daging yang terlalu hangat saat digiling bikin adonan nggak mau menyatu. Ujungnya keras atau pecah.',
      },
      {
        title: 'Waktu & cara menguleni',
        body: 'Kurang lama, bakso rapuh. Kelamaan atau caranya salah, teksturnya jadi alot kayak karet.',
      },
      {
        title: 'Suhu air rebusan',
        body: 'Air yang terlalu mendidih bikin permukaan bakso pecah dan bentuknya berantakan.',
      },
    ],
    rootCauseLine:
      'Resep gratis kasih takaran. Yang bikin bakso kenyal itu suhu, waktu, dan cara — bukan takarannya.',

    story: {
      title: 'Dari dapur pabrik, ke dapur rumahmu',
      paragraphs: [
        'Selama 18 tahun, dari 1998 sampai 2016, dapur saya bukan dapur rumahan. Kami memproduksi puluhan ton bakso setiap bulan. Setiap hari saya mengurus suhu daging, waktu uleni, dan panas air rebusan — bukan karena pengen sempurna, tapi karena satu batch gagal artinya kerugian besar.',
        'Tahun 2016 saya jatuh sakit. Di titik itu saya sadar, mengejar produksi dan uang bukan yang paling penting. Saya menutup pabriknya.',
        'Tapi ilmunya nggak ikut saya tutup. Terlalu sayang kalau hilang begitu saja. Sekarang teknik yang dulu cuma dipakai di dapur pabrik itu saya turunkan ke dapur rumah — punya kamu.',
      ],
      note: '18 tahun, sekarang giliran kamu :)',
    },

    beforeAfter: [
      { before: 'Bakso keras atau rapuh, hasilnya untung-untungan', after: 'Tahu cara bikin bakso kenyal & padat, dan kenapa' },
      { before: 'Pecah dan berantakan waktu direbus', after: 'Tahu cara merebus supaya tetap bulat & nggak pecah' },
      { before: 'Rasa tepung, dagingnya nggak terasa', after: 'Tahu cara bikin bumbu yang kaya rasa daging' },
      { before: 'Takaran beda-beda tiap nonton video', after: 'Satu cara yang bisa kamu ulang tiap kali masak' },
    ],
    benefitsNote: 'Standar yang sama yang saya pakai waktu produksi berton-ton.',
    studentResults: [
      'Ada murid yang berhasil di percobaan pertama setelah berkali-kali gagal.',
      'Ada juga yang sekarang jualan baksonya sendiri.',
    ],

    equipment: {
      title: 'Perlu mesin pabrik seperti punya Cece?',
      answer: 'Nggak perlu.',
      body: 'Food processor mulai 800 watt ke atas sudah cukup. Di kelas ini kamu belajar cara dapat tekstur ala pabrik pakai alat rumahan. Kalau mau yang Cece rekomendasikan, ada Signora Food Processor Dcopper (1000 watt) — tapi ini pilihan, bukan syarat.',
      recommendedProductId: 'food-processor-dcopper',
    },

    offerIncludes: [
      'Video 40 menit, akses seumur hidup',
      'Konsultasi langsung dengan Cece',
      'E-book resep (PDF)',
      'Sertifikat digital',
    ],
    offerValueLine: 'Teknik dari 18 tahun produksi, dipadatkan jadi 40 menit.',
    offerRiskLine: 'Bingung setelah beli? Konsultasi langsung dengan Cece sudah termasuk.',

    quizIntro:
      'Jawab {count} pertanyaan singkat, lalu isi nama, email & WhatsApp. Kurang dari 1 menit. Harga kelasnya {price}, akses seumur hidup.',
    quiz: [
      {
        question: 'Apakah baksomu sering keras, lembek, atau pecah?',
        label: 'Bakso keras/lembek/pecah',
        pain: 'baksonya sering keras, lembek, atau pecah',
      },
      {
        question: 'Apakah kamu sudah coba resep internet tapi hasilnya beda-beda terus?',
        label: 'Resep internet hasilnya beda-beda',
        pain: 'sudah coba resep internet tapi hasilnya beda-beda terus',
      },
      {
        question: 'Apakah kamu berencana jualan bakso?',
        label: 'Rencana jualan bakso',
        offlineFit: true,
      },
    ],
    resultNoPain:
      'Mungkin baksomu sudah lumayan — di kelas ini kamu belajar teknik standar pabrik yang bisa kamu ulang tiap kali masak.',

    offlineClass: {
      title: 'Kelas Offline Bakso Sapi',
      price: 'Rp 5.000.000',
      equipmentValue: 'Rp 4.454.000',
      equipment: [
        'Signora Food Processor',
        'Idealife Meat Grinder',
        'Gold Square Pan',
        'Rose Gold Strainer',
        'Gold Measuring Spoon',
      ],
      learn: [
        'Adonan bakso kenyal tanpa pengawet',
        'Kuah bakso sapi bening & gurih',
        'Teknik membentuk bakso bulat sempurna',
        'Tips menyimpan bakso agar tahan lama',
      ],
      perks: ['Bahan lengkap disediakan', 'Sertifikat', 'Bawa pulang hasil masakan'],
      duration: '3 jam',
      groupSize: 'maks. 5 orang',
      location: 'CeceLinaChang Store, Kota Tangerang',
      schedule: { label: 'Sabtu, 3 Okt 2026 · mulai 10.00', startsAt: '2026-10-03T10:00:00+07:00' },
      fitReason: 'Cocok buat yang mau jualan: praktik langsung bareng Cece, alatnya dibawa pulang.',
    },

    testimonials: [
      {
        src: '/images/testimonials/bakso-sapi-premium/wa-kenyel.jpg',
        width: 514,
        height: 800,
        alt: 'Foto satu wadah bakso buatan murid. Pesan: "Mantap baksonya cee... kenyel kenyel seperti yang saya mau. Baru nyoba langsung jatuh cinta."',
      },
      {
        src: '/images/testimonials/bakso-sapi-premium/wa-ayam-cucu.jpg',
        width: 489,
        height: 800,
        alt: 'Pesan WhatsApp: "Sore ce... Makasih ya resep baksonya. Pertama kali coba gagal, kemarin coba lagi... Mantap banget, cuma aku gak pake daging sapi tapi pake ayam. Pokoknya TOP banget lah. Maaf gak sempet posting... Begitu angkat langsung habis sama cucu. Makasih sekali lagi."',
      },
      {
        src: '/images/testimonials/bakso-sapi-premium/wa-berhasil-enak.jpg',
        width: 698,
        height: 700,
        alt: 'Foto semangkuk bakso buatan murid. Pesan: "Bakso nya berhasil ce, enak 👍"',
      },
    ],
    quizQuote: {
      text: 'Kenyel kenyel seperti yang saya mau… baru nyoba langsung jatuh cinta.',
      source: 'Murid kelas bakso, lewat WhatsApp',
    },

    faq: [
      {
        question: 'Saya pemula, bisa ikut?',
        nearQuiz: true,
        answer:
          'Bisa. Kelasnya dijelaskan dari dasar: suhu, cara menguleni, sampai merebus. Kalau ada yang bingung, kamu bisa konsultasi langsung dengan Cece.',
      },
      {
        question: 'Alat apa yang dibutuhkan?',
        answer:
          'Food processor mulai 800 watt ke atas. Signora Dcopper (1000 watt) direkomendasikan, tapi nggak wajib.',
      },
      {
        question: 'Bagaimana cara akses kelasnya?',
        nearQuiz: true,
        answer:
          'Setelah daftar dan transfer lewat WhatsApp, Cece kirim link videonya lewat Google Drive ke email kamu (paling lancar pakai Gmail). Aksesnya seumur hidup, bisa ditonton ulang kapan saja.',
      },
    ],
  },
};

export function getLandingCopy(slug: string): LandingCopy | null {
  return landingPages[slug] ?? null;
}
