import type { Metadata } from "next";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Global and per-game leaderboards for every CasperSource mini-game.",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const { game } = await searchParams;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted mt-2">
          Global ranks your best score across every game. Per-game boards
          show who&apos;s mastered that one specifically.
        </p>
      </header>
      <LeaderboardView initialGame={game} />
    </div>
  );
}
