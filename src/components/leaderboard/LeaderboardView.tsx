"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Crown, Loader2, TriangleAlert } from "lucide-react";
import { GAMES, getGame } from "@/lib/games";
import { ACCENT_CLASSES } from "@/lib/accent";

interface GameEntry {
  rank: number;
  playerName: string;
  score: number;
  createdAt: string;
}
interface GlobalEntry {
  rank: number;
  playerName: string;
  totalScore: number;
  gamesPlayed: number;
}

type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; entries: T[] };

export function LeaderboardView({ initialGame }: { initialGame?: string }) {
  const initialTab = initialGame && getGame(initialGame) ? initialGame : "global";
  const [tab, setTab] = useState(initialTab);

  const tabs = useMemo(
    () => [{ slug: "global", title: "Global" }, ...GAMES.map((g) => ({ slug: g.slug, title: g.title }))],
    []
  );

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {tabs.map((t) => (
          <button
            key={t.slug}
            onClick={() => setTab(t.slug)}
            className={clsx(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.slug
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-surface-border text-muted hover:text-foreground hover:bg-surface"
            )}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Remounting on tab change means each panel starts fresh (loading
          state comes from the initial useState value, not an effect), so
          switching tabs can never show stale data or a stale error. */}
      <LeaderboardPanel key={tab} tab={tab} />
    </div>
  );
}

function LeaderboardPanel({ tab }: { tab: string }) {
  const isGlobal = tab === "global";
  const [state, setState] = useState<LoadState<GameEntry | GlobalEntry>>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;
    const url = isGlobal ? "/api/leaderboard" : `/api/leaderboard?game=${tab}`;

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load the leaderboard.");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setState({ status: "success", entries: data.entries ?? [] });
      })
      .catch((e) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Something went wrong.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [tab, isGlobal]);

  const game = isGlobal ? undefined : getGame(tab);
  const accent = game ? ACCENT_CLASSES[game.accent] : null;
  const accentText = accent?.text ?? ACCENT_CLASSES.cyan.text;

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-danger text-sm">
        <TriangleAlert className="size-4" aria-hidden />
        {state.message}
      </div>
    );
  }

  const rows = isGlobal
    ? (state.entries as GlobalEntry[]).map((e) => ({
        rank: e.rank,
        playerName: e.playerName,
        primary: e.totalScore.toLocaleString(),
        secondary: `${e.gamesPlayed} game${e.gamesPlayed === 1 ? "" : "s"}`,
      }))
    : (state.entries as GameEntry[]).map((e) => ({
        rank: e.rank,
        playerName: e.playerName,
        primary: e.score.toLocaleString(),
        secondary: new Date(e.createdAt).toLocaleDateString(),
      }));

  return <LeaderboardTable rows={rows} accentText={accentText} />;
}

function LeaderboardTable({
  rows,
  accentText,
}: {
  rows: { rank: number; playerName: string; primary: string; secondary: string }[];
  accentText: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border py-16 text-center text-muted text-sm">
        No scores yet — be the first on the board.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col className="w-10 sm:w-14" />
          <col />
          <col className="w-16 sm:w-24" />
          <col className="w-16 sm:w-24" />
        </colgroup>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.rank}
              className="border-b border-surface-border last:border-0 odd:bg-surface/30"
            >
              <td className="px-2 py-3 font-display text-muted sm:px-4">
                {row.rank === 1 ? (
                  <Crown className={clsx("size-4", accentText)} aria-hidden />
                ) : (
                  `#${row.rank}`
                )}
              </td>
              <td className="truncate px-2 py-3 font-medium">{row.playerName}</td>
              <td className={clsx("px-2 py-3 text-right font-display font-semibold sm:px-4", accentText)}>
                {row.primary}
              </td>
              <td className="truncate px-2 py-3 text-right text-xs text-muted sm:px-4">
                {row.secondary}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
