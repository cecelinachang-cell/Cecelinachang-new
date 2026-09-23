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
  quizIntro: string;
  quiz: QuizQuestion[];
  resultNoPain: string;
  faq: { question: string; answer: string }[];
}

export const landingPages: Record<string, LandingCopy> = {
  'bakso-sapi-premium': {
    hook: 'Bakso bikinanmu keras kayak karet, pecah waktu direbus, atau malah rasa tepung?',
    subhook:
      'Bukan salah tanganmu. Yang kurang cuma teknik pabrik yang nggak pernah ditulis di resep gratisan.',
    ctaLabel: 'Cek kecocokanmu (30 detik)',
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

    quizIntro: 'Jawab 4 pertanyaan singkat. Cuma 30 detik.',
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
        question: 'Apakah kamu ingin bakso buatanmu kenyal & kaya rasa daging seperti bakso premium?',
        label: 'Ingin bakso kenyal & kaya rasa daging',
      },
      {
        question: 'Apakah kamu siap luangkan 40 menit untuk belajar tekniknya?',
        label: 'Siap belajar 40 menit',
      },
    ],
    resultNoPain:
      'Mungkin baksomu sudah lumayan — di kelas ini kamu belajar teknik standar pabrik yang bisa kamu ulang tiap kali masak.',

    faq: [
      {
        question: 'Saya pemula, bisa ikut?',
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
        answer:
          'Setelah daftar dan transfer lewat WhatsApp, Cece kirim link videonya (Google Drive) ke email kamu. Aksesnya seumur hidup, bisa ditonton ulang kapan saja.',
      },
    ],
  },
};

export function getLandingCopy(slug: string): LandingCopy | null {
  return landingPages[slug] ?? null;
}
