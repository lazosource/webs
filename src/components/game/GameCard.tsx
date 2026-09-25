import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GameDef } from "@/lib/games";
import { ACCENT_CLASSES } from "@/lib/accent";

export function GameCard({ game }: { game: GameDef }) {
  const accent = ACCENT_CLASSES[game.accent];
  const Icon = game.icon;

  return (
    <Link
      href={`/games/${game.slug}`}
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-surface-border bg-surface/50 p-5 transition-all hover:-translate-y-0.5 ${accent.hoverCard}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between">
        <div className={`flex size-11 items-center justify-center rounded-lg border ${accent.border} ${accent.bg}`}>
          <Icon className={`size-5 ${accent.text}`} aria-hidden />
        </div>
        <ArrowUpRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
      </div>
      <div className="relative">
        <p className={`font-display text-[11px] uppercase tracking-widest ${accent.text} mb-1`}>
          {game.category}
        </p>
        <h3 className="font-display text-base font-semibold leading-snug">{game.title}</h3>
        <p className="text-sm text-muted mt-1.5 leading-relaxed">{game.tagline}</p>
      </div>
    </Link>
  );
}
