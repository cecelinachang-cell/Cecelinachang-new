import { Resend } from 'resend';

export const isResendConfigured = (): boolean => {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && key.startsWith('re_'));
};

let client: Resend | undefined;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not set');
  }
  if (!client) client = new Resend(key);
  return client;
}

// Built on first send, not at import. `new Resend(undefined)` throws, and
// Next imports this module while collecting page data. Preview builds have
// no RESEND_API_KEY, so constructing it here failed the whole deploy.
export const resend = {
  get emails() {
    return getResend().emails;
  },
};

export const FROM_ADDRESS = 'Cece Lina Chang <hello@cecelinachang.com>';
