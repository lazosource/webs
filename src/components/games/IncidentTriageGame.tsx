"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Siren } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD } from "@/components/games/GameHUD";

type Severity = "Low" | "Medium" | "High" | "Critical";
const LEVELS: Severity[] = ["Low", "Medium", "High", "Critical"];

interface Alert {
  asset: string;
  indicator: string;
  confidence: string;
  blastRadius: string;
  ideal: Severity;
}

const ALERTS: Alert[] = [
  {
    asset: "Public-facing web server",
    indicator: "Multiple failed admin logins from a new country, then one success",
    confidence: "High",
    blastRadius: "Full server compromise if the login was real",
    ideal: "Critical",
  },
  {
    asset: "Marketing intern's laptop",
    indicator: "One antivirus alert for adware bundled in a free download",
    confidence: "High",
    blastRadius: "Isolated to a single non-privileged laptop",
    ideal: "Low",
  },
  {
    asset: "Finance department file share",
    indicator: "Mass file-rename activity matching ransomware behavior",
    confidence: "High",
    blastRadius: "Could spread across the entire shared drive",
    ideal: "Critical",
  },
  {
    asset: "Internal wiki server",
    indicator: "TLS certificate expired yesterday",
    confidence: "N/A — configuration issue, not an attack",
    blastRadius: "Minor — browser warnings only",
    ideal: "Low",
  },
  {
    asset: "HR database",
    indicator: "One employee account accessed 500 records overnight — more than usual, same permissions as always",
    confidence: "Medium — could be a legitimate bulk export",
    blastRadius: "Sensitive PII involved",
    ideal: "High",
  },
  {
    asset: "Domain controller",
    indicator: "New admin-level account created outside change management",
    confidence: "High",
    blastRadius: "Could grant an attacker full domain control",
    ideal: "Critical",
  },
  {
    asset: "Guest WiFi network",
    indicator: "Port scan detected from a guest device",
    confidence: "Medium",
    blastRadius: "Isolated to the guest VLAN — no path to internal systems",
    ideal: "Medium",
  },
  {
    asset: "Customer support inbox",
    indicator: "One phishing email reported by an employee, who did not click",
    confidence: "High — confirmed phishing, contained",
    blastRadius: "None yet — but others may have received the same email",
    ideal: "Medium",
  },
];

const ROUNDS = ALERTS.length;
const GAME_MS = 75_000;
const ADVANCE_DELAY_MS = 1200;
const FULL_POINTS = 100;
const PARTIAL_POINTS = 50;

const SEVERITY_STYLES: Record<Severity, string> = {
  Low: "border-sky-400/40 bg-sky-400/10 text-sky-400 hover:bg-sky-400/20",
  Medium: "border-amber-400/40 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20",
  High: "border-orange-400/40 bg-orange-400/10 text-orange-400 hover:bg-orange-400/20",
  Critical: "border-rose-400/40 bg-rose-400/10 text-rose-400 hover:bg-rose-400/20",
};

type Phase = "question" | "feedback";

export default function IncidentTriageGame({ onFinish }: GamePlayProps) {
  const [round, setRound] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(GAME_MS / 1000));
  const [phase, setPhase] = useState<Phase>("question");
  const [picked, setPicked] = useState<Severity | null>(null);

  const scoreRef = useRef(0);
  // Set for real in the effect below, not during render.
  const endAtRef = useRef(0);
  const finishedRef = useRef(false);
  const current = ALERTS[round];

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish(scoreRef.current);
  }, [onFinish]);

  useEffect(() => {
    endAtRef.current = Date.now() + GAME_MS;
    const id = setInterval(() => {
      const remaining = endAtRef.current - Date.now();
      if (remaining <= 0) {
        clearInterval(id);
        setSecondsLeft(0);
        finish();
        return;
      }
      setSecondsLeft(Math.ceil(remaining / 1000));
    }, 200);
    return () => clearInterval(id);
  }, [finish]);

  const goNext = useCallback(() => {
    if (round + 1 >= ROUNDS || Date.now() >= endAtRef.current) {
      finish();
    } else {
      setRound((r) => r + 1);
      setPicked(null);
      setPhase("question");
    }
  }, [round, finish]);

  const choose = useCallback(
    (severity: Severity) => {
      if (phase !== "question") return;
      const diff = Math.abs(LEVELS.indexOf(severity) - LEVELS.indexOf(current.ideal));
      const points = diff === 0 ? FULL_POINTS : diff === 1 ? PARTIAL_POINTS : 0;
      scoreRef.current += points;
      setScoreDisplay(scoreRef.current);
      setPicked(severity);
      setPhase("feedback");
    },
    [phase, current]
  );

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(goNext, ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, goNext]);

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={<span>0:{secondsLeft.toString().padStart(2, "0")} · Alert {round + 1}/{ROUNDS}</span>}
        score={scoreDisplay}
        accentText="text-fuchsia-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-6 space-y-3 rounded-xl border border-surface-border bg-surface/40 p-5">
          <div className="flex items-center gap-2 font-display text-[11px] uppercase tracking-widest text-fuchsia-400">
            <Siren className="size-3.5" aria-hidden /> {current.asset}
          </div>
          <Row label="Indicator" value={current.indicator} />
          <Row label="Confidence" value={current.confidence} />
          <Row label="Blast radius" value={current.blastRadius} />
        </div>

        <p className="mb-2 text-center text-sm text-muted">Assign a severity</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {LEVELS.map((level) => {
            const showState = phase === "feedback";
            const isIdeal = level === current.ideal;
            const isPicked = level === picked;
            return (
              <button
                key={level}
                disabled={phase !== "question"}
                onClick={() => choose(level)}
                className={`rounded-lg border px-2 py-3 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
                  showState && isIdeal
                    ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-400"
                    : showState && isPicked
                    ? "border-danger/50 bg-danger/10 text-danger"
                    : SEVERITY_STYLES[level]
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>

        {phase === "feedback" && (
          <p className="mt-4 text-center text-sm text-muted">
            Expert call: <span className="font-semibold text-foreground">{current.ideal}</span>
            {picked === current.ideal ? " — exact match." : "."}
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-muted">{label}: </span>
      <span>{value}</span>
    </div>
  );
}
