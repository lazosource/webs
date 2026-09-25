"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldCheck, ShieldX } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD, Lives } from "@/components/games/GameHUD";

const DECIDE_MS = 4000;
const PAUSE_MS = 350;
const MAX_PACKETS = 40;
const GAME_MS = 90_000;
const START_LIVES = 3;
const CORRECT_BASE = 70;
const SPEED_BONUS_MAX = 30;
const ROTATE_EVERY = 6;

type SourceType = "internal" | "vpn" | "external" | "known-bad";

interface PortDef {
  port: number;
  label: string;
}

const PORTS: PortDef[] = [
  { port: 80, label: "HTTP" },
  { port: 443, label: "HTTPS" },
  { port: 22, label: "SSH" },
  { port: 3389, label: "RDP" },
  { port: 23, label: "Telnet" },
  { port: 53, label: "DNS" },
  { port: 25, label: "SMTP" },
  { port: 445, label: "SMB" },
  { port: 8080, label: "HTTP-Proxy" },
  { port: 21, label: "FTP" },
];

const SOURCE_TYPES: { type: SourceType; label: string; weight: number }[] = [
  { type: "internal", label: "10.0.4.12 — internal", weight: 3 },
  { type: "vpn", label: "10.8.0.44 — VPN", weight: 2 },
  { type: "external", label: "203.0.113.77 — external", weight: 3 },
  { type: "known-bad", label: "198.51.100.23 — flagged range", weight: 1 },
];

interface PacketDef {
  id: number;
  port: number;
  portLabel: string;
  source: SourceType;
  sourceLabel: string;
  shouldAllow: boolean;
}

interface Policy {
  label: string;
  allow: (p: { port: number; source: SourceType }) => boolean;
}

const POLICIES: Policy[] = [
  { label: "Allow web traffic only — ports 80 & 443", allow: (p) => p.port === 80 || p.port === 443 },
  { label: "Allow only internal & VPN sources", allow: (p) => p.source === "internal" || p.source === "vpn" },
  { label: "Allow DNS (53) and HTTPS (443) only", allow: (p) => p.port === 53 || p.port === 443 },
  { label: "Block inbound RDP (3389) and Telnet (23)", allow: (p) => p.port !== 3389 && p.port !== 23 },
];

function weightedSource() {
  const total = SOURCE_TYPES.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const s of SOURCE_TYPES) {
    if (r < s.weight) return s;
    r -= s.weight;
  }
  return SOURCE_TYPES[0];
}

function makePacket(id: number, policy: Policy): PacketDef {
  const portDef = PORTS[Math.floor(Math.random() * PORTS.length)];
  const src = weightedSource();
  return {
    id,
    port: portDef.port,
    portLabel: portDef.label,
    source: src.type,
    sourceLabel: src.label,
    shouldAllow: policy.allow({ port: portDef.port, source: src.type }),
  };
}

type Phase = "packet" | "resolved";

export default function FirewallDefenseGame({ onFinish }: GamePlayProps) {
  const [packet, setPacket] = useState<PacketDef | null>(null);
  const [phase, setPhase] = useState<Phase>("packet");
  const [lives, setLives] = useState(START_LIVES);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [policyLabel, setPolicyLabel] = useState(POLICIES[0].label);

  const scoreRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const countRef = useRef(0);
  // Both set for real in the mount effect below / inside spawn(), not
  // during render.
  const endAtRef = useRef(0);
  const packetStartRef = useRef(0);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish(scoreRef.current);
  }, [onFinish]);

  const spawn = useCallback(() => {
    if (
      Date.now() >= endAtRef.current ||
      countRef.current >= MAX_PACKETS ||
      livesRef.current <= 0
    ) {
      finish();
      return;
    }
    const policyIndex = Math.floor(countRef.current / ROTATE_EVERY) % POLICIES.length;
    const policy = POLICIES[policyIndex];
    const p = makePacket(countRef.current, policy);
    countRef.current += 1;
    packetStartRef.current = Date.now();
    setPolicyLabel(policy.label);
    setPacket(p);
    setFeedback(null);
    setPhase("packet");
  }, [finish]);

  useEffect(() => {
    endAtRef.current = Date.now() + GAME_MS;
    spawn();
  }, [spawn]);

  const resolve = useCallback(
    (correct: boolean) => {
      if (correct) {
        const elapsed = Date.now() - packetStartRef.current;
        const speedBonus = Math.max(
          0,
          Math.round(((DECIDE_MS - elapsed) / DECIDE_MS) * SPEED_BONUS_MAX)
        );
        scoreRef.current += CORRECT_BASE + speedBonus;
        setScoreDisplay(scoreRef.current);
        setFeedback("correct");
      } else {
        livesRef.current -= 1;
        setLives(livesRef.current);
        setFeedback("wrong");
      }
      setPhase("resolved");
      setTimeout(spawn, PAUSE_MS);
    },
    [spawn]
  );

  const decide = useCallback(
    (choice: "allow" | "block") => {
      if (phase !== "packet" || !packet) return;
      resolve((choice === "allow") === packet.shouldAllow);
    },
    [phase, packet, resolve]
  );

  const onTimeout = useCallback(() => {
    if (phase !== "packet") return;
    resolve(false);
  }, [phase, resolve]);

  if (!packet) return null;

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={<Lives count={lives} total={START_LIVES} />}
        score={scoreDisplay}
        accentText="text-orange-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-5 rounded-lg border border-orange-400/30 bg-orange-400/10 px-3.5 py-2.5 text-center font-display text-xs uppercase tracking-wide text-orange-400">
          Policy: {policyLabel}
        </div>

        <div className="relative mb-5 h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
          {phase === "packet" && (
            <div
              key={packet.id}
              onAnimationEnd={onTimeout}
              className="h-full origin-left bg-orange-400"
              style={{ animation: `shrink-x ${DECIDE_MS}ms linear forwards` }}
            />
          )}
        </div>

        <div
          className={`mb-6 flex-1 rounded-xl border p-6 text-center transition-colors ${
            feedback === "correct"
              ? "border-emerald-400/50 bg-emerald-400/10"
              : feedback === "wrong"
              ? "border-danger/50 bg-danger/10"
              : "border-surface-border bg-surface/40"
          }`}
        >
          <p className="font-display text-2xl font-bold tracking-tight">{packet.portLabel}</p>
          <p className="mt-1 font-mono text-sm text-muted">port {packet.port}</p>
          <p className="mt-4 font-mono text-sm">{packet.sourceLabel}</p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <button
            disabled={phase !== "packet"}
            onClick={() => decide("allow")}
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 py-3 font-display text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-400/20 disabled:opacity-40"
          >
            <ShieldCheck className="size-4" aria-hidden /> Allow
          </button>
          <button
            disabled={phase !== "packet"}
            onClick={() => decide("block")}
            className="flex items-center justify-center gap-2 rounded-lg border border-danger/40 bg-danger/10 py-3 font-display text-sm font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-40"
          >
            <ShieldX className="size-4" aria-hidden /> Block
          </button>
        </div>
      </div>
    </div>
  );
}
