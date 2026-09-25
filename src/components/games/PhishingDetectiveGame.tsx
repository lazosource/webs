"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Flag } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD } from "@/components/games/GameHUD";
import { Button } from "@/components/ui/Button";

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  link?: string;
  isPhishing: boolean;
  tell: string;
}

const EMAILS: Email[] = [
  {
    id: "p1",
    from: "NovaBank Security <alerts@novabank-secure-verify.com>",
    subject: "Urgent: Verify your account now or it will be suspended",
    preview:
      "We detected unusual activity. Click below within 24 hours to confirm your identity and avoid suspension.",
    link: "novabank-secure-verify.com/login",
    isPhishing: true,
    tell: "The domain isn't novabank.com, and the threat + 24-hour deadline is classic urgency pressure.",
  },
  {
    id: "p2",
    from: "IT Helpdesk <support@company-helpdesk-it.net>",
    subject: "Password expiration notice",
    preview:
      "Your password expires today. Use the link below to reset it immediately to avoid being locked out.",
    link: "company-helpdesk-it.net/reset",
    isPhishing: true,
    tell: "A real IT team's domain would match your company's — this one is a generic lookalike.",
  },
  {
    id: "p3",
    from: "Parcel Express <tracking@parcelexpress-delivery.info>",
    subject: "Delivery failed — action required",
    preview:
      "We attempted delivery but couldn't access your address. Pay a $2.99 redelivery fee to reschedule.",
    link: "parcelexpress-delivery.info/pay",
    isPhishing: true,
    tell: "Couriers don't collect surprise fees by email link, and .info + a lookalike domain is a red flag.",
  },
  {
    id: "p4",
    from: "Zenith Cloud Storage <no-reply@zenithcloud-files.co>",
    subject: "Someone shared a file with you",
    preview: "Click to view the shared document before it expires in 3 hours.",
    link: "zenithcloud-files.co/view",
    isPhishing: true,
    tell: "The real service lives at zenithcloud.com — \"-files.co\" is a spoofed variant, plus a fake countdown.",
  },
  {
    id: "p5",
    from: "HR Department <hr@yourcompany-payroll-update.com>",
    subject: "Update your direct deposit information",
    preview:
      "Please confirm your banking details using the secure form linked below before Friday's payroll run.",
    link: "yourcompany-payroll-update.com/form",
    isPhishing: true,
    tell: "HR asking for banking details through an emailed link — and a domain that isn't your company's — is a classic payroll scam.",
  },
  {
    id: "p6",
    from: "StreamPlex <billing@streamplex-account.com>",
    subject: "Your payment could not be processed",
    preview:
      "Update your payment method within 48 hours or your subscription will be cancelled.",
    link: "streamplex-account.com/billing",
    isPhishing: true,
    tell: "streamplex-account.com isn't streamplex.com — a lookalike domain paired with a cancellation threat.",
  },
  {
    id: "p7",
    from: "CEO Alex Turner <alex.turner.ceo@gmail.com>",
    subject: "Quick favor — need this today",
    preview:
      "I'm in back-to-back meetings. Can you buy 5 gift cards and send me the codes? I'll pay you back.",
    isPhishing: true,
    tell: "A CEO emailing from a personal Gmail account asking for gift cards is a textbook executive-impersonation scam.",
  },
  {
    id: "p8",
    from: "National Tax Office <refunds@tax-office-gov-refunds.com>",
    subject: "You are eligible for a tax refund",
    preview: "Submit your bank details within 5 days to claim your refund of $482.17.",
    link: "tax-office-gov-refunds.com/claim",
    isPhishing: true,
    tell: "Government agencies don't request bank details over email — and real .gov domains don't look like this.",
  },
  {
    id: "l1",
    from: "NovaBank <statements@novabank.com>",
    subject: "Your March statement is ready",
    preview:
      "Log in to novabank.com through your usual bookmark or app to view your latest statement. No action needed.",
    isPhishing: false,
    tell: "Matches the bank's real domain, no urgency, and it points you to log in the normal way instead of a link.",
  },
  {
    id: "l2",
    from: "GitHub <notifications@github.com>",
    subject: "[casper/webs] New pull request opened",
    preview: "alice opened pull request #42: Fix typo in README.",
    isPhishing: false,
    tell: "A routine notification from GitHub's real domain — no credentials or payment requested.",
  },
  {
    id: "l3",
    from: "Calendar <calendar-notifications@company.com>",
    subject: "Reminder: Team standup in 15 minutes",
    preview: "Your meeting \"Daily Standup\" starts at 10:00 AM in Room 4B.",
    isPhishing: false,
    tell: "A routine internal calendar reminder from your company's own domain.",
  },
  {
    id: "l4",
    from: "Zenith Cloud Storage <no-reply@zenithcloud.com>",
    subject: "Your storage is 80% full",
    preview: "Consider upgrading your plan in account settings whenever you get a chance. No rush.",
    isPhishing: false,
    tell: "Correct root domain (zenithcloud.com, not a lookalike) and there's no urgency or link to click immediately.",
  },
  {
    id: "l5",
    from: "StreamPlex <no-reply@streamplex.com>",
    subject: "New season now streaming",
    preview: "The new season of \"Late Signal\" just dropped. Happy watching!",
    isPhishing: false,
    tell: "Plain marketing email from the real streamplex.com domain — nothing is being requested of you.",
  },
  {
    id: "l6",
    from: "HR Department <hr@yourcompany.com>",
    subject: "Open enrollment starts Monday",
    preview: "Benefits open enrollment runs Nov 1–15. Log in to the HR portal directly to review your options.",
    isPhishing: false,
    tell: "Correct internal domain, and it tells you to go to the portal yourself rather than click a link.",
  },
  {
    id: "l7",
    from: "Parcel Express <tracking@parcelexpress.com>",
    subject: "Your package was delivered",
    preview: "Package #48213 was delivered to your front porch at 2:14 PM today.",
    isPhishing: false,
    tell: "Purely informational, correct domain, and no payment or personal info is requested.",
  },
  {
    id: "l8",
    from: "Account Security <security@company.com>",
    subject: "New sign-in to your account",
    preview:
      "We noticed a new sign-in from Chrome on Windows in Austin, TX. If this was you, no action is needed.",
    isPhishing: false,
    tell: "A standard security notice from your real domain — informational, and doesn't ask you to click anything.",
  },
];

