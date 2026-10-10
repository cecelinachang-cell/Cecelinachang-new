import { isValidIndonesianPhone } from '@/lib/leadValidation';

// Pure parsing of the /api/checkout body, kept out of the route so it can be
// unit tested without a request, Supabase or Midtrans.

export type CheckoutInput = {
  courseSlug: string;
  name: string;
  email: string;
  phone: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 0812…, 62812… and +62812… all become 0812…, the form the buyer typed it in. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[\s.()/-]/g, '').replace(/^\+/, '');
  return digits.startsWith('62') ? `0${digits.slice(2)}` : digits;
}

export function parseCheckoutBody(body: unknown): CheckoutInput | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Data tidak lengkap.' };
  const b = body as Record<string, unknown>;

  const courseSlug = typeof b.courseSlug === 'string' ? b.courseSlug.trim().slice(0, 200) : '';
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 100) : '';
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase().slice(0, 254) : '';
  const phone = typeof b.phone === 'string' ? b.phone.trim() : '';

  if (!courseSlug) return { error: 'Kelas tidak ditemukan.' };
  if (name.length < 2) return { error: 'Nama wajib diisi.' };
  if (!EMAIL_RE.test(email)) return { error: 'Format email belum benar.' };
  if (!isValidIndonesianPhone(phone)) return { error: 'Nomor WhatsApp belum benar (contoh: 0812xxxxxxx).' };

  return { courseSlug, name, email, phone: normalizePhone(phone) };
}
