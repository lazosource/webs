import type { GameAccent } from "./games";

// Tailwind v4 scans source files as plain text for literal class-name
// tokens, so a variant like `hover:border-cyan-400/30` only gets generated
// if that exact token appears somewhere verbatim — building it at runtime
// via `` `hover:${accent.border}` `` would silently produce no CSS. Every
// class this app needs, including variant-prefixed ones, is therefore
// spelled out in full below.
export const ACCENT_CLASSES: Record<
  GameAccent,
  {
    text: string;
    bg: string;
    border: string;
    ring: string;
    glow: string;
    gradient: string;
    /** Complete hover treatment for interactive cards (border + glow). */
    hoverCard: string;
  }
> = {
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    ring: "ring-cyan-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(34,211,238,0.55)]",
    gradient: "from-cyan-400/20 via-cyan-400/5 to-transparent",
    hoverCard:
      "hover:border-cyan-400/50 hover:shadow-[0_0_24px_-6px_rgba(34,211,238,0.55)]",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    ring: "ring-emerald-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(52,211,153,0.55)]",
    gradient: "from-emerald-400/20 via-emerald-400/5 to-transparent",
    hoverCard:
      "hover:border-emerald-400/50 hover:shadow-[0_0_24px_-6px_rgba(52,211,153,0.55)]",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/30",
    ring: "ring-violet-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(167,139,250,0.55)]",
    gradient: "from-violet-400/20 via-violet-400/5 to-transparent",
    hoverCard:
      "hover:border-violet-400/50 hover:shadow-[0_0_24px_-6px_rgba(167,139,250,0.55)]",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
    ring: "ring-orange-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(251,146,60,0.55)]",
    gradient: "from-orange-400/20 via-orange-400/5 to-transparent",
    hoverCard:
      "hover:border-orange-400/50 hover:shadow-[0_0_24px_-6px_rgba(251,146,60,0.55)]",
  },
  rose: {
    text: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/30",
    ring: "ring-rose-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(251,113,133,0.55)]",
    gradient: "from-rose-400/20 via-rose-400/5 to-transparent",
    hoverCard:
      "hover:border-rose-400/50 hover:shadow-[0_0_24px_-6px_rgba(251,113,133,0.55)]",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    ring: "ring-amber-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(251,191,36,0.55)]",
    gradient: "from-amber-400/20 via-amber-400/5 to-transparent",
    hoverCard:
      "hover:border-amber-400/50 hover:shadow-[0_0_24px_-6px_rgba(251,191,36,0.55)]",
  },
  sky: {
    text: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/30",
    ring: "ring-sky-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)]",
    gradient: "from-sky-400/20 via-sky-400/5 to-transparent",
    hoverCard:
      "hover:border-sky-400/50 hover:shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)]",
  },
  lime: {
    text: "text-lime-400",
    bg: "bg-lime-400/10",
    border: "border-lime-400/30",
    ring: "ring-lime-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(163,230,53,0.55)]",
    gradient: "from-lime-400/20 via-lime-400/5 to-transparent",
    hoverCard:
      "hover:border-lime-400/50 hover:shadow-[0_0_24px_-6px_rgba(163,230,53,0.55)]",
  },
  fuchsia: {
    text: "text-fuchsia-400",
    bg: "bg-fuchsia-400/10",
    border: "border-fuchsia-400/30",
    ring: "ring-fuchsia-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(232,121,249,0.55)]",
    gradient: "from-fuchsia-400/20 via-fuchsia-400/5 to-transparent",
    hoverCard:
      "hover:border-fuchsia-400/50 hover:shadow-[0_0_24px_-6px_rgba(232,121,249,0.55)]",
  },
  indigo: {
    text: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/30",
    ring: "ring-indigo-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(129,140,248,0.55)]",
    gradient: "from-indigo-400/20 via-indigo-400/5 to-transparent",
    hoverCard:
      "hover:border-indigo-400/50 hover:shadow-[0_0_24px_-6px_rgba(129,140,248,0.55)]",
  },
  teal: {
    text: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/30",
    ring: "ring-teal-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(45,212,191,0.55)]",
    gradient: "from-teal-400/20 via-teal-400/5 to-transparent",
    hoverCard:
      "hover:border-teal-400/50 hover:shadow-[0_0_24px_-6px_rgba(45,212,191,0.55)]",
  },
  pink: {
    text: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/30",
    ring: "ring-pink-400/40",
    glow: "shadow-[0_0_24px_-6px_rgba(244,114,182,0.55)]",
    gradient: "from-pink-400/20 via-pink-400/5 to-transparent",
    hoverCard:
      "hover:border-pink-400/50 hover:shadow-[0_0_24px_-6px_rgba(244,114,182,0.55)]",
  },
};
