// Best-effort single-use enforcement for session tokens (per-instance, see
// rateLimit.ts for the same caveat). Stops the same signed session from
// being replayed into multiple score submissions within one warm instance.

const seen = new Map<string, number>();
const MAX_TRACKED = 20_000;
const TTL_MS = 1000 * 60 * 60 * 2; // matches MAX_SESSION_AGE_MS in scoreToken.ts

export function consumeNonce(nonce: string): boolean {
  const now = Date.now();

  if (seen.has(nonce)) return false;

  if (seen.size > MAX_TRACKED) {
    for (const [k, t] of seen) {
      if (now - t > TTL_MS) seen.delete(k);
    }
  }

  seen.set(nonce, now);
  return true;
}
