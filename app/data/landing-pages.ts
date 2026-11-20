import type { PreviewVideo } from '@/components/landing/SelfHostedPreview';
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
  /** Self-hosted vertical video for the hero. Wins over previewVideoId. */
  previewVideo?: PreviewVideo;
  /** Short facts shown under the hero video; the live student count is appended. */
  proofPoints: string[];
  /**
   * One line under the first button. Says what happens after Daftar, using
   * only the steps the form and FAQ already promise.
   */
  heroNext: string;
  /**
   * Numbered "cara daftar" steps under the first button. Replaces heroNext
   * when set: most buyers are 45+ and the Gmail step was easy to miss.
   */
  heroSteps?: string[];
  /** One help line under the steps. */
  heroStepsHelp?: string;
  /** Split-test arm B only (lib/lpSplit.ts): who teaches it, one line under the headline. */
  heroTrustLine?: string;
  /** Split-test arm B only: a short verbatim student quote under the first button. */
  heroTestimonial?: { text: string; source: string };
  /**
   * Headline that matches the ad the visitor came from. If utm_content (the
   * ad name) contains `match`, middleware.ts serves /lp/[slug]/v/[key] with
   * this hook. Same rule as everything here: confirmed facts only.
   */
  adVariants?: { key: string; match: string; hook: string; subhook?: string }[];
  /** Syllabus heading, the "materi yang didapatkan" block. */
  materiTitle: string;
  whyTitle: string;
  /** Reasons to join. Every line has to be a fact already on this page. */
  why: string[];
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
  /** The plain page for women 40-60 (arm C, `?lp=c`). Leave unset for no plain page. */
  plain?: PlainCopy;
  /**
   * A money-back guarantee the owner approved for this class. When set, it
   * is shown next to the price and replaces the "no refund" FAQ answer.
   */
  guarantee?: CourseGuarantee;
  /** A bonus class with a real end date. Hidden automatically after `endsAt`. */
  bonus?: CourseBonus;
}

export interface CourseGuarantee {
  title: string;
  /** The full terms, in the buyer's words. Also the answer to the refund question. */
  body: string;
  /** One line for the first screen. */
  short: string;
}

export interface CourseBonus {
  title: string;
  body: string;
  /** ISO time with offset. The bonus disappears from the page after this. */
  endsAt: string;
}

/** The bonus, or null once its end date has passed. */
export function activeBonus(bonus: CourseBonus | undefined, now: Date = new Date()): CourseBonus | null {
  if (!bonus) return null;
  return now.getTime() <= new Date(bonus.endsAt).getTime() ? bonus : null;
}

/**
 * Copy for the plain page (components/landing/PlainLandingBody.tsx): one
 * short screen that says what the class is, what it costs and what happens
 * after the button, in large plain text. Same rule as the rest of this file:
 * every line repeats a fact already confirmed elsewhere on the page or on
 * the Lynk checkout form.
 */
export interface PlainCopy {
  /** What the class is, in one or two short sentences under the headline. */
  what: string;
  /** Shown right after the price, e.g. "Sekali bayar. Akses seumur hidup." */
  priceNote: string;
  /** What happens after "Bayar Sekarang", in the order the buyer meets it. */
  steps: string[];
  /** Questions from `faq`, by their exact text, in the order to show them. */
  faqQuestions: string[];
}

/**
 * A shorter, photo-led page (components/landing/ShortLandingBody.tsx): hero,
 * student photos, Cece's tips, what you learn, tools, price, FAQ. No quiz,
 * no long story. For courses where the long page's sections (pains, factory
 * story, before/after) would need facts nobody has confirmed yet.
 *
 * Text that still needs the owner's answer is written as "[CEK] …" and
 * shown highlighted on the page, so it can't slip through unnoticed.
 */
export interface ShortLandingCopy
  extends Pick<
    LandingCopy,
    | 'hook'
    | 'subhook'
    | 'previewVideoId'
    | 'previewVideo'
    | 'proofPoints'
    | 'heroNext'
    | 'heroSteps'
    | 'heroStepsHelp'
    | 'adVariants'
    | 'testimonials'
    | 'offerIncludes'
    | 'offerRiskLine'
    | 'faq'
  > {
  layout: 'short';
  /** A short verbatim student quote under the hero's subhook. */
  heroQuote?: { text: string; source: string };
  /** Heading and one line above the student photos. */
  proofTitle: string;
  proofIntro: string;
  /** Short tips in Cece's own words (from her videos), numbered. */
  tips: {
    title: string;
    intro: string;
    items: { title: string; body: string }[];
    /** Something Cece says, shown handwritten under the tips. */
    quote?: string;
  };
  materiTitle: string;
  whyTitle: string;
  why: string[];
  tools: {
    title: string;
    intro: string;
    items: { name: string; note: string }[];
    note?: string;
  };
}

