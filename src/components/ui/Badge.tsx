import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-background-elevated px-2.5 py-1 text-xs font-medium text-muted font-display uppercase tracking-wide",
        className
      )}
      {...props}
    />
  );
}
