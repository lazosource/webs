"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD } from "@/components/games/GameHUD";
import { Button } from "@/components/ui/Button";

const WORD_POOL = [
  "FIREWALL",
  "MALWARE",
  "PHISHING",
  "ENCRYPT",
  "BACKDOOR",
  "ROOTKIT",
  "EXPLOIT",
  "PAYLOAD",
  "KEYLOGGER",
  "SPOOFING",
  "BOTNET",
  "RANSOMWARE",
  "SANDBOX",
  "CIPHER",
  "PATCH",
  "TROJAN",
];

const CIPHERS = ["caesar", "atbash", "base64", "hex"] as const;
const ROUND_SECONDS = [14, 13, 12, 11, 10, 9, 8, 7];
const ROUNDS = ROUND_SECONDS.length;
const CORRECT_BASE = 150;
const SPEED_BONUS_MAX = 50;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function caesarEncode(s: string, shift: number): string {
  return s.replace(/[A-Z]/g, (c) =>
    String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65)
  );
}

function atbashEncode(s: string): string {
  return s.replace(/[A-Z]/g, (c) => String.fromCharCode(90 - (c.charCodeAt(0) - 65)));
}

function hexEncode(s: string): string {
  return [...s].map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
}

interface Round {
  label: string;
  ciphertext: string;
  options: string[];
  answer: string;
}

function buildRounds(): Round[] {
  const words = shuffle(WORD_POOL).slice(0, ROUNDS);
  return words.map((word, i) => {
    const cipherType = CIPHERS[i % CIPHERS.length];
    let ciphertext = "";
    let label = "";
    if (cipherType === "caesar") {
      const shift = 1 + Math.floor(Math.random() * 25);
      ciphertext = caesarEncode(word, shift);
      label = "Caesar shift";
    } else if (cipherType === "atbash") {
      ciphertext = atbashEncode(word);
      label = "Atbash";
    } else if (cipherType === "base64") {
      ciphertext = btoa(word);
      label = "Base64";
    } else {
      ciphertext = hexEncode(word);
      label = "Hex bytes";
    }
    const distractors = shuffle(WORD_POOL.filter((w) => w !== word)).slice(0, 3);
    const options = shuffle([word, ...distractors]);
    return { label, ciphertext, options, answer: word };
  });
}

type Phase = "question" | "feedback";

export default function CipherBreakerGame({ onFinish }: GamePlayProps) {
  const rounds = useMemo(() => buildRounds(), []);
  const [round, setRound] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [picked, setPicked] = useState<string | null>(null);

  const scoreRef = useRef(0);
  // Set for real by the effect below (on mount, and again each round) —
  // initialized to 0 here so no impure call happens during render.
  const roundStartRef = useRef(0);
  const finishedRef = useRef(false);

  const current = rounds[round];
  const roundMs = ROUND_SECONDS[round] * 1000;

  useEffect(() => {
    roundStartRef.current = Date.now();
  }, [round]);

  const addScore = useCallback((delta: number) => {
    scoreRef.current = Math.max(0, scoreRef.current + delta);
    setScoreDisplay(scoreRef.current);
  }, []);

  const goNext = useCallback(() => {
    if (round + 1 >= ROUNDS) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinish(scoreRef.current);
      }
    } else {
      setRound((r) => r + 1);
      setPicked(null);
      setPhase("question");
    }
  }, [round, onFinish]);

  const choose = useCallback(
    (option: string) => {
      if (phase !== "question") return;
      const correct = option === current.answer;
      if (correct) {
        const elapsed = Date.now() - roundStartRef.current;
        const speedBonus = Math.max(
          0,
          Math.round(((roundMs - elapsed) / roundMs) * SPEED_BONUS_MAX)
        );
        addScore(CORRECT_BASE + speedBonus);
      }
      setPicked(option);
      setPhase("feedback");
    },
    [phase, current, roundMs, addScore]
  );

  const onTimeout = useCallback(() => {
    if (phase !== "question") return;
    setPicked(null);
    setPhase("feedback");
  }, [phase]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(goNext, 1500);
    return () => clearTimeout(t);
  }, [phase, goNext]);

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={<span>Round {round + 1} / {ROUNDS}</span>}
        score={scoreDisplay}
        accentText="text-violet-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="relative mb-5 h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
          {phase === "question" && (
            <div
              key={round}
              onAnimationEnd={onTimeout}
              className="h-full origin-left bg-violet-400"
              style={{ animation: `shrink-x ${roundMs}ms linear forwards` }}
            />
          )}
        </div>

        <div className="mb-6 rounded-xl border border-surface-border bg-surface/40 p-5 text-center">
          <p className="mb-3 font-display text-[11px] uppercase tracking-widest text-violet-400">
            {current.label}
          </p>
          <p className="break-all font-mono text-lg tracking-wide">{current.ciphertext}</p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2.5">
          {current.options.map((opt) => {
            const isAnswer = opt === current.answer;
            const isPicked = opt === picked;
            const showState = phase === "feedback";
            return (
              <button
                key={opt}
                disabled={phase !== "question"}
                onClick={() => choose(opt)}
                className={`rounded-lg border px-3 py-3 font-mono text-sm font-medium transition-colors ${
                  showState && isAnswer
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                    : showState && isPicked
                    ? "border-danger/50 bg-danger/10 text-danger"
                    : "border-surface-border bg-surface hover:border-violet-400/40"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {phase === "feedback" && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted">
              {picked === current.answer ? "Correct." : `It was ${current.answer}.`}
            </p>
            <Button size="sm" variant="ghost" onClick={goNext}>
              Next <ArrowRight className="size-3.5" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
