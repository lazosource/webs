# CasperSource

A cybersecurity-themed mini-game arcade. Twelve fast, self-contained
browser games teach real security concepts — phishing, passwords,
cryptography, network defense, malware analysis, web security, social
engineering, incident response and vulnerability management — and every
run posts a score to a leaderboard under a player-chosen callsign. No
accounts, no email, no passwords.

Built with Next.js 16 (App Router, TypeScript), Tailwind CSS v4, and
Prisma. Ships with SQLite for local development and is ready to run on
Postgres in production.

## Games

| Game | Skill |
| --- | --- |
| Phishing Email Detective | Spotting phishing vs. legitimate email |
| Password Strength Forge | Building genuinely strong passwords |
| Cipher Breaker | Caesar, Atbash, Base64 and hex recognition |
| Firewall Defense | Applying a changing firewall policy under pressure |
| Malware Sorting Hat | Classifying virus / worm / trojan / ransomware / spyware / rootkit |
| SQL Injection Escape Room | Recognizing injectable query patterns (fully simulated, no real DB) |
| Social Engineering Call Simulator | Handling pretexting, BEC and scam calls |
| Typosquat Spotter | Catching lookalike / homograph domains |
| Incident Response Triage | Prioritizing alerts under time pressure |
| Cybersecurity Trivia Rush | Rapid-fire general knowledge |
| Packet Sniffer Anomaly Hunter | Reading connection logs for anomalies |
| Patch Panic | Risk-based vulnerability patching |

The `/changelog` page is intentionally static: its content lives in
`src/lib/changelog.ts` and only changes when new code is pushed. There is
no in-app editor anywhere on the site — by design, it can never be changed
except by editing the codebase directly.

## Local development

```bash
npm install          # also runs `prisma generate` via postinstall
npm run db:migrate    # creates prisma/dev.db (SQLite) and applies migrations
npm run dev
```

Open http://localhost:3000. `.env` is already set up for local SQLite —
see `.env.example` for what each variable does.

Useful scripts:

```bash
npm run lint          # ESLint
npx tsc --noEmit      # type-check
npm run build         # production build (also regenerates the Prisma client)
npm run db:studio     # browse the local database
```

## Architecture notes

- **Leaderboard integrity.** Starting a game requests a short-lived,
  HMAC-signed session token (`POST /api/session/start`). Submitting a
  score (`POST /api/scores`) requires that token, and the server checks:
  the token's signature, that it hasn't already been used, that enough
  wall-clock time has passed for the claimed score to be physically
  possible (`minDurationMs` per game in `src/lib/games.ts`), and that the
  score doesn't exceed a per-game plausibility ceiling (`maxScore`). This
  is a good-faith deterrent for a hobby leaderboard, not a bulletproof
  anti-cheat system — a determined attacker who can replay signed
  requests at the right pace could still spoof a score. There's also a
  lightweight in-memory rate limiter per IP. Both the used-token tracking
  and the rate limiter are per-instance, so they're weaker (not stronger)
  on a multi-instance serverless deployment.
- **Data model.** A single `Score` row per submission (`prisma/schema.prisma`).
  Per-game leaderboards take each player's best score; the global
  leaderboard sums each player's best score across every game they've
  played, so it rewards playing the whole roster, not just grinding one
  game.
- **No accounts.** A "callsign" is just a validated display name stored in
  the browser's `localStorage`. There's no password and nothing to reset —
  pick a new one any time from the nav bar.

## Deploying to production

This app needs a real Postgres database in production — SQLite's on-disk
file doesn't survive serverless deploys. The path below uses
[Vercel](https://vercel.com) + [Neon](https://neon.tech) (both have
generous free tiers), but any Node host plus any Postgres database works
the same way.

1. **Push this repo to GitHub** (already done if you're reading this from
   the repo).

2. **Create a Postgres database.** Easiest options:
   - Vercel Postgres (Storage tab in your Vercel project → Create Database), or
   - [Neon](https://neon.tech) (free tier, works from anywhere) — create a
     project and copy its connection string.

3. **Switch the Prisma datasource to Postgres.** In
   `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   to:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Commit that change.

4. **Deploy to Vercel** — click the button below, or run `vercel` from the
   repo root and follow the prompts.

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lazosource/webs)

5. **Set environment variables** in the Vercel project (Settings →
   Environment Variables):
   - `DATABASE_URL` — your Postgres connection string from step 2.
   - `SCORE_SIGNING_SECRET` — a long random string, e.g. the output of
     `openssl rand -hex 32`. Required in production: the app throws on
     startup if it's missing, rather than silently signing leaderboard
     tokens with a guessable default.

6. **Run the migration against production** once the database URL is set:
   ```bash
   DATABASE_URL="<your production URL>" npx prisma migrate deploy
   ```
   (or connect the Vercel project to a Neon integration that does this on
   deploy automatically).

7. **Redeploy.** Your leaderboard is now backed by a real, shared
   Postgres database.

### About the "release online" ask

This environment has push access to GitHub but no credentials for Vercel,
Neon, or any other hosting provider — those accounts belong to you, so the
final deploy has to happen from your side using the steps above. Everything
up to that point (the app, the database schema, the deploy config) is done
and pushed.

## Roadmap

See `/changelog` in the running app, or `src/lib/changelog.ts` in the
source — the same file, since that page is generated straight from it.
Purchases (cosmetic terminal themes, supporter badges) are the next
planned feature; the Next.js + Postgres foundation here is intentionally
Stripe-friendly (serverless API routes, a real database, no static-only
hosting constraints) for when that's ready to build.