export type AnyLandingCopy = LandingCopy | ShortLandingCopy;

export function isShortLanding(copy: AnyLandingCopy): copy is ShortLandingCopy {
  return (copy as ShortLandingCopy).layout === 'short';
}

/** True when the page has a plain version (arm C). Short pages never do. */
export function hasPlainPage(copy: AnyLandingCopy | null | undefined): copy is LandingCopy & { plain: PlainCopy } {
  return Boolean(copy && !isShortLanding(copy) && copy.plain);
}

export const landingPages: Record<string, AnyLandingCopy> = {
  'bakso-sapi-premium': {
    hook: 'Bakso bikinanmu keras kayak karet, pecah waktu direbus, atau malah rasa tepung?',
    subhook:
      'Nggak harus jago dulu. Bukan salah tanganmu. Yang kurang cuma teknik pabrik yang nggak pernah ditulis di resep gratisan.',
    ctaLabel: 'Daftar kelasnya',
    materiTitle: 'Materi yang didapatkan',
    whyTitle: 'Kenapa ikut kelas ini',
    why: [
      'Nggak harus jago dulu. Dijelaskan dari dasar: suhu daging, cara menguleni, sampai merebus.',
      'Video 40 menit, ditonton kapan saja. Tidak harus standby di jam tertentu. Akses seumur hidup.',
      'Ini kelas video, bukan cuma resep tulisan. E-book resep dan konsultasi dengan Cece sudah termasuk.',
      'Bisa untuk keluarga. Ada murid yang berhasil di percobaan pertama, ada yang sekarang jualan baksonya sendiri.',
    ],
    // The YouTube preview (s80iBe2H6n8) was removed by the uploader on YouTube; self-hosted since 5 Nov 2026.
    previewVideo: {
      src: '/videos/bakso-kenapa-ikut-kelas.mp4',
      poster: '/videos/bakso-kenapa-ikut-kelas.jpg',
      label: 'Tonton: kenapa belajar bakso dengan Cece',
    },
    proofPoints: ['18 tahun punya pabrik bakso', 'Puluhan ton per bulan'],
    heroNext:
      'Bayar lewat QRIS, e-wallet, atau Virtual Account. Akses kelas langsung masuk ke Gmail kamu, tanpa menunggu admin.',
    // Lynk adds its payment fee after the buyer picks a method (QRIS +Rp 3.493
    // on 14 Nov 2026), so the total is named here before it surprises anyone.
    heroSteps: [
      'Klik "Bayar Sekarang", lalu pilih cara bayar: QRIS, e-wallet, atau Virtual Account. Ada biaya admin kecil dari cara bayarnya, untuk QRIS sekitar Rp 3.500.',
      'Tulis alamat Gmail kamu (yang belakangnya @gmail.com) di formulir pembayaran.',
      'Link kelas langsung masuk ke Gmail kamu lewat Google Drive. Buka pakai Gmail yang sama, tonton kapan saja, akses seumur hidup.',
    ],
    heroStepsHelp: 'Belum punya Gmail atau bingung caranya? Klik "Tanya Cece", nanti dibantu lewat WhatsApp.',
    heroTrustLine: 'Diajarin langsung sama Cece, yang 18 tahun punya pabrik bakso (1998–2016).',
    // Verbatim from wa-ayam-cucu.jpg (shown in full further down the page).
    heroTestimonial: {
      text: 'Pertama kali coba gagal, kemarin coba lagi… Mantap banget… Begitu angkat langsung habis sama cucu.',
      source: 'Murid kelas bakso, lewat WhatsApp',
    },
    // The plain page (arm C, ?lp=c), for women 40-60 coming from a video ad.
    // "40 menit", "diulang", "seumur hidup" and "buat cucu / jualan" are the
    // facts above; the steps follow the Lynk form as it was on 18 Nov 2026
    // (email, name, phone, then the Gmail question, then the payment method).
    plain: {
      what: 'Kelas video 40 menit, 3 resep: bakso sapi, bakso urat, dan tahu bakso. Ditonton di HP dari rumah, boleh diulang-ulang. Buat keluarga, buat cucu, atau buat jualan juga bisa.',
      priceNote: 'Sekali bayar. Akses seumur hidup.',
      steps: [
        'Klik "Bayar Sekarang". Isi nama, email, dan nomor WhatsApp, lalu tulis alamat Gmail kamu (yang belakangnya @gmail.com).',
        'Pilih cara bayar: QRIS, e-wallet, atau transfer bank (Virtual Account). Ada biaya admin kecil dari cara bayarnya, untuk QRIS sekitar Rp 3.500.',
        'Kelas langsung masuk ke Gmail kamu lewat Google Drive. Buka pakai Gmail yang sama, tonton kapan saja.',
      ],
      faqQuestions: [
        'Kalau baksonya gagal gimana?',
        'Resep apa aja yang diajarin?',
        'Saya pemula, bisa ikut?',
        'Berapa lama bikinnya?',
        'Diajarin bikin kuahnya juga?',
        'Alat apa yang dibutuhkan?',
        'Saya nggak punya Gmail, gimana?',
        'Sudah bayar tapi kelasnya belum masuk?',
      ],
    },
    // Ad names in Meta: "A-reel-kenyal", "B-pabrik-18th", "F1-ibu-kenyal" (Nov 2026
    // sales campaign). First match wins, so "ibu" comes before "kenyal": the
    // F1 ad is the Facebook-only one for women 40-65 and its text promises
    // "diajarin pelan-pelan" and a video you can rewatch.
    adVariants: [
      {
        key: 'ibu',
        match: 'ibu',
        hook: 'Resep bakso pabrik 18 tahun, diajarin pelan-pelan sampai kenyal.',
        subhook:
          'Kelasnya video, ditonton di rumah, diulang-ulang juga boleh. Buat keluarga, buat cucu, atau buat jualan juga bisa.',
      },
      {
        key: 'pabrik',
        match: 'pabrik',
        hook: 'Resep bakso pabrik 18 tahun, sekarang bisa kamu bikin di rumah.',
        subhook:
          'Teknik yang dulu cuma dipakai di dapur pabrik, sekarang Cece ajarin pakai alat rumahan. Nggak harus jago dulu.',
      },
      {
        key: 'kenyal',
        match: 'kenyal',
        hook: 'Bakso kenyal ala pabrik, dari dapur rumahmu sendiri.',
      },
    ],

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

    // The bigger offer Cece approved on 19 Nov 2026 (CLC-System/bakso-offer-dec-2026.md),
    // put live early on 20 Nov at the same Rp 499.000. Facts from Cece: the
    // video teaches 3 recipes (bakso sapi, bakso urat, tahu bakso); the
    // large-print recipe card is in the class Drive folder since 19 Nov; she
    // checks students' photos and helps with Gmail/Drive herself; live Q&A
    // Sunday 19.00 WIB every 2 weeks from 13 Dec 2026.
    offerIncludes: [
      '3 resep dalam 1 kelas: bakso sapi, bakso urat, dan tahu bakso',
      'Video 40 menit, ditonton di HP, akses seumur hidup',
      'E-book resep dan kartu resep huruf besar, tinggal cetak',
      'Klinik Bakso: kirim foto baksomu ke WhatsApp Cece, nanti Cece kasih tahu salahnya di mana',
      'Tanya jawab live bareng Cece tiap 2 minggu, Minggu jam 19.00 WIB',
      'Dibantu Cece sendiri kalau bingung buka kelasnya di Gmail atau Google Drive',
      'Sertifikat digital',
    ],
    offerValueLine: 'Teknik dari 18 tahun produksi, dipadatkan jadi 40 menit. Dari mulai sampai bakso matang paling lama 3 jam.',
    offerRiskLine: 'Bingung setelah beli? Chat Cece di WhatsApp, konsultasi sudah termasuk.',
    guarantee: {
      title: 'Garansi Bakso Kenyal',
      body: 'Praktikkan resepnya minimal 2 kali dalam 30 hari setelah beli, lalu kirim foto baksonya ke WhatsApp Cece. Cece bantu cek salahnya di mana. Kalau sudah dibantu dan baksonya masih belum kenyal, uang kelasnya Cece kembalikan penuh.',
      short: 'Sudah dibantu Cece tapi baksonya masih belum kenyal? Uang kelasnya dikembalikan penuh.',
    },
    // Real deadline: the Go Hiong folder is only shared with Bakso orders paid
    // by this time. Go Hiong Roll is sold on its own at Rp 199.000.
    bonus: {
      title: 'Bonus: Kelas Go Hiong Roll',
      body: 'Untuk yang daftar sampai 14 Desember 2026. Kelas ini biasanya dijual sendiri Rp\u00a0199.000. Dikirim ke Gmail yang sama dengan kelas baksonya.',
      endsAt: '2026-12-14T23:59:59+07:00',
    },

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
        question: 'Kalau baksonya gagal gimana?',
        nearQuiz: true,
        answer:
          'Kirim fotonya ke WhatsApp Cece, nanti Cece kasih tahu salahnya di mana. Kalau sudah praktik 2 kali dalam 30 hari dan sudah dibantu tapi baksonya masih belum kenyal, uang kelasnya Cece kembalikan penuh.',
      },
      {
        question: 'Resep apa aja yang diajarin?',
        nearQuiz: true,
        answer: 'Tiga: bakso sapi, bakso urat, dan tahu bakso. Semuanya ada di video yang sama.',
      },
      {
        question: 'Berapa lama bikinnya?',
        answer: 'Dari mulai sampai bakso matang paling lama 3 jam.',
      },
      {
        question: 'Diajarin bikin kuahnya juga?',
        answer:
          'Kelasnya fokus ke baksonya, kuahnya tidak diajarkan. Air sisa rebusan baksonya bisa dipakai jadi kuah.',
      },
      {
        question: 'Saya pemula, bisa ikut?',
        nearQuiz: true,
        answer:
          'Bisa. Nggak harus jago dulu. Kelasnya dijelaskan dari dasar: suhu, cara menguleni, sampai merebus. Kalau ada yang bingung, kamu bisa konsultasi langsung dengan Cece.',
      },
      {
        question: 'Harus standby di jam tertentu?',
        nearQuiz: true,
        answer:
          'Tidak. Videonya 40 menit dan bisa ditonton kapan saja, diulang kapan saja. Aksesnya seumur hidup.',
      },
      {
        question: 'Ini cuma e-book?',
        nearQuiz: true,
        answer:
          'Bukan. Kamu dapat video kelas, e-book resep, dan bisa tanya Cece langsung. Akses videonya langsung masuk ke Gmail kamu setelah bayar.',
      },
      {
        question: 'Saya nggak punya Gmail, gimana?',
        nearQuiz: true,
        answer:
          'Kelasnya ada di Google Drive, jadi perlu alamat Gmail (yang belakangnya @gmail.com). HP Android biasanya sudah punya Gmail. Kalau bingung, klik "Tanya Cece", nanti dibantu lewat WhatsApp.',
      },
      {
        question: 'Sudah bayar tapi kelasnya belum masuk?',
        answer:
          'Cek dulu folder Spam atau Promosi di Gmail kamu, dan pastikan kamu buka pakai Gmail yang sama dengan yang ditulis waktu bayar. Kalau masih belum ada, klik "Tanya Cece" dan kirim bukti bayarnya, nanti dicek.',
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
          'Setelah bayar (QRIS, e-wallet, atau Virtual Account), akses folder kelas di Google Drive langsung masuk ke Gmail yang kamu isi. Aksesnya seumur hidup, bisa ditonton ulang kapan saja.',
      },
    ],
  },

  // Short, photo-led page for the Lapis Legit ads (Nov 2026). Facts: the
  // course record (Rp 699.000, was really sold at 799.000, 62-minute video,
  // lifetime access, the 4 benefits, "resep warisan keluarga … 3 generasi"),
  // what's included on the course page, and Cece's own words in her lapis
  // videos, plus her answers on the tool list (15 Nov 2026).
  'lapis-legit': {
    layout: 'short',
    hook: 'Lapis legit moist dan rapi, dari resep keluarga 3 generasi.',
    subhook:
      'Bahannya mahal, jadi sayang kalau gagal. Belajar langsung dari Cece, yang sudah berkali-kali bikin lapis legit.',
    // Web copy of the "A-kering" ad cut (2026-11-15-lapis-A-kering.mp4), 720x1280.
    previewVideo: {
      src: '/videos/lapis-kenapa-kering.mp4',
      poster: '/videos/lapis-kenapa-kering.jpg',
      label: 'Tonton: kenapa lapis legit bisa kering',
    },
    proofPoints: ['Resep keluarga 3 generasi', 'Video 62 menit', 'Akses seumur hidup'],
    heroNext:
      'Bayar lewat QRIS, GoPay, ShopeePay, atau Virtual Account. Akses kelas langsung masuk ke Gmail kamu lewat Google Drive.',
    // Same steps as Bakso. No fee amount here: Lynk's fee was only checked
    // on the Bakso price.
    heroSteps: [
      'Klik "Bayar Sekarang", lalu pilih cara bayar: QRIS, GoPay, ShopeePay, atau Virtual Account. Ada biaya admin kecil dari cara bayarnya.',
      'Tulis alamat Gmail kamu (yang belakangnya @gmail.com) di formulir pembayaran.',
      'Link kelas langsung masuk ke Gmail kamu lewat Google Drive. Buka pakai Gmail yang sama, tonton kapan saja, akses seumur hidup.',
    ],
    heroStepsHelp: 'Belum punya Gmail atau bingung caranya? Klik "Tanya Cece", nanti dibantu lewat WhatsApp.',
    // Verbatim from wa-berhasil-sekali-coba.jpg (shown in full below the hero).
    heroQuote: { text: 'Berhasil Ce, sekali coba. Terimakasih Ce ilmunya.', source: 'Murid kelas lapis legit' },
    // The three Nov 2026 ad cuts: "lapis-A-kering", "lapis-B-takut-gagal",
    // "lapis-C-jangan-dipotong". Matches when the Meta ad name (utm_content)
    // contains the word.
    adVariants: [
      {
        key: 'kering',
        match: 'kering',
        hook: 'Lapis legit kamu selalu kering?',
        subhook:
          'Biasanya karena satu hal kecil setelah keluar oven. Cece tunjukkan caranya di kelas video, dari resep keluarga 3 generasi.',
      },
      {
        key: 'takut',
        match: 'takut',
        hook: 'Takut bikin lapis legit karena bahannya mahal, kalau gagal rugi?',
        subhook:
          'Belajar dari Cece, yang sudah berkali-kali bikin lapis legit dari resep keluarga 3 generasi. Kelasnya video, bisa diulang kapan saja.',
      },
      {
        key: 'potong',
        match: 'potong',
        hook: 'Lapis legit yang baru matang jangan langsung dipotong.',
        subhook: 'Satu dari hal-hal kecil yang Cece tunjukkan di kelas lapis legit, dari resep keluarga 3 generasi.',
      },
    ],

    proofTitle: 'Hasil lapis legit murid',
    proofIntro: 'Foto dan pesan asli dari murid, dikirim ke Cece setelah mereka coba resepnya.',
    testimonials: [
      {
        src: '/images/testimonials/lapis-legit/wa-berhasil-sekali-coba.jpg',
        width: 400,
        height: 772,
        alt: 'Foto dua potong lapis legit buatan murid di atas piring merah. Pesan: "Berhasil ce sekali coba" dan "Terimakasih ce ilmunya".',
      },
      {
        src: '/images/uploads/testimonials/new/1789798950857-ok800akdep.webp',
        width: 753,
        height: 906,
        alt: 'Foto lapis legit buatan murid yang sudah dipotong, lapisannya tipis dan rapi. Tulisan: "Cece terima kasih resep nya.. saya baru cuba semalam... terbaik resep nya".',
      },
      {
        src: '/images/testimonials/lapis-legit/wa-tidak-kecewa-lapis-gulung.jpg',
        width: 517,
        height: 571,
        alt: 'Pesan WhatsApp dari murid: "Cece lina hasil lapis legit ikt kls." dan "Tdk kecewa ikt kls cece lina", dengan foto lapis gulung, lalu "Sisa adonan bikin lapis gulung" dengan foto irisan lapis gulung.',
      },
    ],

    // Cece's own words from her lapis videos (tip, tips, howto, slice clips).
    tips: {
      title: 'Tips kecil dari dapur Cece',
      intro: 'Beberapa hal yang Cece tunjukkan di videonya. Kelihatannya sepele, tapi menentukan hasilnya.',
      items: [
        {
          title: 'Keluar oven, jangan langsung dibuka',
          body: 'Lapis jadi kering kalau setelah dioven langsung dibuka dan nggak dibalik. Kalau dibalik, batter-nya turun, jadi satu loyang moist.',
        },
        {
          title: 'Baru matang, jangan langsung dipotong',
          body: 'Diamkan dulu. Cece biarkan semalaman, baru besok paginya dibalik.',
        },
        {
          title: 'Lapisan terakhir pakai api atas-bawah',
          body: 'Untuk lapisan paling atas, oven pakai api atas dan bawah sekaligus.',
        },
        {
          title: 'Pemula, mulai dari loyang bulat',
          body: 'Kata Cece, loyang bulat lebih cepat dikerjakan daripada loyang kotak.',
        },
      ],
      quote: 'bikinnya 2 jam, makannya 5 menit :)',
    },

    materiTitle: 'Yang kamu pelajari di kelas',
    whyTitle: 'Kenapa belajar dari Cece',
    why: [
      'Resep warisan keluarga, sudah turun-temurun 3 generasi.',
      'Bahan lapis legit mahal. Daripada coba-coba sendiri, belajar dari yang sudah berkali-kali bikin.',
      'Video 62 menit, ditonton kapan saja dan boleh diulang. Nggak harus standby di jam tertentu.',
      'Bukan cuma resep tulisan: ada video, e-book resep (PDF), sertifikat digital, dan konsultasi langsung dengan Cece.',
    ],

    // Tool answers from Cece (15 Nov 2026): electric oven, tin size is in the
    // class video, mixer needed, small tools can be substituted, she
    // recommends the oven and mixers from her store (optional).
    tools: {
      title: 'Alat yang perlu disiapkan',
      intro: 'Lapis legit dipanggang selapis demi selapis di oven, jadi oven wajib ada.',
      items: [
        {
          name: 'Oven',
          note: 'Pakai oven listrik. Untuk lapisan terakhir, Cece pakai api atas dan bawah.',
        },
        {
          name: 'Loyang',
          note: 'Untuk pemula, Cece sarankan loyang bulat. Ukurannya dijelaskan di video kelas.',
        },
        {
          name: 'Mixer',
          note: 'Perlu mixer untuk mengocok adonan.',
        },
        {
          name: 'Alat kecil lainnya',
          note: 'Penekan lapis, kuas, dan alat kecil lain tidak harus beli khusus. Bisa diganti dengan yang sudah ada di dapur.',
        },
      ],
      note: 'Cece merekomendasikan oven dan mixer dari CeceLinaChang Store. Ini pilihan saja, bukan syarat ikut kelas.',
    },

    offerIncludes: [
      'Video 62 menit, akses seumur hidup',
      'Konsultasi langsung dengan Cece',
      'E-book resep (PDF)',
      'Sertifikat digital',
    ],
    offerRiskLine: 'Bingung setelah beli? Konsultasi langsung dengan Cece sudah termasuk.',

    faq: [
      {
        question: 'Saya pemula, bisa ikut?',
        answer:
          'Bisa. Saran Cece untuk pemula: mulai pakai loyang bulat, karena lebih cepat dikerjakan. Kalau ada yang bingung, kamu bisa konsultasi langsung dengan Cece.',
      },
      {
        question: 'Harus standby di jam tertentu?',
        answer: 'Tidak. Videonya 62 menit dan bisa ditonton kapan saja, diulang kapan saja. Aksesnya seumur hidup.',
      },
      {
        question: 'Bagaimana cara akses kelasnya?',
        answer:
          'Setelah bayar (QRIS, GoPay, ShopeePay, atau Virtual Account), akses folder kelas di Google Drive langsung masuk ke Gmail yang kamu isi waktu bayar. Jadi perlu alamat Gmail (yang belakangnya @gmail.com). HP Android biasanya sudah punya Gmail. Kalau bingung, klik "Tanya Cece", nanti dibantu lewat WhatsApp.',
      },
      {
        question: 'Alat apa yang dibutuhkan?',
        answer:
          'Oven listrik, loyang (untuk pemula, loyang bulat), dan mixer. Penekan lapis, kuas, dan alat kecil lain bisa pakai yang sudah ada di dapur. Daftarnya ada di bagian "Alat yang perlu disiapkan" di atas.',
      },
      {
        question: 'Ini cuma e-book?',
        answer:
          'Bukan. Kamu dapat video kelas 62 menit, e-book resep (PDF), sertifikat digital, dan bisa konsultasi langsung dengan Cece.',
      },
      {
        question: 'Sudah bayar tapi kelasnya belum masuk?',
        answer:
          'Cek dulu folder Spam atau Promosi di Gmail kamu, dan pastikan kamu buka pakai Gmail yang sama dengan yang ditulis waktu bayar. Kalau masih belum ada, klik "Tanya Cece" dan kirim bukti bayarnya, nanti dicek.',
      },
    ],
  },
};

export function getLandingCopy(slug: string): AnyLandingCopy | null {
  return landingPages[slug] ?? null;
}
