import type { ReactNode } from "react";
import clsx from "clsx";

export function GameHUD({
  left,
  score,
  accentText,
}: {
  left: ReactNode;
  score: number;
  accentText: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-surface-border bg-surface/40 px-4 py-3 font-display text-sm">
      <div className="flex items-center gap-4 text-muted">{left}</div>
      <div className={clsx("font-semibold", accentText)}>
        {score.toLocaleString()} pts
      </div>
    </div>
  );
}

export function Lives({ count, total }: { count: number; total: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${count} lives remaining`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={clsx(
            "size-2.5 rounded-full",
            i < count ? "bg-danger" : "bg-surface-border"
          )}
        />
      ))}
    </span>
  );
}
