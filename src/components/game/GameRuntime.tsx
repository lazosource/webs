"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Trophy, TriangleAlert } from "lucide-react";
import { getGame } from "@/lib/games";
import { ACCENT_CLASSES } from "@/lib/accent";
import { useGameSession } from "@/hooks/useGameSession";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GAME_COMPONENTS } from "@/components/games/registry";

export interface GamePlayProps {
  active: boolean;
  onFinish: (score: number) => void;
}

// This whole runtime lives on the client so the game registry — which maps
// slugs to `next/dynamic(..., { ssr: false })` components — never has to
// cross the server/client boundary as a prop. It resolves everything (the
// game definition, its icon, its component) from the slug alone.
export function GameRuntime({ slug }: { slug: string }) {
  const game = getGame(slug);
  const GameComponent = GAME_COMPONENTS[slug];
  const { status, error, result, start, finish, reset } = useGameSession(slug);

  if (!game || !GameComponent) {
    notFound();
  }

  const accent = ACCENT_CLASSES[game.accent];
  const Icon = game.icon;
  const minutes = Math.max(1, Math.round(game.estimatedSeconds / 60));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Link
        href="/games"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" aria-hidden /> All games
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl border ${accent.border} ${accent.bg}`}
        >
          <Icon className={`size-6 ${accent.text}`} aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-xl md:text-2xl font-semibold">
              {game.title}
            </h1>
            <Badge>{game.category}</Badge>
          </div>
          <p className="text-muted text-sm mt-1">{game.tagline}</p>
        </div>
      </div>

      <div className="relative rounded-2xl border border-surface-border bg-background-elevated overflow-hidden min-h-[440px]">
        {status === "active" ? (
          <GameComponent active onFinish={finish} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center overflow-y-auto scrollbar-thin">
            {status === "idle" && (
              <>
                <div
                  className={`rounded-full border ${accent.border} ${accent.bg} px-3 py-1 text-xs font-display uppercase tracking-widest ${accent.text}`}
                >
                  ~{minutes} min challenge
                </div>
                <ul className="text-sm text-muted space-y-1.5 max-w-sm">
                  {game.howTo.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
                <Button size="lg" onClick={start}>
                  Start challenge
                </Button>
              </>
            )}
            {status === "submitting" && (
              <p className="text-muted font-display animate-pulse">
                Submitting score…
              </p>
            )}
            {status === "done" && result && (
              <>
                <Trophy className={`size-10 ${accent.text}`} aria-hidden />
                <div>
                  <p className="font-display text-4xl font-bold text-glow">
                    {result.score.toLocaleString()}
                  </p>
                  <p className="text-muted text-sm mt-1">
                    Rank #{result.rank} on the {game.title} leaderboard
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={reset} variant="secondary">
                    <RotateCcw className="size-4" aria-hidden /> Play again
                  </Button>
                  <LinkButton href={`/leaderboard?game=${game.slug}`} variant="ghost">
                    View leaderboard
                  </LinkButton>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                <TriangleAlert className="size-8 text-danger" aria-hidden />
                <p className="text-sm text-danger max-w-xs">{error}</p>
                <Button onClick={reset} variant="ghost">
                  Try again
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
