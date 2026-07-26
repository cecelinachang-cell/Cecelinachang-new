interface MarginaliaProps {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
}

export function Marginalia({ children, className = '', rotate = -4 }: MarginaliaProps) {
  // Rotated text can overflow the viewport on narrow screens; clamp the
  // effective angle and wrap it in a non-rotated, width-capped container.
  const clampedRotate = Math.max(-3, Math.min(3, rotate));

  return (
    <span className="inline-block max-w-full overflow-visible align-top">
      <span
        className={`font-hand text-pencil-blue text-lg sm:text-2xl leading-snug inline-block max-w-full ${className}`}
        style={{ transform: `rotate(${clampedRotate}deg)` }}
      >
        {children}
      </span>
    </span>
  );
}
