const USERNAME_PATTERN = /^[a-zA-Z0-9_\- ]{3,20}$/;

// Deliberately short — this is a light courtesy filter, not a moderation
// system. It blocks the most obvious slurs/profanity from ever reaching a
// public leaderboard without pretending to be exhaustive.
const BLOCKED_SUBSTRINGS = [
  "fuck",
  "shit",
  "bitch",
  "nigger",
  "nigga",
  "faggot",
  "cunt",
  "rape",
  "retard",
  "asshole",
];

export interface UsernameCheck {
  ok: boolean;
  reason?: string;
  clean?: string;
}

export function checkUsername(raw: string): UsernameCheck {
  const clean = raw.trim().replace(/\s+/g, " ");

  if (!clean) return { ok: false, reason: "Enter a callsign." };
  if (!USERNAME_PATTERN.test(clean)) {
    return {
      ok: false,
      reason:
        "3-20 characters: letters, numbers, spaces, - and _ only.",
    };
  }

  const lower = clean.toLowerCase();
  if (BLOCKED_SUBSTRINGS.some((bad) => lower.includes(bad))) {
    return { ok: false, reason: "Pick a different callsign." };
  }

  return { ok: true, clean };
}

export function clampScore(score: unknown, maxScore: number): number | null {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  const rounded = Math.round(score);
  if (rounded < 0 || rounded > maxScore) return null;
  return rounded;
}
