"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, PhoneCall } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD } from "@/components/games/GameHUD";
import { Button } from "@/components/ui/Button";

interface Choice {
  text: string;
  points: 0 | 50 | 100;
  feedback: string;
}

interface Scenario {
  label: string;
  message: string;
  choices: Choice[];
}

const SCENARIOS: Scenario[] = [
  {
    label: "IT Helpdesk impersonation",
    message:
      "\"Hi, this is Marcus from IT. We're seeing weird login attempts on your account. Read me the verification code that just texted you so I can lock it down.\"",
    choices: [
      {
        text: "Read out the verification code.",
        points: 0,
        feedback: "That code is exactly what an attacker needs to get into your account. Real IT never asks for your MFA code.",
      },
      {
        text: "Call the IT helpdesk back on the number from the internal site to verify.",
        points: 100,
        feedback: "Verifying through a known, trusted channel — not the number that called you — is exactly right.",
      },
      {
        text: "Ask him to prove he's really from IT first.",
        points: 50,
        feedback: "Better than nothing, but a scammer can fake a badge number too. Hanging up and calling back is safer.",
      },
    ],
  },
  {
    label: "CEO wire-transfer request",
    message:
      "\"Hey, it's Sam (CEO). Stuck in a board meeting — need you to wire $9,400 to a new vendor today. Time-sensitive, don't loop in finance yet.\"",
    choices: [
      {
        text: "Process the wire immediately — it's urgent and from the CEO.",
        points: 0,
        feedback: "Urgency plus \"don't tell finance\" is the classic pattern of a business email compromise scam.",
      },
      {
        text: "Message the CEO on a separate, already-trusted channel to confirm first.",
        points: 100,
        feedback: "Confirming through a separate, known channel is exactly how you defuse a BEC attempt.",
      },
      {
        text: "Forward it to finance and let them decide.",
        points: 50,
        feedback: "A reasonable instinct, but you still haven't confirmed it's really the CEO — verify with them directly too.",
      },
    ],
  },
  {
    label: "Tech support scam",
    message:
      "\"This is Windows Support — we detected a virus on your computer. Install this remote access tool so I can fix it for you right now.\"",
    choices: [
      {
        text: "Install the remote access tool so they can help.",
        points: 0,
        feedback: "Legitimate vendors don't cold-call about viruses, and that tool hands over full control of your machine.",
      },
      {
        text: "Hang up and run a scan yourself with your own antivirus software.",
        points: 100,
        feedback: "Exactly right — real vendors don't cold call, and you stayed in control of your own machine.",
      },
      {
        text: "Ask for their employee ID before installing anything.",
        points: 50,
        feedback: "An ID number is trivial to fake over the phone — the safer move is to just hang up.",
      },
    ],
  },
  {
    label: "Prize / lottery scam",
    message:
      "\"Congratulations! You've won a $1,000 gift card. Enter your card details to cover a small $2 shipping fee to claim it.\"",
    choices: [
      {
        text: "Enter your card details — it's only $2.",
        points: 0,
        feedback: "There's no prize. This is a classic advance-fee scam built purely to harvest your card number.",
      },
      {
        text: "Delete the message and don't engage.",
        points: 100,
        feedback: "Correct — if you never entered a contest, there's no prize to claim. Don't engage at all.",
      },
      {
        text: "Reply asking to be removed from their list.",
        points: 50,
        feedback: "Replying confirms your contact is active, inviting more scams — better to just delete and ignore.",
      },
    ],
  },
  {
    label: "Fake recruiter",
    message:
      "\"I'm a recruiter at a great company — before we schedule an interview, I just need your SSN and driver's license for a background check.\"",
    choices: [
      {
        text: "Send the documents right away to keep things moving.",
        points: 0,
        feedback: "Real employers request documents like this only after an offer, through a secure, verified system.",
      },
      {
        text: "Decline for now and ask what verified service they'll use, later in the process.",
        points: 100,
        feedback: "Right instinct — legitimate background checks happen later, through a named, verifiable service.",
      },
      {
        text: "Ask a few more questions about the role before sending anything.",
        points: 50,
        feedback: "Better, but it dodges the real red flag: no legitimate recruiter needs your SSN before an offer.",
      },
    ],
  },
  {
    label: "Delivery text (smishing)",
    message:
      "SMS: \"Your package couldn't be delivered. Reschedule and pay a $1.99 fee here: [link]\"",
    choices: [
      {
        text: "Click the link and pay the fee.",
        points: 0,
        feedback: "Couriers don't collect surprise fees by text link — this is a textbook smishing scam.",
      },
      {
        text: "Open the courier's real app or site directly (not the link) to check status.",
        points: 100,
        feedback: "Exactly — bypass the link entirely and check through a channel you already trust.",
      },
      {
        text: "Reply STOP to the text.",
        points: 50,
        feedback: "Harmless, but it doesn't protect you — scam numbers often ignore opt-outs. Checking the real app is safer.",
      },
    ],
  },
];

const ROUNDS = SCENARIOS.length;
const ADVANCE_DELAY_MS = 2200;

type Phase = "question" | "feedback";

export default function SocialEngineeringGame({ onFinish }: GamePlayProps) {
  const [round, setRound] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  const scoreRef = useRef(0);
  const finishedRef = useRef(false);
  const current = SCENARIOS[round];

  const goNext = useCallback(() => {
    if (round + 1 >= ROUNDS) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinish(scoreRef.current);
      }
    } else {
      setRound((r) => r + 1);
      setPickedIndex(null);
      setPhase("question");
    }
  }, [round, onFinish]);

  const choose = useCallback(
    (index: number) => {
      if (phase !== "question") return;
      scoreRef.current += current.choices[index].points;
      setScoreDisplay(scoreRef.current);
      setPickedIndex(index);
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
        left={<span>Call {round + 1} / {ROUNDS}</span>}
        score={scoreDisplay}
        accentText="text-sky-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-5 rounded-xl border border-surface-border bg-surface/40 p-5">
          <div className="mb-2 flex items-center gap-2 font-display text-[11px] uppercase tracking-widest text-sky-400">
            <PhoneCall className="size-3.5" aria-hidden /> {current.label}
          </div>
          <p className="text-sm leading-relaxed italic text-foreground/90">{current.message}</p>
        </div>

        <div className="flex flex-col gap-2">
          {current.choices.map((choice, i) => {
            const showState = phase === "feedback";
            const isPicked = i === pickedIndex;
            return (
              <button
                key={choice.text}
                disabled={phase !== "question"}
                onClick={() => choose(i)}
                className={`rounded-lg border px-3.5 py-3 text-left text-sm transition-colors ${
                  showState && isPicked
                    ? choice.points === 100
                      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                      : choice.points === 50
                      ? "border-amber-400/50 bg-amber-400/10 text-amber-400"
                      : "border-danger/50 bg-danger/10 text-danger"
                    : "border-surface-border bg-surface hover:border-sky-400/40"
                }`}
              >
                {choice.text}
              </button>
            );
          })}
        </div>

        {phase === "feedback" && pickedIndex !== null && (
          <div className="mt-4 flex items-start justify-between gap-3">
            <p className="text-sm text-muted">
              <span className="font-display font-semibold text-foreground">
                +{current.choices[pickedIndex].points} —{" "}
              </span>
              {current.choices[pickedIndex].feedback}
            </p>
            <Button size="sm" variant="ghost" className="shrink-0" onClick={goNext}>
              Next <ArrowRight className="size-3.5" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
