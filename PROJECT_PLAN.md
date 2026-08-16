# PROJECT_PLAN.md — IOMA Paris Dubai

## Project Scope

Build and document a production-grade, dockerized, trilingual (EN/FR/AR-RTL) digital platform for IOMA Paris Dubai covering: luxury public site, B2C e-commerce, standard + AI skin diagnosis, customer accounts, appointment booking, interactive partner locator, B2B registration/approval/ordering/training, cabin products & protocols, CMS, and a full admin back office with RBAC. Full page/module list: `CLIENT_REQUIREMENTS.md` §Scope and the 40-section brief this plan is derived from.

Out of scope for v1 (documented, not built): native mobile apps, live chat/helpdesk integration, real payment gateway (mock provider + real adapter interface only), real AI vision model (mock provider + real adapter interface only), SMS/WhatsApp sending (adapter interface only), microservice split (deliberately a modular monolith — see `DECISIONS.md`).

## Architecture Plan

Modular monolith, monorepo (pnpm + Turborepo). Next.js App Router frontend consuming a NestJS REST API via a typed SDK generated from OpenAPI. MongoDB as system of record, Redis for cache/queues/sessions, MinIO for all binary assets, Nginx/Caddy as the single public edge. Full detail: `ARCHITECTURE.md`.

## Implementation Order (Sprints)

Sprint 0 (audit/plan) → 1 (foundation) → 2 (design system) → 3 (public site) → 4 (B2C commerce) → 5 (customer account) → 6 (diagnosis + AI) → 7 (partners + booking) → 8 (B2B) → 9 (training + protocols) → 10 (admin) → 11 (i18n/RTL/a11y/perf/SEO hardening) → 12 (testing + deployment). Full detail with tasks/DoD per sprint: `SPRINTS.md`. Rationale: foundation and design system must exist before any UI is "real" rather than default-styled; commerce before account (account surfaces orders/wishlist that must exist); diagnosis before booking (booking references diagnosis/treatment selection); B2B after B2C patterns (cart/checkout/RBAC) are proven; admin last among features because it manages entities that must already exist; hardening/testing/deployment close every sprint.

## Dependencies

- Sprint 2 (design system) blocks all UI work in 3–10.
- Sprint 1 auth foundation blocks Sprint 5 (account), 8 (B2B portal gating), 10 (admin RBAC).
- Sprint 6 diagnosis rules engine blocks the "add routine to cart" flow in Sprint 4/5.
- Sprint 7 partner/availability model blocks Sprint 9 training sessions (shares scheduling primitives).
- Sprint 10 admin needs entities from 4, 6, 7, 8, 9 to exist first (it manages them).
- Sprint 12 E2E suite exercises journeys from every prior sprint — necessarily last.

## Risks

| Risk                                    | Impact                                                        | Mitigation                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No licensed Gotham/Futura PT font files | Typography won't match charter pixel-for-pixel                | Use visually compatible open-source substitutes (documented in `DESIGN_SYSTEM.md`), swap via one Tailwind config change when fonts arrive                                              |
| No official logo vector (SVG/EPS)       | Can't ship pixel-accurate lockup                              | Recreate lockup as inline SVG matching charter proportions/spacing exactly; replace with official file on receipt, zero code change needed elsewhere                                   |
| No real product photography             | Product pages would need fake stock imagery presented as real | Use clearly-sourced, license-safe placeholder imagery only in non-production seed data, never claimed as IOMA product photography; CMS-driven so real photos drop in without a rebuild |
| No payment gateway credentials          | Can't process real payment                                    | Payment-provider interface + mock provider; wire a real adapter (Stripe/Checkout.com/PayTabs/Network International — common UAE options) once selected and credentialed                |
| No AI vision provider credentials       | "AI Skin Analysis" would be non-functional                    | Provider interface + deterministic mock analysis, clearly labeled "simulated" in UI; swap adapter when a provider is chosen                                                            |
| No Google/Mapbox Maps key               | Partner locator map can't render tiles                        | Map-provider abstraction; ship with an OSM/Leaflet-based provider that needs no key as the default, adapter for Google Maps when key supplied                                          |
| Solo build against a 40-section brief   | Cannot complete in one pass without quality loss              | Explicit sprint sequencing + continuous `PROGRESS.md` updates so work is resumable and auditable rather than rushed                                                                    |
| Home-directory git repo pollution       | Could corrupt unrelated project history                       | Isolated `git init` scoped to `ioma/` only, confirmed with operator before any commit                                                                                                  |

## Assumptions

- Currency: AED, UAE market only for v1 (emirate/city address model, no multi-country).
- Business entity operates as IOMA's Dubai/UAE digital arm; legal pages will need real counsel-reviewed text before go-live (we build the structure + CMS-editable placeholders, not final legal copy).
- "Professional" B2B accounts require manual admin approval — no self-serve professional signup goes live automatically.
- English is the fallback/default locale; French and Arabic are first-class, not machine-translated at runtime (real translation keys, human-reviewable).

## Required Client Assets

Tracked with owner/status in `CLIENT_REQUIREMENTS.md`: official logo files (SVG/EPS, black + white), licensed Gotham + Futura PT font files, real product photography/video per range, real clinical/results copy (numbers, percentages, claims), Arabic translation of the brand claim, legal page copy (privacy/cookies/shipping/returns/T&Cs/accessibility statement) reviewed by counsel, partner location data (addresses/hours/services), training catalogue content, protocol PDFs/videos.

## Required External Credentials

Tracked with owner/status in `ENVIRONMENT.md`: payment gateway (provider TBD), AI skin-analysis provider (provider TBD), maps provider key (if Google Maps preferred over OSM default), transactional email provider (SMTP or API-based), object storage production credentials (or managed S3), Sentry DSN (optional but recommended), SMS/WhatsApp provider (future).

## Definition of Done

See `CLAUDE.md` §"Rules Against Placeholders" and §39 of the original brief — condensed: backend logic + frontend UI both exist; auth/validation enforced; loading/empty/error/success states all present; responsive verified at the five target breakpoints; accessibility checked; EN/FR/AR-RTL all checked; relevant tests pass; docs and `PROGRESS.md` updated; conventional commit made.
