"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertOctagon, Wrench } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD, Lives } from "@/components/games/GameHUD";

type Severity = "Critical" | "High" | "Medium" | "Low";

interface SeverityConfig {
  points: number;
  penalty: number;
  urgent: boolean;
  durationMs: number;
  classes: string;
}

const CONFIG: Record<Severity, SeverityConfig> = {
  Critical: { points: 100, penalty: 0, urgent: true, durationMs: 4200, classes: "border-rose-400/50 bg-rose-400/10 text-rose-400" },
  High: { points: 70, penalty: 0, urgent: true, durationMs: 5400, classes: "border-orange-400/50 bg-orange-400/10 text-orange-400" },
  Medium: { points: 0, penalty: 15, urgent: false, durationMs: 6800, classes: "border-amber-400/40 bg-amber-400/10 text-amber-400" },
  Low: { points: 0, penalty: 15, urgent: false, durationMs: 8200, classes: "border-sky-400/40 bg-sky-400/10 text-sky-400" },
};

const SEVERITY_WEIGHTS: [Severity, number][] = [
  ["Critical", 20],
  ["High", 25],
  ["Medium", 30],
  ["Low", 25],
];

function rollSeverity(): Severity {
  const total = SEVERITY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [sev, w] of SEVERITY_WEIGHTS) {
    if (r < w) return sev;
    r -= w;
  }
  return "Low";
}

const GRID_SIZE = 6;
const GAME_MS = 60_000;
const SPAWN_INTERVAL_MS = 1100;
const TICK_MS = 100;
const START_LIVES = 3;

interface VulnInstance {
  id: number;
  severity: Severity;
  spawnedAt: number;
}

type Flash = "hit" | "miss" | "waste";

export default function PatchPanicGame({ onFinish }: GamePlayProps) {
  const [slots, setSlots] = useState<(VulnInstance | null)[]>(() => Array(GRID_SIZE).fill(null));
  const [lives, setLives] = useState(START_LIVES);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(GAME_MS / 1000));
  const [flash, setFlash] = useState<Record<number, Flash>>({});

  const scoreRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const slotsRef = useRef<(VulnInstance | null)[]>(Array(GRID_SIZE).fill(null));
  const nextIdRef = useRef(1);
  // Both set for real in the effect below, not during render.
  const lastSpawnRef = useRef(0);
  const endAtRef = useRef(0);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish(scoreRef.current);
  }, [onFinish]);

  const flashSlot = useCallback((i: number, kind: Flash) => {
    setFlash((f) => ({ ...f, [i]: kind }));
    setTimeout(() => {
      setFlash((f) => {
        if (!(i in f)) return f;
        const next = { ...f };
        delete next[i];
        return next;
      });
    }, 400);
  }, []);

  useEffect(() => {
    const startedAt = Date.now();
    lastSpawnRef.current = startedAt;
    endAtRef.current = startedAt + GAME_MS;

    const id = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const next = [...slotsRef.current];

      for (let i = 0; i < next.length; i++) {
        const v = next[i];
        if (v && now - v.spawnedAt >= CONFIG[v.severity].durationMs) {
          if (CONFIG[v.severity].urgent) {
            livesRef.current -= 1;
            setLives(livesRef.current);
            flashSlot(i, "miss");
          }
          next[i] = null;
          changed = true;
        }
      }

      if (livesRef.current > 0 && now - lastSpawnRef.current >= SPAWN_INTERVAL_MS) {
        const freeIndices = next.reduce<number[]>((acc, v, i) => {
          if (!v) acc.push(i);
          return acc;
        }, []);
        if (freeIndices.length > 0) {
          const slot = freeIndices[Math.floor(Math.random() * freeIndices.length)];
          next[slot] = { id: nextIdRef.current++, severity: rollSeverity(), spawnedAt: now };
          lastSpawnRef.current = now;
          changed = true;
        }
      }

      if (changed) {
        slotsRef.current = next;
        setSlots(next);
      }

      const remaining = endAtRef.current - now;
      setSecondsLeft(Math.max(0, Math.ceil(remaining / 1000)));

      if (remaining <= 0 || livesRef.current <= 0) {
        clearInterval(id);
        finish();
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [finish, flashSlot]);

  const patch = useCallback(
    (i: number) => {
      const v = slotsRef.current[i];
      if (!v) return;
      const cfg = CONFIG[v.severity];
      if (cfg.urgent) {
        scoreRef.current += cfg.points;
        flashSlot(i, "hit");
      } else {
        scoreRef.current = Math.max(0, scoreRef.current - cfg.penalty);
        flashSlot(i, "waste");
      }
      setScoreDisplay(scoreRef.current);
      const next = [...slotsRef.current];
      next[i] = null;
      slotsRef.current = next;
      setSlots(next);
    },
    [flashSlot]
  );

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={
          <>
            <Lives count={lives} total={START_LIVES} />
            <span className="ml-3">0:{secondsLeft.toString().padStart(2, "0")}</span>
          </>
        }
        score={scoreDisplay}
        accentText="text-pink-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="mb-4 text-center text-xs text-muted">
          Patch Critical &amp; High before their ring runs out. Leave Medium/Low alone.
        </p>
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((v, i) => (
            <button
              key={i}
              disabled={!v}
              onClick={() => patch(i)}
              className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border p-4 transition-colors ${
                v ? CONFIG[v.severity].classes : "border-surface-border bg-surface/30"
              } ${flash[i] === "hit" ? "ring-2 ring-emerald-400" : ""} ${
                flash[i] === "miss" ? "ring-2 ring-danger" : ""
              } ${flash[i] === "waste" ? "ring-2 ring-muted" : ""}`}
            >
              {v ? (
                <>
                  <AlertOctagon className="size-5" aria-hidden />
                  <span className="font-display text-xs font-semibold uppercase tracking-wide">
                    {v.severity}
                  </span>
                  <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-black/20">
                    <div
                      key={v.id}
                      className="h-full origin-left bg-current"
                      style={{ animation: `shrink-x ${CONFIG[v.severity].durationMs}ms linear forwards` }}
                    />
                  </div>
                </>
              ) : (
                <Wrench className="size-4 text-muted/40" aria-hidden />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
