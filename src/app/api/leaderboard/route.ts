import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getGame, GAMES } from "@/lib/games";

export const dynamic = "force-dynamic";

const TOP_N = 50;
const RAW_FETCH_LIMIT = 500;

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

async function gameLeaderboard(gameSlug: string): Promise<GameEntry[]> {
  const rows = await prisma.score.findMany({
    where: { gameSlug },
    orderBy: { score: "desc" },
    take: RAW_FETCH_LIMIT,
    select: { playerName: true, score: true, createdAt: true },
  });

  const bestByPlayer = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const key = row.playerName.toLowerCase();
    if (!bestByPlayer.has(key)) bestByPlayer.set(key, row);
  }

  return [...bestByPlayer.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map((row, i) => ({
      rank: i + 1,
      playerName: row.playerName,
      score: row.score,
      createdAt: row.createdAt.toISOString(),
    }));
}

async function globalLeaderboard(): Promise<GlobalEntry[]> {
  const grouped = await prisma.score.groupBy({
    by: ["playerName", "gameSlug"],
    _max: { score: true },
  });

  interface Agg {
    displayName: string;
    total: number;
    games: Set<string>;
  }
  const byPlayer = new Map<string, Agg>();

  for (const row of grouped) {
    const key = row.playerName.toLowerCase();
    const best = row._max.score ?? 0;
    const existing = byPlayer.get(key);
    if (existing) {
      existing.total += best;
      existing.games.add(row.gameSlug);
    } else {
      byPlayer.set(key, {
        displayName: row.playerName,
        total: best,
        games: new Set([row.gameSlug]),
      });
    }
  }

  return [...byPlayer.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, TOP_N)
    .map((agg, i) => ({
      rank: i + 1,
      playerName: agg.displayName,
      totalScore: agg.total,
      gamesPlayed: agg.games.size,
    }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameSlug = searchParams.get("game");

  if (gameSlug) {
    if (!getGame(gameSlug)) {
      return NextResponse.json({ error: "Unknown game." }, { status: 404 });
    }
    const entries = await gameLeaderboard(gameSlug);
    return NextResponse.json({ scope: "game", gameSlug, entries });
  }

  const entries = await globalLeaderboard();
  return NextResponse.json({
    scope: "global",
    totalGames: GAMES.length,
    entries,
  });
}
