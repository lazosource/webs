"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Database } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD } from "@/components/games/GameHUD";
import { Button } from "@/components/ui/Button";

interface Round {
  scenario: string;
  template: string;
  options: string[];
  answer: string;
  tell: string;
}

const ROUNDS_DATA: Round[] = [
  {
    scenario: "Login form",
    template: "SELECT * FROM users WHERE username='{input}' AND password='x7Gv…'",
    options: ["admin' -- ", "admin", "' password'", "admin123"],
    answer: "admin' -- ",
    tell: "Closing the quote and adding -- comments out the password check entirely — the query just becomes \"find the admin row.\"",
  },
  {
    scenario: "Product search box",
    template: "SELECT * FROM products WHERE name='{input}'",
    options: ["' OR '1'='1", "laptop", "' laptop '", "OR 1=1"],
    answer: "' OR '1'='1",
    tell: "' OR '1'='1 makes the WHERE clause true for every single row, dumping the entire products table.",
  },
  {
    scenario: "Coupon code field",
    template: "SELECT * FROM coupons WHERE code='{input}' AND active=1",
    options: ["' OR active=1 -- ", "SAVE10", "' SAVE10 '", "active=1"],
    answer: "' OR active=1 -- ",
    tell: "This closes the string, adds a condition that's always true, and comments out anything that might follow.",
  },
  {
    scenario: "\"Search by author\" box",
    template: "SELECT * FROM comments WHERE author='{input}'",
    options: [
      "' UNION SELECT username, password FROM users -- ",
      "jane_doe",
      "' OR name",
      "UNION SELECT *",
    ],
    answer: "' UNION SELECT username, password FROM users -- ",
    tell: "A UNION injection appends a second query, pulling columns from a completely different table — here, the users table.",
  },
  {
    scenario: "Forgot-password lookup",
    template: "SELECT * FROM users WHERE email='{input}'",
    options: ["nobody@x.com' OR '1'='1", "me@example.com", "' email '", "OR '1'='1'"],
    answer: "nobody@x.com' OR '1'='1",
    tell: "Even dressed up with a real-looking email prefix, closing the quote and adding an always-true clause matches every account.",
  },
  {
    scenario: "Admin login",
    template: "SELECT * FROM admins WHERE user='{input}' AND pass='{pw}'",
    options: ["' OR ''='", "admin", "' OR ''=", "OR ''=''"],
    answer: "' OR ''='",
    tell: "' OR ''=' is a compact always-true trick — two empty strings are always equal to each other.",
  },
];

const ROUNDS = ROUNDS_DATA.length;
const ROUND_MS = 18_000;
const ADVANCE_DELAY_MS = 1500;
const CORRECT_BASE = 150;
const SPEED_BONUS_MAX = 50;
const WRONG_PENALTY = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "question" | "feedback";

export default function SqlInjectionLabGame({ onFinish }: GamePlayProps) {
  const rounds = useMemo(
    () => ROUNDS_DATA.map((r) => ({ ...r, options: shuffle(r.options) })),
    []
  );
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
          Math.round(((ROUND_MS - elapsed) / ROUND_MS) * SPEED_BONUS_MAX)
        );
        addScore(CORRECT_BASE + speedBonus);
      } else {
        addScore(-WRONG_PENALTY);
      }
      setPicked(option);
      setPhase("feedback");
    },
    [phase, current, addScore]
  );

  const onTimeout = useCallback(() => {
    if (phase !== "question") return;
    addScore(-WRONG_PENALTY);
    setPicked(null);
    setPhase("feedback");
  }, [phase, addScore]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(goNext, ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, goNext]);

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={<span>Round {round + 1} / {ROUNDS}</span>}
        score={scoreDisplay}
        accentText="text-amber-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="relative mb-5 h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
          {phase === "question" && (
            <div
              key={round}
              onAnimationEnd={onTimeout}
              className="h-full origin-left bg-amber-400"
              style={{ animation: `shrink-x ${ROUND_MS}ms linear forwards` }}
            />
          )}
        </div>

        <div className="mb-5 rounded-xl border border-surface-border bg-surface/40 p-5">
          <div className="mb-2 flex items-center gap-2 font-display text-[11px] uppercase tracking-widest text-amber-400">
            <Database className="size-3.5" aria-hidden /> {current.scenario}
          </div>
          <p className="break-all font-mono text-xs leading-relaxed text-muted sm:text-sm">
            {current.template}
          </p>
        </div>

        <p className="mb-2 text-xs text-muted">
          Which input, typed into <code className="text-secondary">{"{input}"}</code>, would let an
          attacker in?
        </p>

        <div className="mt-1 flex flex-col gap-2">
          {current.options.map((opt) => {
            const isAnswer = opt === current.answer;
            const isPicked = opt === picked;
            const showState = phase === "feedback";
            return (
              <button
                key={opt}
                disabled={phase !== "question"}
                onClick={() => choose(opt)}
                className={`rounded-lg border px-3.5 py-2.5 text-left font-mono text-xs break-all transition-colors sm:text-sm ${
                  showState && isAnswer
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                    : showState && isPicked
                    ? "border-danger/50 bg-danger/10 text-danger"
                    : "border-surface-border bg-surface hover:border-amber-400/40"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {phase === "feedback" && (
          <div className="mt-4 flex items-start justify-between gap-3">
            <p className="text-sm text-muted">{current.tell}</p>
            <Button size="sm" variant="ghost" className="shrink-0" onClick={goNext}>
              Next <ArrowRight className="size-3.5" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
