"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD } from "@/components/games/GameHUD";

interface Question {
  q: string;
  options: string[];
  answer: number;
}

const QUESTIONS: Question[] = [
  { q: "What does the \"C\" in the CIA triad stand for?", options: ["Confidentiality", "Control", "Compliance", "Cryptography"], answer: 0 },
  { q: "What does the \"I\" in the CIA triad stand for?", options: ["Identity", "Integrity", "Isolation", "Inspection"], answer: 1 },
  { q: "What does the \"A\" in the CIA triad stand for?", options: ["Authentication", "Authorization", "Availability", "Accountability"], answer: 2 },
  { q: "In multi-factor authentication, which is something you \"have\"?", options: ["A password", "A fingerprint", "A hardware security key", "Your mother's maiden name"], answer: 2 },
  { q: "What is \"phishing\"?", options: ["Scanning a network for open ports", "Tricking someone into revealing sensitive info via deceptive messages", "Overloading a server with traffic", "Encrypting files for ransom"], answer: 1 },
  { q: "What does a firewall primarily do?", options: ["Encrypts stored data", "Filters network traffic based on rules", "Detects malware signatures on disk", "Backs up files automatically"], answer: 1 },
  { q: "What is two-factor authentication (2FA)?", options: ["Using two different passwords", "Requiring two independent forms of verification", "Logging in twice", "Having two user accounts"], answer: 1 },
  { q: "What is a \"zero-day\" vulnerability?", options: ["A bug that's been public for zero days", "A flaw unknown to the vendor with no patch yet", "A vulnerability that causes zero damage", "An expired security certificate"], answer: 1 },
  { q: "What does HTTPS add to HTTP?", options: ["Faster page loads", "Encrypted communication via TLS/SSL", "Automatic virus scanning", "Ad blocking"], answer: 1 },
  { q: "What is \"ransomware\"?", options: ["Malware that mines cryptocurrency", "Malware that encrypts files and demands payment", "Software that silently steals passwords", "A fake antivirus program"], answer: 1 },
  { q: "What best describes a DDoS attack?", options: ["Stealing data slowly over time", "Flooding a target with traffic to knock it offline", "Guessing passwords repeatedly", "Installing a hidden backdoor"], answer: 1 },
  { q: "What is the purpose of encryption?", options: ["To compress data for storage", "To make data unreadable without the right key", "To delete data securely", "To back data up to the cloud"], answer: 1 },
  { q: "What is a VPN primarily used for?", options: ["Blocking all internet access", "Creating an encrypted tunnel for network traffic", "Speeding up your connection", "Scanning for malware"], answer: 1 },
  { q: "What is \"social engineering\"?", options: ["Building secure software architecture", "Manipulating people into giving up confidential info", "Designing a company's org chart", "Engineering network hardware"], answer: 1 },
  { q: "What does \"patching\" software mean?", options: ["Reinstalling the OS", "Applying updates that fix known bugs or flaws", "Changing the color scheme", "Uninstalling unused apps"], answer: 1 },
  { q: "What is a \"brute-force\" attack?", options: ["Physically breaking into a data center", "Trying many password combos until one works", "Sending spam emails", "Exploiting a bug directly"], answer: 1 },
  { q: "What's the main risk of reusing passwords across sites?", options: ["It's harder to remember", "One breach can expose access everywhere", "It makes typing slower", "It uses more storage"], answer: 1 },
  { q: "What is \"malware\"?", options: ["Any outdated software", "Software designed to cause harm or unauthorized access", "A type of hardware firewall", "A backup utility"], answer: 1 },
  { q: "What does a \"spoofed\" email address mean?", options: ["The email was encrypted", "The sender address was faked", "The email was sent twice", "The email bounced back"], answer: 1 },
  { q: "Which password is generally strongest?", options: ["password123", "Tr0ub4dor&3xpedition-Kite!92", "qwerty", "123456789"], answer: 1 },
  { q: "What is a \"keylogger\"?", options: ["A tool to generate strong passwords", "Malware that records every keystroke", "A type of firewall", "A password manager"], answer: 1 },
  { q: "What does \"least privilege\" mean?", options: ["Giving everyone admin access", "Giving users only the access they need", "Removing all user accounts", "Encrypting the least important files first"], answer: 1 },
  { q: "What's a common sign of a phishing email?", options: ["A correctly spelled, known domain", "Urgency plus a link asking for credentials", "No links or attachments at all", "It's addressed to you by name"], answer: 1 },
  { q: "What is a \"man-in-the-middle\" attack?", options: ["An insider threat from an employee", "Secretly intercepting communication between two parties", "A virus spread via USB", "A denial-of-service attack"], answer: 1 },
  { q: "What does end-to-end encryption guarantee?", options: ["The message is backed up twice", "Only sender and recipient can read it", "The message can never be deleted", "The message sends faster"], answer: 1 },
  { q: "What is a \"honeypot\"?", options: ["A decoy system to lure and detect attackers", "A type of encryption algorithm", "A password storage vault", "A backup server"], answer: 0 },
  { q: "Safest way to handle a suspicious attachment?", options: ["Open it to see what it is", "Forward it to a friend to check", "Don't open it — report it officially", "Reply asking who sent it"], answer: 2 },
  { q: "What does SQL injection target?", options: ["A web app's database queries", "A user's webcam", "A router's firmware", "A printer's driver"], answer: 0 },
  { q: "What is MFA mainly designed to protect against?", options: ["Slow internet speeds", "An attacker who only has your password", "Running out of storage", "Outdated software"], answer: 1 },
  { q: "Difference between a virus and a worm?", options: ["There is none", "A virus needs a host file; a worm spreads on its own", "A worm is always more dangerous", "A virus only affects Mac computers"], answer: 1 },
  { q: "What's Microsoft's monthly security update release called?", options: ["Firewall Friday", "Patch Tuesday", "Update Wednesday", "Security Sunday"], answer: 1 },
  { q: "Main purpose of a password manager?", options: ["To share passwords publicly", "To generate and store unique, strong passwords", "To speed up your computer", "To block ads"], answer: 1 },
];

