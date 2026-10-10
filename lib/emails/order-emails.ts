import { SITE_URL, waLink } from '@/lib/links';

// Buyer names, emails and phone numbers are user input and end up in HTML.
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const rupiah = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

const wrap = (bodyHtml: string) => `
<div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #3A2E27; line-height: 1.6;">
  <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #C4622D; font-weight: bold; margin: 0 0 16px;">
    Cece Lina Chang
  </p>
  ${bodyHtml}
  <hr style="border: none; border-top: 1px solid #E8B86D66; margin: 32px 0 16px;" />
  <p style="font-size: 12px; color: #7A3B1E99;">
    Anda menerima email ini karena membeli kelas di cecelinachang.com.
  </p>
</div>
`;

export type PaidOrder = {
  merchantRef: string;
  courseTitle: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
};

export function buildBuyerPaidEmail(order: PaidOrder) {
  const wa = waLink(`Halo Cece, saya sudah bayar ${order.courseTitle}. No. pesanan: ${order.merchantRef}`);
  return {
    subject: `Pembayaran diterima: ${order.courseTitle}`,
    html: wrap(`
      <h1 style="font-size: 22px; margin: 0 0 16px;">Terima kasih, ${esc(order.customerName)}!</h1>
      <p>Pembayaran Anda untuk <strong>${esc(order.courseTitle)}</strong> sudah kami terima.</p>
      <table style="font-size: 14px; background: #FBF6EE; border-radius: 12px; padding: 16px; margin: 20px 0; width: 100%;">
        <tr><td style="color: #7A3B1E;">No. pesanan</td><td><strong>${esc(order.merchantRef)}</strong></td></tr>
        <tr><td style="color: #7A3B1E;">Total</td><td>${rupiah(order.amount)}</td></tr>
        <tr><td style="color: #7A3B1E;">Metode</td><td>${esc(order.paymentMethod)}</td></tr>
      </table>
      <p>Cece akan membagikan akses video kelas ke email ini (<strong>${esc(order.customerEmail)}</strong>) lewat Google Drive. Biasanya dalam beberapa jam di jam kerja.</p>
      <p>Mau lebih cepat atau ada pertanyaan? Chat Cece dengan nomor pesanan di atas:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${wa}" style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: bold;">
          Chat Cece di WhatsApp
        </a>
      </p>
    `),
  };
}

export function buildAdminPaidEmail(order: PaidOrder) {
  return {
    subject: `💰 Pesanan dibayar: ${order.courseTitle} — ${order.customerName}`,
    html: `
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222; line-height: 1.6;">
  <p><strong>Pesanan baru sudah dibayar.</strong> Bagikan akses Google Drive kelas ke email pembeli.</p>
  <ul>
    <li>Kelas: <strong>${esc(order.courseTitle)}</strong></li>
    <li>Nama: ${esc(order.customerName)}</li>
    <li>Email: ${esc(order.customerEmail)}</li>
    <li>WhatsApp: ${esc(order.customerPhone)}</li>
    <li>Total: ${rupiah(order.amount)} (${esc(order.paymentMethod)})</li>
    <li>No. pesanan: ${esc(order.merchantRef)}</li>
  </ul>
  <p><a href="${SITE_URL}/admin/orders">Lihat semua pesanan</a></p>
</div>
`,
  };
}
