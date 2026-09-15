import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const isResendConfigured = (): boolean => {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && key.startsWith('re_'));
};

export const FROM_ADDRESS = 'Cece Lina Chang <hello@cecelinachang.com>';

// Replies go to the Zoho mailbox, not the send-only Resend address.
export const REPLY_TO_ADDRESS = 'halo@cecelinachang.com';
