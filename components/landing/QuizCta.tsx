import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Every CTA on a landing page is a plain anchor to the quiz at #cek. */
export function QuizCta({ label, className }: { label: string; className?: string }) {
  return (
    <a
      href="#cek"
      className={cn(
        'tap-target inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-sambal px-6 py-4 text-center text-base font-bold text-white shadow-[0_6px_0_0_var(--color-sambal-deep)] transition-[transform,box-shadow] duration-150 active:translate-y-[3px] active:shadow-[0_3px_0_0_var(--color-sambal-deep)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-mie motion-reduce:transition-none sm:text-lg',
        className,
      )}
    >
      {label}
      <ArrowDown className="h-5 w-5 shrink-0" aria-hidden="true" />
    </a>
  );
}
