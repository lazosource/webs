import type { LucideIcon } from "lucide-react";
import {
  Mail,
  Lock,
  KeyRound,
  ShieldAlert,
  Bug,
  Database,
  PhoneCall,
  Globe,
  Siren,
  Brain,
  Radar,
  Wrench,
} from "lucide-react";

export type GameAccent =
  | "cyan"
  | "emerald"
  | "violet"
  | "orange"
  | "rose"
  | "amber"
  | "sky"
  | "lime"
  | "fuchsia"
  | "indigo"
  | "teal"
  | "pink";

export interface GameDef {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  icon: LucideIcon;
  accent: GameAccent;
  estimatedSeconds: number;
  /** Server-side plausibility ceiling used to reject obviously spoofed scores. */
  maxScore: number;
  /** Minimum elapsed ms between session start and score submission that is physically plausible. */
  minDurationMs: number;
  /** Short bullet list shown on the pre-game instructions screen. */
  howTo: string[];
}

export const GAMES: GameDef[] = [
  {
    slug: "phishing-detective",
    title: "Phishing Email Detective",
    tagline: "Spot the scam before you click.",
    description:
      "Ten inbox messages, one question each: legit or phishing? Read fast, look for the tells, and call it before the clock runs out.",
    category: "Social Engineering",
    icon: Mail,
    accent: "cyan",
    estimatedSeconds: 60,
    maxScore: 1600,
    minDurationMs: 12_000,
    howTo: [
      "10 emails, one at a time. Read the sender, subject and link.",
      "Mark each one Legit or Phishing before the round timer runs out.",
      "Faster correct answers score more — but wrong guesses cost you.",
    ],
  },
  {
    slug: "password-forge",
    title: "Password Strength Forge",
    tagline: "Forge unbreakable passwords under pressure.",
    description:
      "You've got 60 seconds. Type passwords that clear a rising strength bar without falling back on dictionary words or predictable patterns.",
    category: "Authentication",
    icon: Lock,
    accent: "emerald",
    estimatedSeconds: 60,
    maxScore: 1200,
    minDurationMs: 55_000,
    howTo: [
      "You have 60 seconds and an ever-tougher strength bar to clear.",
      "Type a password, watch the live strength meter, and lock it in once it passes.",
      "Nothing you type ever leaves your browser.",
    ],
  },
  {
    slug: "cipher-breaker",
    title: "Cipher Breaker",
    tagline: "Crack classic ciphers against the clock.",
    description:
      "Caesar shifts, Atbash, Base64 and hex — decode each scrambled message and pick the real plaintext before time runs out.",
    category: "Cryptography",
    icon: KeyRound,
    accent: "violet",
    estimatedSeconds: 75,
    maxScore: 2000,
    minDurationMs: 9_000,
    howTo: [
      "Each round shows a scrambled message and four candidate plaintexts.",
      "Work out the cipher (Caesar, Atbash, Base64 or hex) and pick the real one.",
      "The clock gets shorter each round — speed matters.",
    ],
  },
  {
    slug: "firewall-defense",
    title: "Firewall Defense",
    tagline: "Allow the good traffic. Block the rest.",
    description:
      "Packets stream in against a rule set that keeps changing. Triage each one before it reaches the edge — three misses and you're breached.",
    category: "Network Security",
    icon: ShieldAlert,
    accent: "orange",
    estimatedSeconds: 90,
    maxScore: 4000,
    minDurationMs: 1_500,
    howTo: [
      "Packets approach one at a time, each with a source, port and protocol.",
      "Click Allow or Block against the current firewall policy shown at the top.",
      "The policy changes over time. Three misses and it's game over.",
    ],
  },
  {
    slug: "malware-sorting",
    title: "Malware Sorting Hat",
    tagline: "Classify the threat before it spreads.",
    description:
      "A stream of malware behavior reports needs sorting into the right bin: virus, worm, trojan, ransomware, spyware or rootkit.",
    category: "Malware Analysis",
    icon: Bug,
    accent: "rose",
    estimatedSeconds: 60,
    maxScore: 6000,
    minDurationMs: 55_000,
    howTo: [
      "A behavior report appears — read what the malware actually does.",
      "Sort it into the right bin: Virus, Worm, Trojan, Ransomware, Spyware or Rootkit.",
      "60 seconds on the clock. Wrong sorts cost points, so don't just guess.",
    ],
  },
  {
    slug: "sql-injection-lab",
    title: "SQL Injection Escape Room",
    tagline: "Find the flaw in the query, safely.",
    description:
      "A fully simulated, sandboxed login form — no real database involved. Study each vulnerable query template and pick the input that would break its logic.",
    category: "Web Security",
    icon: Database,
    accent: "amber",
    estimatedSeconds: 90,
    maxScore: 1800,
    minDurationMs: 7_000,
    howTo: [
      "Fully simulated — no real database or network request is ever made.",
      "Each round shows a vulnerable login query template and four candidate inputs.",
      "Pick the input that would break the query's logic and let an attacker in.",
    ],
  },
  {
    slug: "social-engineering-sim",
    title: "Social Engineering Call Simulator",
    tagline: "Talk your way out of the trap.",
    description:
      "Six scripted calls from fake IT, fake execs and fake prize departments. Choose your responses and keep every secret exactly where it belongs.",
    category: "Social Engineering",
    icon: PhoneCall,
    accent: "sky",
    estimatedSeconds: 120,
    maxScore: 900,
    minDurationMs: 9_000,
    howTo: [
      "Six calls, each from someone who wants something they shouldn't have.",
      "Pick your response from three options at each step.",
      "Stall, verify and refuse for full marks — oversharing tanks your score.",
    ],
  },
  {
    slug: "typosquat-spotter",
    title: "Typosquat Spotter",
    tagline: "Real domain, or a lookalike trap?",
    description:
      "Two nearly identical URLs, one real site. Catch the homograph swap, the extra hyphen and the sneaky subdomain before you'd ever type a password.",
    category: "Web Security",
    icon: Globe,
    accent: "lime",
    estimatedSeconds: 60,
    maxScore: 1600,
    minDurationMs: 12_000,
    howTo: [
      "Two browser mockups, one real domain and one lookalike.",
      "Check for homograph swaps, extra hyphens and sneaky subdomains.",
      "Pick the real one before time runs out — 10 rounds total.",
    ],
  },
  {
    slug: "incident-triage",
    title: "Incident Response Triage",
    tagline: "Prioritize the alerts that matter most.",
    description:
      "Eight alerts hit the queue at once. Assign the right severity to each before the shift clock runs out and something critical slips through.",
    category: "Incident Response",
    icon: Siren,
    accent: "fuchsia",
    estimatedSeconds: 75,
    maxScore: 900,
    minDurationMs: 7_000,
    howTo: [
      "8 alerts land in your queue with asset, confidence and blast-radius info.",
      "Assign each one a severity: Critical, High, Medium or Low.",
      "Closer to the expert call scores more — you're racing the shift clock.",
    ],
  },
  {
    slug: "trivia-rush",
    title: "Cybersecurity Trivia Rush",
    tagline: "How deep does your knowledge go?",
    description:
      "Rapid-fire questions on the CIA triad, encryption, famous attacks and everyday best practices. Chain correct answers for a streak multiplier.",
    category: "General Knowledge",
    icon: Brain,
    accent: "indigo",
    estimatedSeconds: 60,
    maxScore: 8000,
    minDurationMs: 55_000,
    howTo: [
      "60 seconds, rapid-fire multiple choice on all things cybersecurity.",
      "Chain correct answers for a streak multiplier — up to 3x.",
      "A wrong answer resets your streak, so pace yourself.",
    ],
  },
  {
    slug: "packet-hunter",
    title: "Packet Sniffer Anomaly Hunter",
    tagline: "Find the needle in the traffic log.",
    description:
      "Three connection logs, a handful of anomalies buried in each. Flag the beaconing, the odd ports and the 3am exfil before the round ends.",
    category: "Network Security",
    icon: Radar,
    accent: "teal",
    estimatedSeconds: 90,
    maxScore: 1400,
    minDurationMs: 4_500,
    howTo: [
      "Three connection logs, a handful of anomalies hidden in each.",
      "Click a row to flag it as suspicious — beaconing, odd ports, late-night exfil.",
      "Precision matters: false flags cost points too.",
    ],
  },
  {
    slug: "patch-panic",
    title: "Patch Panic",
    tagline: "Fix what's critical. Ignore what can wait.",
    description:
      "Vulnerabilities land on your server grid with a countdown ring. Patch the criticals before they expire — chasing low-severity noise costs you.",
    category: "Vulnerability Management",
    icon: Wrench,
    accent: "pink",
    estimatedSeconds: 60,
    maxScore: 4000,
    minDurationMs: 3_000,
    howTo: [
      "Vulnerabilities land on your server grid with a shrinking countdown ring.",
      "Patch Critical and High severity ones before their ring runs out.",
      "Ignore Medium/Low — chasing them wastes time you don't have. 3 lives.",
    ],
  },
];

export const GAME_MAP: Record<string, GameDef> = Object.fromEntries(
  GAMES.map((g) => [g.slug, g])
);

export function getGame(slug: string): GameDef | undefined {
  return GAME_MAP[slug];
}
