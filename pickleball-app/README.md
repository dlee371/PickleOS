# Pickleball League Manager

A lightweight SaaS for local pickleball clubs to replace spreadsheets: league creation, round-robin scheduling, score submission with confirmation, standings, and single-elimination brackets.

This repo has two apps:
- `backend/` — Express + TypeScript + Prisma (PostgreSQL) REST API
- `frontend/` — React + TypeScript + Vite + Tailwind SPA

Both have been typechecked and build cleanly. The one thing that could **not** be verified in the sandbox this was built in is a live Prisma migration against a real Postgres database — that sandbox has no network access to Prisma's binary CDN or to a database. Do this step first when you get started locally.

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL to a real Postgres connection string,
# and JWT_SECRET to a random string (e.g. `openssl rand -base64 32`)

npx prisma generate
npx prisma migrate dev --name init   # creates the tables from prisma/schema.prisma

npm run dev   # starts the API on http://localhost:4000
```

Free Postgres options to get a `DATABASE_URL` quickly: [Railway](https://railway.app), [Render](https://render.com), or [Supabase](https://supabase.com) all offer a managed Postgres instance in a couple of clicks.

### Using Supabase specifically

Supabase gives you two different connection strings, and the schema is set up to use both (`prisma/schema.prisma` has both `url` and `directUrl`):

- **`DATABASE_URL`** — the **Transaction pooler** string (port `6543`), used by the running app.
- **`DIRECT_URL`** — the **Session pooler** string (port `5432`), used only for `prisma migrate`.

Get both from your Supabase dashboard: **Project Settings → Database → Connection String**. Don't use the raw `db.<project>.supabase.co:5432` host directly — on the free tier that host is IPv6-only and will time out (`P1001: Can't reach database server`) from most home networks. The pooler hostnames (`aws-0-<region>.pooler.supabase.com`) support IPv4.

If you still get `P1001` after switching to the pooler strings, check whether your Supabase project is **paused** — free-tier projects pause after a week of inactivity, and you'll need to hit "Resume" in the dashboard before it will accept connections.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:4000/api/v1, adjust if needed
npm run dev   # starts the app on http://localhost:5173
```

## 3. Try it out

1. Open http://localhost:5173, sign up for an account.
2. Create a league (you become its admin automatically).
3. Copy the join code shown on the league card.
4. Open an incognito window (or a second browser), sign up as a second user, and use "Join a league" with that code.
5. Back in the admin account, go to the league's **Schedule** tab and click **Generate round-robin schedule** (needs at least 2 active players).
6. As a player, submit a score on a match; the opponent confirms it from their own account.
7. Check the **Standings** tab — it recalculates automatically from completed matches.
8. Once round-robin play is done, use **Generate bracket from standings** on the **Bracket** tab to seed single-elimination playoffs.

## Project structure

See `pickleball-league-manager-architecture.md` (shared earlier in this conversation) for the full PRD, schema rationale, and API reference. In short:

```
backend/src/
  routes/       thin route definitions
  controllers/  request/response handling
  services/     business logic (schedule generation, standings calc, bracket seeding, scores)
  middleware/    auth, validation, error handling
  db/           Prisma client
frontend/src/
  pages/        route-level screens (auth, dashboard, league detail, profile)
  components/   MatchCard, StandingsTable, BracketView, MembersList, shared UI primitives
  api/          typed fetch functions per resource
  hooks/        useAuth (auth context)
```

## Deployment (per the architecture doc)

- **Frontend** → Vercel (zero-config for Vite)
- **Backend** → Railway or Render (Node + managed Postgres add-on)
- **CI** → `.github/workflows/ci.yml` runs typecheck (backend) and build (frontend) on every PR

Remember to set `FRONTEND_URL` (backend) and `VITE_API_URL` (frontend) to your real deployed URLs, and to run `npx prisma migrate deploy` against the production database as part of your deploy step.

## What's built vs. what's next

**Built (Week 1–3 scope from the roadmap):** auth, league creation/join with approval flow, round-robin schedule generation, manual match creation, score submit/confirm, admin override, standings, single-elimination bracket generation seeded from standings, basic player profiles, admin member management.

**Not yet built (intentionally deferred per the approved MVP scope):** email notifications, payments, multi-admin clubs beyond a single admin flag, double-elimination formats. See the roadmap doc for suggested next steps.
