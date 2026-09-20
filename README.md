# ForSale (pi-forsale)

منصة وسيطة لبيع وشراء العقارات بجميع أنواعها، الدفع فيها عبر **Pi Network**.
المنصة لا تستلم ثمن العقار؛ تأخذ **عمولة** على الصفقة بعد إتمامها.

A real-estate marketplace where the platform is a commission-earning intermediary and payments use Pi Network.
The platform never holds the property payment; it charges a commission once a deal closes.

## Stack

- Next.js (App Router) + TypeScript, Arabic (RTL) and English from day one
- PostgreSQL with Drizzle ORM (schema in `src/db/schema.ts`)
- Pi Network: Pi Auth for sign-in, server-verified payments (`src/lib/pi.ts`, `src/app/api/pi/*`)
- Vitest for unit tests (commission math is tested)

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Without `DATABASE_URL` the app shows demo listings (`src/lib/sample-data.ts`) and sign-in returns 503.

Useful commands: `npm run typecheck`, `npm test`, `npm run build`, `npm run db:generate`, `npm run db:migrate`.

## Security rules

- This repository is public. Never commit `.env*` files, API keys or tokens.
- `PI_API_KEY` is server-only. The client never decides a payment amount: the server compares it with `expectedAmountPi()` (`src/lib/pricing.ts`) before approving.
- Payments are intentionally **disabled** until Phase 3 (see `ROADMAP.md`).

## Database setup

First time: paste `db/setup.sql` into the Supabase SQL Editor and run it once (creates tables and turns on Row Level Security).
Later schema changes: edit `src/db/schema.ts`, run `npm run db:generate`, and apply the new file in `drizzle/`.

See `ROADMAP.md` for the plan and current status.
