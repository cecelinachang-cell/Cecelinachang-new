/**
 * Indonesian mobile numbers: 08…, 628… or +628…, 9–13 digits after the "8".
 * Spaces, dashes, dots, brackets and slashes (as pasted from contacts) are
 * ignored. Cece replies on WhatsApp, so a landline or a mistyped number is a
 * lead she can't reach.
 */
export function isValidIndonesianPhone(phone: string): boolean {
  const digits = phone.replace(/[\s.()/-]/g, "");
  return /^(?:\+?62|0)8\d{7,11}$/.test(digits);
}

// Typos seen in the wild for the domains Indonesian buyers actually use.
const DOMAIN_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.id": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
};

/**
 * The course video is shared through Google Drive to this address, so a typo
 * means the buyer never gets the class. Returns the corrected address to offer
 * ("Maksudnya …?"), or null when nothing looks wrong.
 */
export function suggestEmailFix(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const fix = DOMAIN_FIXES[email.slice(at + 1).trim().toLowerCase()];
  return fix ? `${email.slice(0, at)}@${fix}` : null;
}
