"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldHalf, User, X } from "lucide-react";
import clsx from "clsx";
import { useUsername } from "@/components/username/UsernameProvider";

const LINKS = [
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/changelog", label: "Changelog" },
];

export function Navbar() {
  const pathname = usePathname();
  const { username, promptForUsername } = useUsername();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <ShieldHalf className="size-6 text-primary" aria-hidden />
          <span className="font-display text-lg font-bold tracking-tight">
            Casper<span className="text-primary">Source</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted hover:text-foreground hover:bg-surface"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={promptForUsername}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-3 py-1.5 text-xs font-display text-foreground hover:border-primary/40 transition-colors"
          >
            <User className="size-3.5 text-primary" aria-hidden />
            {username ?? "Set callsign"}
          </button>
          <button
            className="md:hidden rounded-lg p-2 text-muted hover:text-foreground hover:bg-surface"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-surface-border px-4 py-3 space-y-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              promptForUsername();
              setOpen(false);
            }}
            className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface"
          >
            <User className="size-4 text-primary" aria-hidden />
            {username ?? "Set callsign"}
          </button>
        </div>
      )}
    </header>
  );
}
