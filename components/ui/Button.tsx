import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const buttonStyles = cva(
  "inline-flex justify-center items-center tap-target rounded-full font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100",
  {
    variants: {
      variant: {
        primary: "text-white bg-terracotta hover:bg-rust-ink shadow-lg shadow-terracotta/20",
        secondary: "text-charcoal-brown bg-white border border-butter/40 hover:border-terracotta/50 hover:bg-butter/10 shadow-sm",
        whatsapp: "text-white bg-green-500 hover:bg-green-600 shadow-md",
      },
      size: {
        sm: "px-4 py-2 text-sm gap-1.5",
        md: "px-6 py-3 text-base gap-2",
        lg: "px-8 py-4 text-lg gap-2",
      },
      fullWidth: {
        true: "w-full",
        false: "w-fit",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

interface CommonProps extends VariantProps<typeof buttonStyles> {
  className?: string;
  children: React.ReactNode;
}

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    external?: boolean;
  };

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonProps = ButtonAsLink | ButtonAsButton;

export function Button({ className, variant, size, fullWidth, children, ...props }: ButtonProps) {
  const classes = cn(buttonStyles({ variant, size, fullWidth }), className);

  if ("href" in props && props.href) {
    const { href, external, ...anchorProps } = props as ButtonAsLink;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...(anchorProps as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
