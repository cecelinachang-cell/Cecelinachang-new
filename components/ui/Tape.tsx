import { cn } from "@/lib/utils";

interface TapeProps {
  className?: string;
  rotate?: number;
}

/** Decorative washi-tape accent for photo corners; purely visual. */
export function Tape({ className, rotate = -6 }: TapeProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute w-16 h-6 sm:w-20 sm:h-7 bg-butter/70 shadow-sm",
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
}
