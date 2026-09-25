"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Globe } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD } from "@/components/games/GameHUD";
import { Button } from "@/components/ui/Button";

interface Pair {
  id: string;
  real: string;
  fake: string;
  tell: string;
}

// Note: a couple of these embed a genuine homograph (a Cyrillic look-alike
// character) in the fake domain, same trick real typosquatters use — that's
// the point of the exercise.
const PAIRS: Pair[] = [
  {
    id: "t1",
    real: "novabank.com",
    fake: "nоvabank.com",
    tell: "That's not a Latin \"o\" in the fake — it's a Cyrillic look-alike character. They render almost identically.",
  },
  {
    id: "t2",
    real: "zenithcloud.com",
    fake: "zenith-cloud.com",
    tell: "An inserted hyphen — a completely different, unrelated domain from the real one.",
  },
  {
    id: "t3",
    real: "parcelexpress.com",
    fake: "parcelexpresss.com",
    tell: "One extra \"s\" at the end — easy to miss at a glance, but it's a different domain entirely.",
  },
  {
    id: "t4",
    real: "streamplex.com",
    fake: "streampiex.com",
    tell: "The \"l\" has been swapped for an \"i\" — nearly identical in a lot of fonts.",
  },
  {
    id: "t5",
    real: "meridianair.com",
    fake: "meridianair.com.login-verify.net",
    tell: "The real domain is whatever sits right before the final slash — here, that's login-verify.net. Everything before it is a decoy subdomain.",
  },
  {
    id: "t6",
    real: "lumenhealth.com",
    fake: "lumenhealth.co",
    tell: "Wrong top-level domain — .co instead of .com is a completely different site.",
  },
  {
    id: "t7",
    real: "coralsystems.io",
    fake: "coralsysterns.io",
    tell: "\"rn\" has been swapped in for \"m\" — side by side, they're nearly indistinguishable in many fonts.",
  },
  {
    id: "t8",
    real: "artemisretail.com",
    fake: "artemis-retail-secure.com",
    tell: "Real brands don't bolt \"-secure\" onto their domain — that's a trust-signal trick, not an actual security feature.",
  },
  {
    id: "t9",
    real: "fenwick.edu",
    fake: "fenwick.edu.classportal.info",
    tell: "Same subdomain trick — the real domain is classportal.info, with \"fenwick.edu\" used as a fake-looking prefix.",
  },
  {
    id: "t10",
    real: "portsidelogistics.com",
    fake: "portsideloglstics.com",
    tell: "A lowercase \"L\" has been swapped in for an \"i\" — visually almost identical in most fonts.",
  },
];

const ROUNDS = PAIRS.length;
const ROUND_MS = 8000;
const CORRECT_BASE = 100;
const SPEED_BONUS_MAX = 50;
const WRONG_PENALTY = 30;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck() {
  return shuffle(PAIRS).map((pair) => ({
    pair,
    // true = real domain shown first (left)
    realFirst: Math.random() < 0.5,
  }));
}

type Phase = "question" | "feedback";

export default function TyposquatSpotterGame({ onFinish }: GamePlayProps) {
  const deck = useMemo(() => buildDeck(), []);
  const [round, setRound] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [picked, setPicked] = useState<"left" | "right" | null>(null);

  const scoreRef = useRef(0);
  // Set for real by the effect below (on mount, and again each round) —
  // initialized to 0 here so no impure call happens during render.
  const roundStartRef = useRef(0);
  const finishedRef = useRef(false);

  const { pair, realFirst } = deck[round];
  const left = realFirst ? pair.real : pair.fake;
  const right = realFirst ? pair.fake : pair.real;

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
    (side: "left" | "right") => {
      if (phase !== "question") return;
      const chosenIsReal = side === "left" ? realFirst : !realFirst;
      if (chosenIsReal) {
        const elapsed = Date.now() - roundStartRef.current;
        const speedBonus = Math.max(
          0,
          Math.round(((ROUND_MS - elapsed) / ROUND_MS) * SPEED_BONUS_MAX)
        );
        addScore(CORRECT_BASE + speedBonus);
      } else {
        addScore(-WRONG_PENALTY);
      }
      setPicked(side);
      setPhase("feedback");
    },
    [phase, realFirst, addScore]
  );

  const onTimeout = useCallback(() => {
    if (phase !== "question") return;
    addScore(-WRONG_PENALTY);
    setPicked(null);
    setPhase("feedback");
  }, [phase, addScore]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(goNext, 1800);
    return () => clearTimeout(t);
  }, [phase, goNext]);

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={<span>Round {round + 1} / {ROUNDS}</span>}
        score={scoreDisplay}
        accentText="text-lime-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="relative mb-5 h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
          {phase === "question" && (
            <div
              key={round}
              onAnimationEnd={onTimeout}
              className="h-full origin-left bg-lime-400"
              style={{ animation: `shrink-x ${ROUND_MS}ms linear forwards` }}
            />
          )}
        </div>

        <p className="mb-4 text-center text-sm text-muted">Which one is the real domain?</p>

        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          {([
            ["left", left],
            ["right", right],
          ] as const).map(([side, domain]) => {
            const isReal = side === "left" ? realFirst : !realFirst;
            const isPicked = side === picked;
            const showState = phase === "feedback";
            return (
              <button
                key={side}
                disabled={phase !== "question"}
                onClick={() => choose(side)}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-6 transition-colors ${
                  showState && isReal
                    ? "border-emerald-400/50 bg-emerald-400/10"
                    : showState && isPicked
                    ? "border-danger/50 bg-danger/10"
                    : "border-surface-border bg-surface hover:border-lime-400/40"
                }`}
              >
                <Globe className="size-4 text-muted" aria-hidden />
                <span className="break-all text-center font-mono text-sm">{domain}</span>
              </button>
            );
          })}
        </div>

        {phase === "feedback" && (
          <div className="mt-4 flex items-start justify-between gap-3">
            <p className="text-sm text-muted">{pair.tell}</p>
            <Button size="sm" variant="ghost" className="shrink-0" onClick={goNext}>
              Next <ArrowRight className="size-3.5" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
