// This page is intentionally static: it ships as part of the codebase and
// only changes when new code is pushed. There is no in-app editor for it —
// by design, visitors (including admins) can never alter it from the site
// itself.

export interface ChangelogEntry {
  date: string; // YYYY-MM-DD
  title: string;
  tag: "launch" | "feature" | "fix" | "planned";
  items: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-09-25",
    title: "CasperSource launches",
    tag: "launch",
    items: [
      "12 cybersecurity mini-games covering phishing, passwords, cryptography, network defense, malware analysis, web security, social engineering, incident response and vulnerability management.",
      "Callsign-based leaderboards: per-game rankings plus a global leaderboard that rewards playing across the whole roster.",
      "Signed session tokens and server-side plausibility checks on every score submission.",
    ],
  },
];

export const ROADMAP: string[] = [
  "Account-free purchases: cosmetic terminal themes and supporter badges next to your callsign.",
  "Weekly and monthly leaderboard resets alongside the all-time boards.",
  "More games: a red-team/blue-team CTF-style challenge and a lock-picking-style puzzle.",
  "Shareable result cards for socials.",
];
