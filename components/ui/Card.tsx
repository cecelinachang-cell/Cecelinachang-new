import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  /** Alternates the hand-cut corner direction so a grid of cards doesn't look uniform. */
  corner?: "a" | "b";
}

const CORNER_RADIUS = {
  a: "rounded-[1.25rem_0.5rem_1.25rem_0.5rem]",
  b: "rounded-[0.5rem_1.25rem_0.5rem_1.25rem]",
};

export function Card({ className, children, corner = "a" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white shadow-sm border border-butter/30 overflow-hidden hover:shadow-md transition-shadow",
        CORNER_RADIUS[corner],
        className
      )}
    >
      {children}
    </div>
  );
}
