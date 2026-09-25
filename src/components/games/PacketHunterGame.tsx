"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Radar } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";
import { GameHUD } from "@/components/games/GameHUD";
import { Button } from "@/components/ui/Button";

interface LogRow {
  time: string;
  src: string;
  dst: string;
  detail: string;
  isAnomaly: boolean;
  reason?: string;
}

interface RoundLog {
  title: string;
  rows: LogRow[];
}

const ROUNDS_DATA: RoundLog[] = [
  {
    title: "Perimeter firewall log — 09:00 to 10:00",
    rows: [
      { time: "09:12:03", src: "10.0.2.14", dst: "172.217.10.14:443", detail: "HTTPS · 82 KB", isAnomaly: false },
      { time: "09:14:55", src: "10.0.2.22", dst: "52.96.166.2:443", detail: "HTTPS · 145 KB", isAnomaly: false },
      { time: "09:20:10", src: "10.0.2.14", dst: "198.51.100.23:4444", detail: "TCP · 3 KB", isAnomaly: true, reason: "Port 4444 is a classic default for remote-access/C2 tools — rarely legitimate business traffic." },
      { time: "09:21:00", src: "10.0.2.30", dst: "13.107.42.14:443", detail: "HTTPS · 60 KB", isAnomaly: false },
      { time: "09:35:40", src: "10.0.2.14", dst: "198.51.100.23:4444", detail: "TCP · 3 KB", isAnomaly: true, reason: "Same tiny payload to the same odd port, 15 minutes later — a regular beacon interval." },
      { time: "10:02:15", src: "10.0.2.45", dst: "172.64.155.1:80", detail: "HTTP · 22 KB", isAnomaly: false },
      { time: "03:47:12", src: "10.0.2.14", dst: "91.203.55.10:443", detail: "HTTPS · 812 MB", isAnomaly: true, reason: "812 MB leaving the network at 3:47 AM is a classic exfiltration pattern." },
      { time: "09:40:02", src: "10.0.2.51", dst: "20.42.65.92:443", detail: "HTTPS · 34 KB", isAnomaly: false },
      { time: "09:41:18", src: "10.0.2.19", dst: "104.244.42.1:443", detail: "HTTPS · 98 KB", isAnomaly: false },
      { time: "09:44:50", src: "10.0.2.14", dst: "198.51.100.23:4444", detail: "TCP · 3 KB", isAnomaly: true, reason: "A third beacon to the same host and port — that's a pattern, not a coincidence." },
      { time: "09:50:33", src: "10.0.2.8", dst: "17.248.135.1:443", detail: "HTTPS · 12 KB", isAnomaly: false },
      { time: "09:55:01", src: "10.0.2.60", dst: "151.101.1.69:443", detail: "HTTPS · 45 KB", isAnomaly: false },
    ],
  },
  {
    title: "DNS & remote-access log — 14:00 to 14:15",
    rows: [
      { time: "14:02:11", src: "10.0.3.5", dst: "8.8.8.8:53", detail: "DNS · docs.google.com", isAnomaly: false },
      { time: "14:03:40", src: "10.0.3.5", dst: "8.8.8.8:53", detail: "DNS · xj3kqm9z-loader.info", isAnomaly: true, reason: "A random, algorithmically-generated-looking domain is a classic sign of malware calling home." },
      { time: "14:05:12", src: "203.0.113.44", dst: "10.0.3.2:3389", detail: "RDP · connection attempt", isAnomaly: true, reason: "An external IP hitting RDP (3389) directly — that port should never face the open internet." },
      { time: "14:06:01", src: "10.0.3.9", dst: "151.101.65.69:443", detail: "HTTPS · 40 KB", isAnomaly: false },
      { time: "14:07:15", src: "203.0.113.9", dst: "10.0.3.14:22", detail: "SSH · auth failed", isAnomaly: true, reason: "Rapid repeated SSH attempts from the same external IP is a textbook brute-force pattern." },
      { time: "14:07:16", src: "203.0.113.9", dst: "10.0.3.14:22", detail: "SSH · auth failed", isAnomaly: true, reason: "Same source, one second later — the brute-force attempt continuing." },
      { time: "14:08:02", src: "10.0.3.20", dst: "172.217.10.14:443", detail: "HTTPS · 88 KB", isAnomaly: false },
      { time: "14:09:44", src: "10.0.3.5", dst: "8.8.8.8:53", detail: "DNS · outlook.office365.com", isAnomaly: false },
      { time: "14:10:30", src: "10.0.3.33", dst: "13.107.42.14:443", detail: "HTTPS · 51 KB", isAnomaly: false },
      { time: "14:12:19", src: "10.0.3.41", dst: "172.64.155.1:80", detail: "HTTP · 19 KB", isAnomaly: false },
      { time: "14:14:02", src: "10.0.3.5", dst: "8.8.8.8:53", detail: "DNS · docs.google.com", isAnomaly: false },
    ],
  },
  {
    title: "Internal segment log — 20:00 to 21:00",
    rows: [
      { time: "20:14:02", src: "10.0.5.12", dst: "172.217.10.14:443", detail: "HTTPS · 30 KB", isAnomaly: false },
      { time: "23:58:40", src: "10.0.5.44", dst: "143.204.10.5:443", detail: "HTTPS · personalcloudbox.net · 1.2 GB", isAnomaly: true, reason: "The finance DB server pushing 1.2 GB to a personal cloud-storage domain, just before midnight, looks like insider exfiltration." },
      { time: "20:20:11", src: "10.0.5.9", dst: "20.42.65.92:443", detail: "HTTPS · 22 KB", isAnomaly: false },
      { time: "20:25:33", src: "192.168.99.250", dst: "10.0.5.2:445", detail: "SMB", isAnomaly: true, reason: "192.168.99.x isn't a range this network uses — this source is almost certainly spoofed." },
      { time: "20:30:02", src: "10.0.5.19", dst: "104.244.42.1:443", detail: "HTTPS · 40 KB", isAnomaly: false },
      { time: "20:33:15", src: "10.0.5.5", dst: "10.0.5.44:23", detail: "Telnet", isAnomaly: true, reason: "Telnet sends credentials in plaintext — any internal use of it today is a real risk." },
      { time: "20:36:40", src: "10.0.5.61", dst: "13.107.42.14:443", detail: "HTTPS · 18 KB", isAnomaly: false },
      { time: "20:40:02", src: "10.0.5.30", dst: "172.64.155.1:80", detail: "HTTP · 12 KB", isAnomaly: false },
      { time: "20:44:11", src: "192.168.99.250", dst: "10.0.5.2:445", detail: "SMB", isAnomaly: true, reason: "The same spoofed-looking source again, a few minutes later." },
      { time: "20:48:02", src: "10.0.5.8", dst: "151.101.1.69:443", detail: "HTTPS · 27 KB", isAnomaly: false },
      { time: "20:50:30", src: "10.0.5.14", dst: "17.248.135.1:443", detail: "HTTPS · 15 KB", isAnomaly: false },
    ],
  },
];

