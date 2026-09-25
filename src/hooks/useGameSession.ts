"use client";

import { useCallback, useRef, useState } from "react";
import { useUsername } from "@/components/username/UsernameProvider";

export type SessionStatus = "idle" | "active" | "submitting" | "done" | "error";

interface SessionResult {
  score: number;
  rank: number;
}

export function useGameSession(gameSlug: string) {
  const { username, promptForUsername } = useUsername();
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const tokenRef = useRef<string | null>(null);
  const finishedRef = useRef(false);

  const start = useCallback(async () => {
    if (!username) {
      promptForUsername();
      return false;
    }
    setError(null);
    setResult(null);
    finishedRef.current = false;
    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug }),
      });
      if (!res.ok) throw new Error("Could not start a game session.");
      const data = (await res.json()) as { token: string };
      tokenRef.current = data.token;
      setStatus("active");
      return true;
    } catch {
      setError("Couldn't start the game. Check your connection and try again.");
      setStatus("error");
      return false;
    }
  }, [gameSlug, username, promptForUsername]);

  const finish = useCallback(
    async (score: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      if (!tokenRef.current || !username) {
        setStatus("error");
        setError("Session expired — please restart the game.");
        return;
      }
      setStatus("submitting");
      try {
        const res = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenRef.current,
            gameSlug,
            playerName: username,
            score,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not submit score.");
        setResult({ score: data.score, rank: data.rank });
        setStatus("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not submit score.");
        setStatus("error");
      } finally {
        tokenRef.current = null;
      }
    },
    [gameSlug, username]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setResult(null);
    tokenRef.current = null;
    finishedRef.current = false;
  }, []);

  return { status, error, result, start, finish, reset, username };
}
