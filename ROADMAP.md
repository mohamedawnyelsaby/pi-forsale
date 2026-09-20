# Roadmap

Legend: [x] done, [ ] not started.

## Phase 1: Foundation
- [x] Clean repo, Next.js + TypeScript project, RTL/LTR with Arabic and English
- [x] Database schema (users, listings, media, land plots, chat, payments ledger, commissions)
- [x] Commission calculator with tests (integer math, optional broker split)
- [x] Pi Auth route and signed session cookie
- [x] Pi payment routes (approve / complete) with server-side validation, disabled until Phase 3
- [x] Home, search results and listing detail pages (demo data)
- [ ] Connect a real database (Supabase or Neon), run migrations
- [ ] Register the app in the Pi Developer Portal, set `PI_API_KEY`
- [ ] CI workflow (needs a token with Workflows permission)

## Phase 2: Core marketplace
- [ ] Create / edit / publish listings, photo upload
- [ ] Map-first search (add PostGIS), natural-language search in Arabic and English
- [ ] Internal chat and viewing bookings (no phone numbers shared before a deal)
- [ ] Admin dashboard: review queue, flagged listings, user roles

## Phase 3: Payments (Pi)
- [ ] Fill `expectedAmountPi()` (commission from `commissions`, fixed price list for promotions, deposit rules)
- [ ] Pay button using the Pi SDK, incomplete-payment recovery
- [ ] Commission invoicing when a deal is marked closed
- [ ] Test end to end in Pi sandbox before any real Pi
- [ ] Legal review of the flow in each country before launch

## Phase 4: Differentiators
- [ ] Land subdivision: draw plots on a map, sell each plot separately
- [ ] Verification badges (documents, site visit)
- [ ] AI assistant: listing descriptions from photos, price hints, duplicate and fraud detection
- [ ] More currencies, countries and languages

## Decisions
- Modular monolith, not microservices (solo developer, lower cost and complexity).
- The platform never holds the property price. Pi is used for commission, promotions and deposits.
- Prices are shown in a stable currency and converted to Pi at payment time.
