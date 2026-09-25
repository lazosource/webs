import type { Metadata } from "next";
import { Rocket, Sparkles, Wrench, Map } from "lucide-react";
import { CHANGELOG, ROADMAP, type ChangelogEntry } from "@/lib/changelog";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new on CasperSource, and what's coming next.",
};

const TAG_ICON: Record<ChangelogEntry["tag"], typeof Rocket> = {
  launch: Rocket,
  feature: Sparkles,
  fix: Wrench,
  planned: Map,
};

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold">Changelog & roadmap</h1>
        <p className="text-muted mt-2">
          This page is edited directly in the codebase — there&apos;s no admin
          form anywhere on the site. What you see here shipped in a real
          commit.
        </p>
      </header>

      <div className="space-y-6 mb-14">
        {CHANGELOG.map((entry) => {
          const Icon = TAG_ICON[entry.tag];
          return (
            <Card key={entry.date + entry.title} className="p-6">
              <div className="flex items-center gap-2.5 mb-3">
                <Icon className="size-4 text-primary" aria-hidden />
                <time className="font-display text-xs uppercase tracking-widest text-muted">
                  {entry.date}
                </time>
              </div>
              <h2 className="font-display text-lg font-semibold mb-3">
                {entry.title}
              </h2>
              <ul className="space-y-1.5 text-sm text-muted">
                {entry.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <Map className="size-5 text-secondary" aria-hidden /> On the roadmap
        </h2>
        <Card className="p-6">
          <ul className="space-y-2.5 text-sm text-muted">
            {ROADMAP.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-secondary">›</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
