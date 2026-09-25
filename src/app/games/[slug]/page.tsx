import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/lib/games";
import { GameRuntime } from "@/components/game/GameRuntime";

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return { title: game.title, description: game.description };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getGame(slug)) notFound();

  return <GameRuntime slug={slug} />;
}
