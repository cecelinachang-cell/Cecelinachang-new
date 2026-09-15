'use client';

import { Button } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { waLink } from '@/lib/links';
import { trackConversion } from '@/lib/analytics';

export function AskCeceButton() {
  return (
    <Button
      href={waLink('Halo Cece, aku mau tanya soal kelas online dulu')}
      external
      variant="whatsapp"
      size="lg"
      onClick={() => trackConversion('whatsapp_open')}
    >
      <WhatsAppIcon className="w-5 h-5 mr-2" /> Tanya via WhatsApp
    </Button>
  );
}