const GAME_MS = 60_000;
const ROUND_MS = 7000;
const FEEDBACK_MS = 450;
const BASE_POINTS = 80;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function multiplierFor(streak: number): number {
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

type Phase = "question" | "feedback";

export default function TriviaRushGame({ onFinish }: GamePlayProps) {
  const pool = useMemo(() => [...shuffle(QUESTIONS), ...shuffle(QUESTIONS)], []);
  const [index, setIndex] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(GAME_MS / 1000));
  const [phase, setPhase] = useState<Phase>("question");
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  // Set for real in the effect below, not during render.
  const endAtRef = useRef(0);
  const finishedRef = useRef(false);
  const current = pool[index % pool.length];

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
    if (Date.now() >= endAtRef.current) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setPhase("question");
  }, [finish]);

  const choose = useCallback(
    (optIndex: number) => {
      if (phase !== "question") return;
      const correct = optIndex === current.answer;
      if (correct) {
        streakRef.current += 1;
        scoreRef.current += BASE_POINTS * multiplierFor(streakRef.current);
      } else {
        streakRef.current = 0;
      }
      setStreak(streakRef.current);
      setScoreDisplay(scoreRef.current);
      setPicked(optIndex);
      setPhase("feedback");
    },
    [phase, current]
  );

  const onTimeout = useCallback(() => {
    if (phase !== "question") return;
    streakRef.current = 0;
    setStreak(0);
    setPicked(null);
    setPhase("feedback");
  }, [phase]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(goNext, FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [phase, goNext]);

  const multiplier = multiplierFor(streak);

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={
          <span>
            0:{secondsLeft.toString().padStart(2, "0")}
            {multiplier > 1 && <span className="ml-2 text-indigo-400">x{multiplier} streak</span>}
          </span>
        }
        score={scoreDisplay}
        accentText="text-indigo-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="relative mb-5 h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
          {phase === "question" && (
            <div
              key={index}
              onAnimationEnd={onTimeout}
              className="h-full origin-left bg-indigo-400"
              style={{ animation: `shrink-x ${ROUND_MS}ms linear forwards` }}
            />
          )}
        </div>

        <p className="mb-5 min-h-[52px] text-base font-medium leading-snug">{current.q}</p>

        <div className="mt-auto grid grid-cols-1 gap-2 sm:grid-cols-2">
          {current.options.map((opt, i) => {
            const showState = phase === "feedback";
            const isAnswer = i === current.answer;
            const isPicked = i === picked;
            return (
              <button
                key={opt}
                disabled={phase !== "question"}
                onClick={() => choose(i)}
                className={`rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${
                  showState && isAnswer
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                    : showState && isPicked
                    ? "border-danger/50 bg-danger/10 text-danger"
                    : "border-surface-border bg-surface hover:border-indigo-400/40"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
