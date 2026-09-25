import type { Metadata } from "next";
import { GAMES } from "@/lib/games";
import { GameCard } from "@/components/game/GameCard";

export const metadata: Metadata = {
  title: "Games",
  description:
    "12 cybersecurity mini-games: phishing, passwords, cryptography, network defense, malware, injection attacks, social engineering and more.",
};

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Pick your battlefield
        </h1>
        <p className="text-muted mt-3">
          Twelve mini-games, each built around a real cybersecurity skill.
          Every run ends with a score submitted straight to the leaderboard
          under your callsign.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
}
