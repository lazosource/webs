import { Gamepad2, ShieldCheck, Trophy, Users } from "lucide-react";
import { GAMES } from "@/lib/games";
import { GameCard } from "@/components/game/GameCard";
import { LinkButton } from "@/components/ui/Button";
import { MatrixRain } from "@/components/site/MatrixRain";

const STATS = [
  { icon: Gamepad2, label: "Mini-games", value: `${GAMES.length}` },
  { icon: ShieldCheck, label: "Security domains covered", value: "9" },
  { icon: Trophy, label: "Leaderboards", value: `${GAMES.length + 1}` },
  { icon: Users, label: "Accounts required", value: "0" },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-surface-border">
        <MatrixRain className="absolute inset-0 h-full w-full opacity-40" />
        <div className="absolute inset-0 grid-fade" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-display uppercase tracking-widest text-primary mb-6">
            <ShieldCheck className="size-3.5" aria-hidden />
            Security skills, gamified
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-glow max-w-3xl mx-auto">
            Learn to think like a defender
          </h1>
          <p className="text-muted text-base md:text-lg mt-5 max-w-xl mx-auto">
            Twelve fast, sharp cybersecurity mini-games. Pick a callsign,
            play, and climb the leaderboard — no account, no email, no
            friction.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <LinkButton href="/games" size="lg">
              Browse the games
            </LinkButton>
            <LinkButton href="/leaderboard" size="lg" variant="ghost">
              View leaderboard
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-border">
        <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="size-5 text-primary mx-auto mb-2" aria-hidden />
              <p className="font-display text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              The full roster
            </h2>
            <p className="text-muted mt-2 max-w-lg">
              Every game teaches something different — from spotting a
              phishing email to prioritizing a flood of security alerts.
            </p>
          </div>
          <LinkButton href="/games" variant="ghost">
            See all {GAMES.length}
          </LinkButton>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.slice(0, 6).map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      <section className="border-t border-surface-border bg-background-elevated">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            One callsign, every leaderboard
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Pick a name once and it follows you across every game. Top the
            per-game boards, or stack your best runs for a shot at the
            global leaderboard.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <LinkButton href="/games">Start playing</LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
