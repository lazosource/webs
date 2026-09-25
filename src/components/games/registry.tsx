"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { GamePlayProps } from "@/components/game/GameRuntime";

function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-muted">
      <Loader2 className="size-5 animate-spin" aria-hidden />
    </div>
  );
}

function load(loader: () => Promise<{ default: React.ComponentType<GamePlayProps> }>) {
  return dynamic(loader, { ssr: false, loading: Loading });
}

export const GAME_COMPONENTS: Record<string, React.ComponentType<GamePlayProps>> = {
  "phishing-detective": load(() => import("./PhishingDetectiveGame")),
  "password-forge": load(() => import("./PasswordForgeGame")),
  "cipher-breaker": load(() => import("./CipherBreakerGame")),
  "firewall-defense": load(() => import("./FirewallDefenseGame")),
  "malware-sorting": load(() => import("./MalwareSortingGame")),
  "sql-injection-lab": load(() => import("./SqlInjectionLabGame")),
  "social-engineering-sim": load(() => import("./SocialEngineeringGame")),
  "typosquat-spotter": load(() => import("./TyposquatSpotterGame")),
  "incident-triage": load(() => import("./IncidentTriageGame")),
  "trivia-rush": load(() => import("./TriviaRushGame")),
  "packet-hunter": load(() => import("./PacketHunterGame")),
  "patch-panic": load(() => import("./PatchPanicGame")),
};
