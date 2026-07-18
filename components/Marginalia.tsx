interface MarginaliaProps {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
}

export function Marginalia({ children, className = '', rotate = -4 }: MarginaliaProps) {
  return (
    <span
      className={`font-hand text-pencil-blue text-xl sm:text-2xl leading-snug inline-block ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
