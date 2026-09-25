import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

interface SessionPayload {
  gameSlug: string;
  issuedAt: number;
  nonce: string;
}

const MAX_SESSION_AGE_MS = 1000 * 60 * 60 * 2; // 2 hours

function getSecret(): string {
  const secret = process.env.SCORE_SIGNING_SECRET;
  if (secret && secret.length >= 16) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SCORE_SIGNING_SECRET must be set to a long random string in production. " +
        "Generate one with `openssl rand -hex 32` and set it in your host's env vars."
    );
  }
  return "dev-only-insecure-secret-do-not-use-in-prod";
}

export function createSessionToken(gameSlug: string): string {
  const payload: SessionPayload = {
    gameSlug,
    issuedAt: Date.now(),
    nonce: randomUUID(),
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export type SessionVerifyResult =
  | { ok: true; issuedAt: number; nonce: string }
  | { ok: false; reason: string };

export function verifySessionToken(
  token: string,
  expectedGameSlug: string
): SessionVerifyResult {
  if (typeof token !== "string" || !token.includes(".")) {
    return { ok: false, reason: "malformed token" };
  }
  const [body, sig] = token.split(".");
  if (!body || !sig) return { ok: false, reason: "malformed token" };

  const expectedSig = createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return { ok: false, reason: "bad signature" };
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "bad payload" };
  }

  if (payload.gameSlug !== expectedGameSlug) {
    return { ok: false, reason: "game mismatch" };
  }

  const age = Date.now() - payload.issuedAt;
  if (age < 0) return { ok: false, reason: "token from the future" };
  if (age > MAX_SESSION_AGE_MS) return { ok: false, reason: "token expired" };

  return { ok: true, issuedAt: payload.issuedAt, nonce: payload.nonce };
}
