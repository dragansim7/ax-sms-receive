import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm px-4 font-display text-sm font-semibold tracking-tight transition-[background-color,color,opacity,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "h-11 bg-accent text-accent-fg hover:opacity-90 active:scale-95",
        quiet: "h-11 border border-line bg-elevated text-fg hover:bg-subtle active:scale-95",
        ghost: "h-11 text-muted hover:text-fg",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className = "", variant, type = "button", ...props }: Props) {
  return <button type={type} className={`${buttonStyles({ variant })} ${className}`} {...props} />;
}
