"use client";

import { FormEvent, useState } from "react";
import { TerminalSquare } from "lucide-react";
import { useUsername } from "./UsernameProvider";
import { Button } from "@/components/ui/Button";

export function UsernameModal() {
  const { isPromptOpen, closePrompt, setUsername, username } = useUsername();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isPromptOpen) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = setUsername(value);
    if (!result.ok) {
      setError(result.reason ?? "Invalid callsign.");
      return;
    }
    setValue("");
    setError(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="username-modal-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-surface-border bg-background-elevated p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-primary mb-3">
          <TerminalSquare className="size-5" aria-hidden />
          <h2 id="username-modal-title" className="font-display text-sm uppercase tracking-widest">
            Choose a callsign
          </h2>
        </div>
        <p className="text-sm text-muted mb-4">
          This name appears on the public leaderboards. No email, no password
          — just pick something and go.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. ghost_shell"
            maxLength={20}
            className="w-full rounded-lg border border-surface-border bg-surface px-3.5 py-2.5 text-foreground font-display placeholder:text-muted/60 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1">
              Lock it in
            </Button>
            {username && (
              <Button type="button" variant="ghost" onClick={closePrompt}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
