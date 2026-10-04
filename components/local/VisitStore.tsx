import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { waLink } from '@/lib/links';
import { STORE } from '@/lib/localStore';
import { POLICIES } from '@/lib/policies';

export default function VisitStore({ message }: { message: string }) {
  return (
    <aside className="bg-butter/15 border border-butter/40 rounded-3xl p-6 sm:p-8 mb-10 sm:mb-14">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-terracotta shadow-sm shrink-0">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-2">
            {STORE.name}
          </h2>
          <p className="text-charcoal-brown/80 leading-relaxed mb-1">
            <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-terracotta">
              {STORE.addressLine}
            </a>
          </p>
          <p className="text-charcoal-brown/80 leading-relaxed mb-1">
            Sabtu 10.00–13.30. Minggu tutup. Senin buka pukul 10.00. Jam hari lain ada di Google Maps. Janjian dulu lewat WhatsApp, biar unitnya siap.
          </p>
          <p className="text-charcoal-brown/70 text-sm leading-relaxed mb-5">
            {POLICIES.PRODUCT_WARRANTY} Kalau nggak sempat datang, kami kirim ke seluruh Indonesia. Balasan admin jam 09.00–17.00.
          </p>
          <Button href={waLink(message)} external variant="whatsapp" size="lg" fullWidth className="sm:w-fit">
            <WhatsAppIcon className="w-5 h-5 mr-2" />
            Chat {STORE.phoneDisplay}
          </Button>
        </div>
      </div>
    </aside>
  );
}
