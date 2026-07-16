export function SquiggleUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 8"
      className={`w-full h-2 ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M1 5.5C10 1.5 20 8 30 4.5S50 1 59 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
