import { cn } from '@/lib/utils';

interface MarginaliaProps {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
}

export function Marginalia({ children, className = '', rotate = -4 }: MarginaliaProps) {
  // Rotated text can overflow the viewport on narrow screens; clamp the
  // effective angle and wrap it in a non-rotated, width-capped container.
  const clampedRotate = Math.max(-3, Math.min(3, rotate));

  // cn() (tailwind-merge) is required here, not a plain template string:
  // callers pass display overrides like "hidden sm:block" to hide these
  // decorative asides on mobile, and a merged class string is the only way
  // that reliably beats the base "inline-block" in the Tailwind cascade.
  return (
    <span className={cn('inline-block max-w-full overflow-visible align-top', className)}>
      <span
        className="font-hand text-pencil-blue text-lg sm:text-2xl leading-snug inline-block max-w-full"
        style={{ transform: `rotate(${clampedRotate}deg)` }}
      >
        {children}
      </span>
    </span>
  );
}
