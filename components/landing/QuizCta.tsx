import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Landing-page CTAs are plain anchors. "#cek" goes to the quiz; "#daftar"
 * goes to the same card but skips the questions (see CommitmentQuiz), so a
 * visitor who already wants the class reaches the form in one tap.
 */
export function QuizCta({
  label,
  className,
  href = '#cek',
  variant = 'primary',
}: {
  label: string;
  className?: string;
  href?: '#cek' | '#daftar';
  variant?: 'primary' | 'secondary';
}) {
  return (
    <a
      href={href}
      className={cn(
        'tap-target inline-flex items-center justify-center gap-2 rounded-xl text-center font-bold transition-[transform,box-shadow] duration-150 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-mie motion-reduce:transition-none',
        variant === 'primary'
          ? 'min-h-14 bg-sambal px-6 py-4 text-base text-white shadow-[0_6px_0_0_var(--color-sambal-deep)] active:translate-y-[3px] active:shadow-[0_3px_0_0_var(--color-sambal-deep)] sm:text-lg'
          : 'min-h-12 border-2 border-sambal bg-white px-4 py-3 text-sambal active:bg-sambal/5',
        className,
      )}
    >
      {label}
      <ArrowDown className="h-5 w-5 shrink-0" aria-hidden="true" />
    </a>
  );
}
