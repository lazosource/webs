import { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_-6px_rgba(52,224,161,0.6)] disabled:shadow-none",
  secondary:
    "bg-secondary/15 text-secondary border border-secondary/40 hover:bg-secondary/25",
  ghost:
    "bg-transparent text-foreground border border-surface-border hover:bg-surface hover:border-muted/40",
  danger:
    "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25",
};

export const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-lg gap-2",
  lg: "px-6 py-3.5 text-base rounded-lg gap-2.5",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string
) {
  return clsx(
    "inline-flex items-center justify-center font-medium font-display transition-all duration-150 cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
});

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
}

export function LinkButton({
  href,
  className,
  variant = "primary",
  size = "md",
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...props} />
  );
}
