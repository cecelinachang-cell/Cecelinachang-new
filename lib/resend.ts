import { Resend } from 'resend';

// The constructor throws without a key, and route modules are evaluated at
// build time, so a Preview deploy (key is Production-only) failed to build.
// The placeholder never sends: every call site checks isResendConfigured(),
// which reads the real env var.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_not_configured');

export const isResendConfigured = (): boolean => {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && key.startsWith('re_'));
};

export const FROM_ADDRESS = 'Cece Lina Chang <hello@cecelinachang.com>';

// Replies go to the Zoho mailbox, not the send-only Resend address.
export const REPLY_TO_ADDRESS = 'halo@cecelinachang.com';
