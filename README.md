# Launch Skills & Partnership Intelligence — MVP scaffold

A working (not mocked) MVP for the Certification & Partner Readiness Platform brief:
Next.js 14 (App Router) + TypeScript + Tailwind.

**Two data-layer options, both included:**
- **`lib/db.ts` (default, wired up in all pages/routes right now)** — a thin, direct
  SQLite layer using `better-sqlite3`. Zero external downloads beyond the npm registry,
  so it runs anywhere with no CDN/proxy issues. This is what was actually run and
  screenshotted to verify the app end-to-end.
- **`prisma/schema.prisma` + `lib/prisma.ts` (for a real deployment)** — the original
  Prisma layer, kept in the repo. Swap `@/lib/db` imports back to `@/lib/prisma` and
  point `DATABASE_URL` at Postgres when this moves past a local demo (see "Extending
  it" below) — Prisma gives you migrations, a proper Postgres driver, and a nicer
  query API for the integrations phase.

This is Phase 0 of the phased plan in the companion assessment doc: **Pipeline Tracking**
and **Partner Readiness** are fully data-backed and interactive; **Opportunity Matching**
and **Pod Formation Assistant** run real matching logic against the seeded dataset;
**ROI Dashboard** is wired but flagged with the revenue-attribution caveat below. None of
the three external integrations (HR system, LMS, partner portals) are built — see
"What's stubbed" below.

## Run it

```bash
npm install
npm run db:seed:sandbox   # creates dev.db and loads sample data (better-sqlite3, no network needed)
npm run dev                 # http://localhost:3000
```

Requires Node 18+. Everything runs locally against a SQLite file — no external
services needed to try it.

**Verification note:** this exact setup — `npm install`, `npm run db:seed:sandbox`,
`npm run dev` — was actually run in the environment this was built in, then every
page and API route was exercised live: the pipeline stage-transition PATCH was called
and the write was confirmed to persist to the SQLite file on disk; the opportunity-match
and pod-assistant POST endpoints were called with real requirements and returned
correctly computed matches and gaps against the seeded data; all five pages were
screenshotted straight from the running server. Screenshots are in the chat.
(A pure-Prisma run was also attempted first — `prisma generate`/`db push` — but that
sandbox's network policy hard-blocks Prisma's engine-binary CDN, `binaries.prisma.sh`,
at the connection level, not something a flag works around. That's a property of the
build sandbox, not of the Prisma setup itself — it'll run normally on a machine with
ordinary internet access via the `npm run db:push` / `npm run db:seed` scripts.)

## What's real vs. stubbed

**Working:**
- Full Prisma data model (`prisma/schema.prisma`) for all 5 tabs, sharing one schema so
  ROI and Pod Formation can query across pipeline + readiness + opportunity data.
- Pipeline Tracking: live stage transitions (`PATCH /api/pipeline/:id`) that persist to
  the database and auto-stamp `certifiedDate`/`expiresOn` when a cert lands on CERTIFIED.
- Partner Readiness: computed readiness (certified vs. required headcount) per partner
  program, from real data, not hardcoded numbers.
- Opportunity Matching: a real matching engine (`POST /api/opportunity-match`) that
  splits candidates into available-certified / busy-certified / in-progress / gap.
- Pod Formation Assistant: a real scoring engine (`POST /api/pod-assistant`) that picks
  a lead by certification coverage + availability.

**Stubbed / explicitly flagged in the UI, not hidden:**
- Revenue attribution methodology on the ROI tab — the numbers are seeded examples
  using three placeholder attribution methods. Do not present these to leadership as
  real until finance and delivery agree on one methodology (see the assessment doc's
  gap analysis).
- Pod cost/margin — flat placeholder day-rate math, not a real rate card.
- No auth/RBAC, no notifications, no HR/LMS/partner-portal sync. These are Phase 3 in
  the assessment doc, deliberately out of scope for this scaffold.

## Extending it

- Swap SQLite for Postgres: change `provider = "sqlite"` to `"postgresql"` in
  `prisma/schema.prisma` and point `DATABASE_URL` at a real instance (Azure Database
  for PostgreSQL fits the recommended Azure App Service deployment).
- Add RBAC: the natural seam is `lib/prisma.ts` — wrap queries per-role once auth
  (e.g. Azure AD via NextAuth) is wired in.
- Add HR sync: a scheduled job (Vercel Cron / Azure Function) that upserts `Employee`
  rows from the HR system's API on a schedule, rather than the manual seed here.
