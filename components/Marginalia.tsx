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
  // callers pass display/position/color overrides (e.g. "hidden sm:block",
  // "absolute bottom-3 right-4 text-white") and a merged class string is the
  // only way that reliably beats the base classes in the Tailwind cascade.
  // Color lives on the outer span and cascades to the inner one (not
  // duplicated there) so a caller's "text-white" actually wins — the inner
  // span used to hardcode its own text color, which silently shadowed any
  // color override passed in via className.
  return (
    <span className={cn('inline-block max-w-full overflow-visible align-top text-pencil-blue', className)}>
      <span
        className="font-hand text-lg sm:text-2xl leading-snug inline-block max-w-full"
        style={{ transform: `rotate(${clampedRotate}deg)` }}
      >
        {children}
      </span>
    </span>
  );
}
