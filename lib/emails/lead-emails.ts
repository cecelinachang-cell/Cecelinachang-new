const WA_LINK = 'https://wa.me/6281284250718';

const wrap = (bodyHtml: string) => `
<div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #3A2E27; line-height: 1.6;">
  <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #C4622D; font-weight: bold; margin: 0 0 16px;">
    Cece Lina Chang
  </p>
  ${bodyHtml}
  <hr style="border: none; border-top: 1px solid #E8B86D66; margin: 32px 0 16px;" />
  <p style="font-size: 12px; color: #7A3B1E99;">
    Anda menerima email ini karena mendaftar minat di cecelinachang.com.
  </p>
</div>
`;

export function buildWelcomeEmail(courseTitle?: string) {
  if (!courseTitle) {
    const genericWaLink = `${WA_LINK}?text=${encodeURIComponent('Halo Cece, tadi aku chat di website')}`;
    return {
      subject: `Makasih udah ngobrol sama Lina 🤎`,
      html: wrap(`
        <h1 style="font-size: 22px; margin: 0 0 16px;">Makasih udah cerita ke Lina!</h1>
        <p>Pesanmu tadi sudah kami terima. Cece atau tim akan lanjutkan obrolannya di WhatsApp begitu sempat.</p>
        <p>Nggak sabar nunggu? Lanjutkan sendiri kapan aja, kami siap bantu:</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${genericWaLink}" style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: bold;">
            Lanjut ke WhatsApp
          </a>
        </p>
      `),
    };
  }

  return {
    subject: `Sudah dapat kelasnya, ${courseTitle} — plus rahasia bakso kenyal dari Cece`,
    html: wrap(`
      <h1 style="font-size: 22px; margin: 0 0 16px;">Terima kasih sudah tertarik, ya!</h1>
      <p>Data Anda untuk <strong>${courseTitle}</strong> sudah kami terima. Cece akan proses pendaftaran begitu Anda kirim chat WhatsApp yang otomatis terbuka tadi.</p>
      <p style="background: #FBF6EE; border-left: 3px solid #C4622D; padding: 10px 16px; margin: 20px 0; font-size: 14px;">
        Cece sudah mengelola pabrik bakso sejak <strong>1998</strong>, dan sudah membantu <strong>4.500+ murid</strong> di seluruh Indonesia bikin bakso sekelas industri dari dapur rumah sendiri.
      </p>
      <p>Sambil menunggu, ini satu rahasia dapur yang paling sering ditanyakan murid Cece:</p>
      <div style="background: #FBF6EE; border: 1px solid #E8B86D55; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #C4622D;">Kenapa bakso pabrik garing saat digigit, punya sendiri malah lembek?</p>
        <p style="margin: 8px 0 0;">Bukan soal tepung lebih banyak — itu justru bikin bakso keras dan berasa tepung. Kuncinya di suhu adonan: daging giling dan air es harus tetap di bawah 4°C selama diuleni. Begitu adonan mulai terasa hangat di tangan, protein daging sudah rusak dan teksturnya tidak akan pernah kenyal lagi walau direbus sempurna. Ini salah satu dari lima teknik yang Cece bongkar tuntas di kelas.</p>
      </div>
      <p>Belum sempat chat WhatsApp Cece? Klik di bawah, lanjutkan dari sini:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${WA_LINK}" style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: bold;">
          Lanjut ke WhatsApp
        </a>
      </p>
    `),
  };
}

export function buildReminderEmail(courseTitle: string) {
  return {
    subject: `Masih mau ikut ${courseTitle}? Kelas ini masih terbuka`,
    html: wrap(`
      <h1 style="font-size: 22px; margin: 0 0 16px;">Belum sempat lanjut ke WhatsApp?</h1>
      <p>Dua hari lalu Anda menunjukkan minat di <strong>${courseTitle}</strong>. Belum ada kabar konfirmasi dari Anda — kelasnya masih terbuka, dan Cece masih siap bantu langsung.</p>
      <p>Kalau ada pertanyaan yang bikin ragu (harga, cara transfer, jadwal video), balas WhatsApp ini saja, Cece jawab langsung:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${WA_LINK}" style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: bold;">
          Chat Cece di WhatsApp
        </a>
      </p>
    `),
  };
}
