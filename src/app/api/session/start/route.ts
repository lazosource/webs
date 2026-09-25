import { NextResponse } from "next/server";
import { getGame } from "@/lib/games";
import { createSessionToken } from "@/lib/scoreToken";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`session:${ip}`)) {
    return NextResponse.json(
      { error: "Too many requests. Slow down and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const gameSlug =
    typeof body === "object" && body !== null && "gameSlug" in body
      ? (body as { gameSlug: unknown }).gameSlug
      : undefined;

  if (typeof gameSlug !== "string" || !getGame(gameSlug)) {
    return NextResponse.json({ error: "Unknown game." }, { status: 404 });
  }

  const token = createSessionToken(gameSlug);
  return NextResponse.json({ token });
}
