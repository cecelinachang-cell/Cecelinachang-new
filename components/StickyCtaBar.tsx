'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export interface CtaAction {
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  icon?: 'whatsapp' | 'shopee' | 'arrow';
}

export interface StickyCtaBarProps {
  price?: string;
  originalPrice?: string;
  caption?: string;
  primary: CtaAction;
  secondary?: CtaAction;
  /** DOM id of an element; the bar only appears once that element has
   * scrolled above the viewport. Omit to show the bar immediately. */
  revealAfterId?: string;
  className?: string;
}

// Multiple bars can mount at once during a transition (e.g. two different
// pages briefly overlapping in a route change), so the body class is
// ref-counted instead of a plain add/remove -- one bar's unmount must not
// strip the offset another bar still needs.
let stickyBarCount = 0;

function useStickyCtaBodyClass() {
  useEffect(() => {
    stickyBarCount += 1;
    document.body.classList.add('has-sticky-cta');
    return () => {
      stickyBarCount = Math.max(0, stickyBarCount - 1);
      if (stickyBarCount === 0) {
        document.body.classList.remove('has-sticky-cta');
      }
    };
  }, []);
}

function useRevealAfter(id?: string) {
  const [visible, setVisible] = useState(!id);

  useEffect(() => {
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) {
      // Defensive fallback for a caller passing an id that never renders --
      // queued as a microtask (rather than called directly here) so this
      // stays a reaction to an external check, not an unconditional
      // setState in the effect body.
      queueMicrotask(() => setVisible(true));
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [id]);

  return visible;
}

function iconFor(icon?: CtaAction['icon']) {
  if (icon === 'whatsapp') return <WhatsAppIcon className="w-5 h-5" />;
  if (icon === 'shopee') return <ShoppingBag className="w-4 h-4" />;
  if (icon === 'arrow') return <ArrowRight className="w-4 h-4" />;
  return null;
}

function ActionButton({ action, variant, size, className }: { action: CtaAction; variant: 'whatsapp' | 'shopee' | 'secondary'; size: 'sm' | 'md' | 'lg'; className?: string }) {
  const icon = iconFor(action.icon);
  const content = (
    <>
      {icon && <span className="mr-1.5">{icon}</span>}
      {action.label}
    </>
  );

  if (action.href) {
    return (
      <Button href={action.href} external={action.external} variant={variant} size={size} className={className} onClick={action.onClick}>
        {content}
      </Button>
    );
  }

  return (
    <Button type="button" onClick={action.onClick} variant={variant} size={size} className={className}>
      {content}
    </Button>
  );
}

/**
 * The one persistent buy CTA on mobile. Renders below `lg` only; adds
 * `body.has-sticky-cta` while mounted, which app/globals.css uses to pad
 * <main> so page content doesn't sit underneath it.
 *
 * z-index ladder across the site: navbar 50 -> this bar 60 -> search
 * overlay 70 -> lead form modal 100.
 */
export function StickyCtaBar({ price, originalPrice, caption, primary, secondary, revealAfterId, className }: StickyCtaBarProps) {
  useStickyCtaBodyClass();
  const visible = useRevealAfter(revealAfterId);
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-butter/30 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'} ${className || ''}`}
    >
      <div className="flex items-center gap-3 max-w-5xl mx-auto">
        {(price || caption) && (
          <div className="flex flex-col shrink-0 max-w-[9.5rem]">
            {originalPrice && <span className="text-charcoal-brown/40 line-through text-xs">{originalPrice}</span>}
            {price && <span className="font-serif text-lg font-bold text-rust-ink leading-tight">{price}</span>}
            {caption && <span className="text-charcoal-brown/50 text-[11px] leading-tight truncate">{caption}</span>}
          </div>
        )}
        <div className="flex flex-1 gap-2">
          <ActionButton action={primary} variant="whatsapp" size="md" className="flex-1 whitespace-nowrap overflow-hidden" />
          {secondary && <ActionButton action={secondary} variant="shopee" size="md" className="shrink-0 whitespace-nowrap" />}
        </div>
      </div>
    </div>
  );
}
