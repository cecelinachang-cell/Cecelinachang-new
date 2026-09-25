// Advanced matching: the ad platforms attribute far more conversions when the
// Lead event carries the person's email and phone, because they can match it to
// an account. Both are SHA-256'd in the browser first (crypto.subtle), so what
// leaves the page is a hash, never the raw address or number.
//
// Order matters: Meta only attaches user data to events fired *after* the
// fbq('init', id, userData) call, so identifyForPixels() must be awaited before
// trackConversion('lead_form_submit').

import { META_PIXEL_ID, pixelsEnabled } from './pixels';

export interface PixelContact {
  email?: string | null;
  phone?: string | null;
}

/** Meta and TikTok both want the email trimmed and lowercased before hashing. */
export function normalizeEmail(email?: string | null): string | null {
  const value = (email || '').trim().toLowerCase();
  // Not validation for its own sake: a hash of "typo" matches nothing and only
  // sends data with no upside.
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? value : null;
}

/**
 * Digits only, country code first, no leading + or 0 — what both platforms
 * hash. Visitors type Indonesian numbers every possible way: 0812…, 62812…,
 * +62 812-xxx, and occasionally bare 812….
 */
export function normalizePhone(phone?: string | null): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;

  let e164 = digits;
  if (digits.startsWith('62')) {
    e164 = digits;
  } else if (digits.startsWith('0')) {
    e164 = `62${digits.replace(/^0+/, '')}`;
  } else if (digits.startsWith('8')) {
    e164 = `62${digits}`;
  }

  // Shortest real Indonesian mobile is 62 + 9 digits; anything under that is a
  // half-typed number.
  return e164.length >= 11 ? e164 : null;
}

/** Lowercase hex SHA-256. Null when the browser has no crypto.subtle, which is
 *  the case in any non-secure context (plain http that isn't localhost). */
export async function sha256Hex(value: string): Promise<string | null> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return null;
    const bytes = new TextEncoder().encode(value);
    const digest = await subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return null;
  }
}

/**
 * Hands the hashed contact details to whichever pixels are loaded. Safe to call
 * with partial or junk input, and a no-op when the pixels are off (dev server,
 * no IDs configured) — so call sites never need to guard.
 */
export async function identifyForPixels(contact: PixelContact): Promise<void> {
  try {
    if (!pixelsEnabled || typeof window === 'undefined') return;

    const email = normalizeEmail(contact.email);
    const phone = normalizePhone(contact.phone);
    if (!email && !phone) return;

    const [emailHash, phoneHash] = await Promise.all([
      email ? sha256Hex(email) : Promise.resolve(null),
      phone ? sha256Hex(phone) : Promise.resolve(null),
    ]);
    if (!emailHash && !phoneHash) return;

    if (window.fbq && META_PIXEL_ID) {
      // Re-init with user data: Meta's documented way to add advanced matching
      // to a pixel that is already initialised. It does not re-fire PageView.
      window.fbq('init', META_PIXEL_ID, {
        ...(emailHash ? { em: emailHash } : {}),
        ...(phoneHash ? { ph: phoneHash } : {}),
      });
    }

    window.ttq?.identify?.({
      ...(emailHash ? { email: emailHash } : {}),
      ...(phoneHash ? { phone_number: phoneHash } : {}),
    });
  } catch {
    // Matching is an optimisation; it must never block a lead.
  }
}