const ROUNDS = 10;
const ROUND_MS = 8000;
const CORRECT_BASE = 100;
const SPEED_BONUS_MAX = 50;
const WRONG_PENALTY = 40;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "question" | "feedback";

export default function PhishingDetectiveGame({ onFinish }: GamePlayProps) {
  const deck = useMemo(() => shuffle(EMAILS).slice(0, ROUNDS), []);
  const [round, setRound] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [selected, setSelected] = useState<"legit" | "phishing" | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);

  const scoreRef = useRef(0);
  // Set for real by the effect below (on mount, and again each round) —
  // initialized to 0 here so no impure call happens during render.
  const roundStartRef = useRef(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    roundStartRef.current = Date.now();
  }, [round]);

  const current = deck[round];

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
      setSelected(null);
      setPhase("question");
    }
  }, [round, onFinish]);

  const answer = useCallback(
    (choice: "legit" | "phishing") => {
      if (phase !== "question") return;
      const correct = (choice === "phishing") === current.isPhishing;
      const elapsed = Date.now() - roundStartRef.current;
      const speedBonus = correct
        ? Math.max(0, Math.round(((ROUND_MS - elapsed) / ROUND_MS) * SPEED_BONUS_MAX))
        : 0;
      addScore(correct ? CORRECT_BASE + speedBonus : -WRONG_PENALTY);
      setSelected(choice);
      setWasCorrect(correct);
      setPhase("feedback");
    },
    [phase, current, addScore]
  );

  const onTimeout = useCallback(() => {
    if (phase !== "question") return;
    addScore(-WRONG_PENALTY);
    setSelected(null);
    setWasCorrect(false);
    setPhase("feedback");
  }, [phase, addScore]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(goNext, 1600);
    return () => clearTimeout(t);
  }, [phase, goNext]);

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={<span>Round {round + 1} / {ROUNDS}</span>}
        score={scoreDisplay}
        accentText="text-cyan-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="relative mb-5 h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
          {phase === "question" && (
            <div
              key={round}
              onAnimationEnd={onTimeout}
              className="h-full origin-left bg-cyan-400"
              style={{ animation: `shrink-x ${ROUND_MS}ms linear forwards` }}
            />
          )}
        </div>

        <div className="mb-6 space-y-2.5 rounded-xl border border-surface-border bg-surface/40 p-5">
          <p className="font-display text-[11px] uppercase tracking-widest text-muted">From</p>
          <p className="text-sm break-all">{current.from}</p>
          <div className="my-2 h-px bg-surface-border" />
          <p className="font-semibold leading-snug">{current.subject}</p>
          <p className="text-sm text-muted leading-relaxed">{current.preview}</p>
          {current.link && (
            <div className="mt-2 inline-block rounded bg-background-elevated px-2 py-1 font-mono text-xs text-secondary break-all">
              {current.link}
            </div>
          )}
        </div>

        {phase === "question" ? (
          <div className="mt-auto grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => answer("legit")}>
              <CheckCircle2 className="size-4" aria-hidden /> Legit
            </Button>
            <Button variant="danger" onClick={() => answer("phishing")}>
              <Flag className="size-4" aria-hidden /> Phishing
            </Button>
          </div>
        ) : (
          <div
            className={`mt-auto rounded-xl border p-4 ${
              wasCorrect ? "border-emerald-400/40 bg-emerald-400/10" : "border-danger/40 bg-danger/10"
            }`}
          >
            <p className="font-display text-sm font-semibold mb-1">
              {wasCorrect ? "Correct" : selected ? "Not quite" : "Time's up"}
            </p>
            <p className="text-sm text-muted">{current.tell}</p>
            <Button size="sm" variant="ghost" className="mt-3" onClick={goNext}>
              Continue <ArrowRight className="size-3.5" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