const ROUNDS = ROUNDS_DATA.length;
const ROUND_MS = 30_000;
const ADVANCE_DELAY_MS = 2200;
const TRUE_POSITIVE = 100;
const FALSE_POSITIVE = 50;

type Phase = "question" | "feedback";

export default function PacketHunterGame({ onFinish }: GamePlayProps) {
  const [round, setRound] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const scoreRef = useRef(0);
  const finishedRef = useRef(false);
  const current = ROUNDS_DATA[round];

  const goNext = useCallback(() => {
    if (round + 1 >= ROUNDS) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinish(scoreRef.current);
      }
    } else {
      setRound((r) => r + 1);
      setFlagged(new Set());
      setPhase("question");
    }
  }, [round, onFinish]);

  const submit = useCallback(() => {
    if (phase !== "question") return;
    let delta = 0;
    current.rows.forEach((row, i) => {
      const isFlagged = flagged.has(i);
      if (row.isAnomaly && isFlagged) delta += TRUE_POSITIVE;
      if (!row.isAnomaly && isFlagged) delta -= FALSE_POSITIVE;
    });
    scoreRef.current = Math.max(0, scoreRef.current + delta);
    setScoreDisplay(scoreRef.current);
    setPhase("feedback");
  }, [phase, current, flagged]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(goNext, ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, goNext]);

  const toggleRow = useCallback(
    (i: number) => {
      if (phase !== "question") return;
      setFlagged((prev) => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        return next;
      });
    },
    [phase]
  );

  return (
    <div className="flex h-full min-h-[440px] flex-col">
      <GameHUD
        left={<span>Log {round + 1} / {ROUNDS}</span>}
        score={scoreDisplay}
        accentText="text-teal-400"
      />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="relative mb-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-border">
          {phase === "question" && (
            <div
              key={round}
              onAnimationEnd={submit}
              className="h-full origin-left bg-teal-400"
              style={{ animation: `shrink-x ${ROUND_MS}ms linear forwards` }}
            />
          )}
        </div>

        <div className="mb-3 flex items-center gap-2 font-display text-[11px] uppercase tracking-widest text-teal-400">
          <Radar className="size-3.5" aria-hidden /> {current.title}
        </div>

        <div className="mb-4 flex-1 overflow-y-auto scrollbar-thin rounded-xl border border-surface-border">
          <table className="w-full text-xs sm:text-sm">
            <tbody>
              {current.rows.map((row, i) => {
                const isFlagged = flagged.has(i);
                const showState = phase === "feedback";
                let rowClass = "border-surface-border hover:bg-surface/60";
                if (showState && row.isAnomaly && isFlagged) rowClass = "border-emerald-400/30 bg-emerald-400/10";
                else if (showState && !row.isAnomaly && isFlagged) rowClass = "border-danger/30 bg-danger/10";
                else if (showState && row.isAnomaly && !isFlagged) rowClass = "border-amber-400/30 bg-amber-400/10";
                else if (isFlagged) rowClass = "border-teal-400/30 bg-teal-400/10";

                return (
                  <tr
                    key={i}
                    onClick={() => toggleRow(i)}
                    className={`cursor-pointer border-b font-mono transition-colors last:border-0 ${rowClass} ${
                      phase !== "question" ? "cursor-default" : ""
                    }`}
                  >
                    <td className="px-3 py-2 text-muted">{row.time}</td>
                    <td className="px-2 py-2">{row.src}</td>
                    <td className="px-2 py-2">{row.dst}</td>
                    <td className="px-2 py-2 text-muted">{row.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {phase === "question" ? (
          <Button onClick={submit} className="w-full">
            Submit flags ({flagged.size})
          </Button>
        ) : (
          <div className="space-y-1 text-xs text-muted">
            {current.rows
              .filter((r) => r.isAnomaly)
              .map((r, i) => (
                <p key={i}>
                  <span className="text-emerald-400">{r.dst}</span> — {r.reason}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
