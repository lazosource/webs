// Best-effort, per-instance rate limiting. Serverless platforms run
// multiple instances, so this is a deterrent against casual abuse rather
// than a hard global guarantee — combined with the signed session token
// and score plausibility checks in the scores API, it's enough for a
// hobby leaderboard without needing an external store like Redis.

interface Bucket {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const MAX_TRACKED_KEYS = 5000;

const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, b] of buckets) {
      if (now - b.windowStart > WINDOW_MS) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_PER_WINDOW;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
