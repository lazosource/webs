"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD } from "@/components/games/GameHUD";
import { Button } from "@/components/ui/Button";

const GAME_MS = 60_000;
const THRESHOLDS = [40, 55, 65, 75, 82, 88, 92];

const COMMON_WORDS = [
  "password",
  "123456",
  "qwerty",
  "letmein",
  "admin",
  "welcome",
  "monkey",
  "dragon",
  "football",
  "iloveyou",
  "master",
  "login",
  "abc123",
  "000000",
  "111111",
  "sunshine",
  "princess",
  "superman",
  "batman",
  "trustno1",
];

const SEQUENCES = [
  "0123456789",
  "abcdefghijklmnopqrstuvwxyz",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

function hasSequential(lower: string): boolean {
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= seq.length - 4; i++) {
      if (lower.includes(seq.slice(i, i + 4))) return true;
    }
  }
  return false;
}

function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  score += Math.min(40, pw.length * 3);

  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
  score += [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length * 12;

  if (/(.)\1{2,}/.test(pw)) score -= 20;

  const lower = pw.toLowerCase();
  if (hasSequential(lower)) score -= 15;
  if (COMMON_WORDS.some((w) => lower.includes(w))) score -= 40;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function meterColor(strength: number): string {
  if (strength >= 75) return "bg-emerald-400";
  if (strength >= 45) return "bg-amber-400";
  return "bg-danger";
}

export default function PasswordForgeGame({ onFinish }: GamePlayProps) {
  const [value, setValue] = useState("");
  const [tier, setTier] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(GAME_MS / 1000));
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [lockedCount, setLockedCount] = useState(0);

  const scoreRef = useRef(0);
  const usedRef = useRef(new Set<string>());
  // Set for real in the effect below, not during render.
  const endAtRef = useRef(0);
  const finishedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const strength = scorePassword(value);
  const threshold = THRESHOLDS[Math.min(tier, THRESHOLDS.length - 1)];
  const canLock = strength >= threshold && value.trim().length > 0;

  useEffect(() => {
    endAtRef.current = Date.now() + GAME_MS;
    const id = setInterval(() => {
      const remaining = endAtRef.current - Date.now();
      if (remaining <= 0) {
        clearInterval(id);
        setSecondsLeft(0);
        if (!finishedRef.current) {
          finishedRef.current = true;
          onFinish(scoreRef.current);
        }
        return;
      }
      setSecondsLeft(Math.ceil(remaining / 1000));
    }, 200);
    return () => clearInterval(id);
  }, [onFinish]);

  const lockIn = useCallback(() => {
    if (!canLock) return;
    const key = value.trim().toLowerCase();
    if (usedRef.current.has(key)) {
      setDuplicateWarning(true);
      return;
    }
    usedRef.current.add(key);
    scoreRef.current += strength;
    setScoreDisplay(scoreRef.current);
    setLockedCount((c) => c + 1);
    setTier((t) => t + 1);
    setValue("");
    setDuplicateWarning(false);
    inputRef.current?.focus();
  }, [canLock, value, strength]);

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={<span>0:{secondsLeft.toString().padStart(2, "0")}</span>}
        score={scoreDisplay}
        accentText="text-emerald-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between font-display text-xs uppercase tracking-widest text-muted">
          <span>Target strength</span>
          <span className="text-emerald-400">{threshold}%+</span>
        </div>

        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-border">
          <div
            className={`h-full transition-all duration-150 ${meterColor(strength)}`}
            style={{ width: `${strength}%` }}
          />
        </div>
        <p className="mb-5 text-right font-display text-xs text-muted">{strength}%</p>

        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setDuplicateWarning(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") lockIn();
            }}
            placeholder="Type a password…"
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-lg border border-surface-border bg-surface px-3.5 py-3 pl-10 font-mono text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        {duplicateWarning && (
          <p className="mt-2 text-xs text-danger">
            Already used this round — try a genuinely different password.
          </p>
        )}

        <Button className="mt-4" disabled={!canLock} onClick={lockIn}>
          <Lock className="size-4" aria-hidden /> Lock it in
        </Button>

        <p className="mt-auto pt-6 text-center text-xs text-muted">
          {lockedCount} password{lockedCount === 1 ? "" : "s"} forged this round
        </p>
      </div>
    </div>
  );
}
