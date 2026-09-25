import Link from "next/link";
import { ShieldHalf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-surface-border mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-muted">
          <ShieldHalf className="size-5 text-primary" aria-hidden />
          <span className="font-display text-sm">
            CasperSource — cybersecurity, gamified.
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link href="/games" className="hover:text-foreground transition-colors">
            Games
          </Link>
          <Link href="/leaderboard" className="hover:text-foreground transition-colors">
            Leaderboard
          </Link>
          <Link href="/changelog" className="hover:text-foreground transition-colors">
            Changelog
          </Link>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted/70">
        All games are self-contained simulations for security awareness and
        education — no real systems, credentials, or third parties are ever
        targeted or contacted.
      </p>
    </footer>
  );
}
