import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getGame } from "@/lib/games";
import { verifySessionToken } from "@/lib/scoreToken";
import { consumeNonce } from "@/lib/usedNonces";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import { checkUsername, clampScore } from "@/lib/validation";

export const dynamic = "force-dynamic";

interface ScoreSubmission {
  token: unknown;
  gameSlug: unknown;
  playerName: unknown;
  score: unknown;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`submit:${ip}`)) {
    return NextResponse.json(
      { error: "Too many requests. Slow down and try again." },
      { status: 429 }
    );
  }

  let body: ScoreSubmission;
  try {
    body = (await request.json()) as ScoreSubmission;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { token, gameSlug, playerName, score } = body;

  if (typeof gameSlug !== "string") {
    return NextResponse.json({ error: "Missing game." }, { status: 400 });
  }

  const game = getGame(gameSlug);
  if (!game) {
    return NextResponse.json({ error: "Unknown game." }, { status: 404 });
  }

  if (typeof token !== "string") {
    return NextResponse.json({ error: "Missing session token." }, { status: 400 });
  }

  const verified = verifySessionToken(token, gameSlug);
  if (!verified.ok) {
    return NextResponse.json(
      { error: `Invalid session (${verified.reason}). Start the game again.` },
      { status: 400 }
    );
  }

  const elapsed = Date.now() - verified.issuedAt;
  if (elapsed < game.minDurationMs) {
    return NextResponse.json(
      { error: "That finished faster than should be possible — nice try." },
      { status: 400 }
    );
  }

  const cleanScore = clampScore(score, game.maxScore);
  if (cleanScore === null) {
    return NextResponse.json({ error: "Score out of range." }, { status: 400 });
  }

  if (typeof playerName !== "string") {
    return NextResponse.json({ error: "Missing callsign." }, { status: 400 });
  }
  const nameCheck = checkUsername(playerName);
  if (!nameCheck.ok || !nameCheck.clean) {
    return NextResponse.json({ error: nameCheck.reason }, { status: 400 });
  }

  // Only consume the token once every rejectable check has passed, so a
  // request that fails validation (e.g. arrives a moment too early) can
  // still be retried with the same session instead of being locked out.
  if (!consumeNonce(verified.nonce)) {
    return NextResponse.json(
      { error: "This game session was already submitted." },
      { status: 409 }
    );
  }

  await prisma.score.create({
    data: {
      playerName: nameCheck.clean,
      gameSlug,
      score: cleanScore,
    },
  });

  const better = await prisma.score.count({
    where: { gameSlug, score: { gt: cleanScore } },
  });

  return NextResponse.json({ ok: true, score: cleanScore, rank: better + 1 });
}
