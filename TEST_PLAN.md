# TEST_PLAN.md — IOMA Paris Dubai

## Test Layers

| Layer                   | Tool                                  | Scope                                                            |
| ----------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| Backend unit/service    | Jest (`apps/api`)                     | Services, guards, rules engine, pricing/tax math, token rotation |
| Backend integration/API | Jest + Supertest                      | Real Mongo (test container) + Redis, hits actual controllers     |
| Frontend component      | Vitest + Testing Library (`apps/web`) | Restyled UI primitives, forms, RTL mirroring                     |
| Accessibility           | axe (CI sweep)                        | Every route, both LTR and RTL                                    |
| End-to-end              | Playwright                            | Full user journeys against a running dev stack                   |
| Performance             | Lighthouse CI                         | Homepage, PLP, PDP, checkout                                     |

## Required E2E Journeys (Playwright)

1. Customer registration → email verification (mock) → login
2. Product discovery (browse/filter/search) → add to cart
3. Guest checkout → mock payment success → confirmation → order tracking
4. Mock payment failure → retry → success
5. Standard skin diagnosis → routine → add routine to cart
6. AI diagnosis (mock provider) → consent → upload → results (labeled simulated) → save → compare
7. Appointment booking via partner locator → reschedule → cancel
8. Professional application submission → (simulated) admin approval → professional login
9. B2B order (professional-priced, MOQ-respecting) → reorder
10. Training catalogue → booking → confirmation
11. Arabic RTL navigation across homepage, shop, checkout, account

## Test Resolutions

1440px · 1280px · 1024px · 768px · 390px — every journey above is spot-checked at all five at least once per sprint that touches its screens; full matrix run in Sprint 11/12.

## Locale/State Matrix

Every screen reviewed in **English, French, Arabic (RTL)**, and in each of: loading, empty, error, success, unauthorized (401), forbidden (403) where that state is reachable. This matrix is the actual acceptance bar referenced by `CLAUDE.md`'s "Definition of Done" — a feature isn't done until this matrix passes for it, not just its happy path.

## Authorization Test Matrix (backend)

For every RBAC-guarded module (professional portal, admin, protocol library, training booking): a test asserting each of `guest / customer / professional_pending / professional_approved / professional_suspended / administrator` gets the correct 200/401/403 outcome per endpoint. This is the single highest-value test category given the platform's dual B2C/B2B/admin surface — it is written alongside the guard, not deferred.

## CI Gate (GitHub Actions, see `DEPLOYMENT.md`)

`lint` → `typecheck` → `unit+integration tests` → `build` → `docker build` must all pass before merge. Playwright E2E and Lighthouse CI run on a scheduled/nightly job plus on-demand for release branches (too slow to gate every commit).

## What "Tested" Does Not Mean

A green CI run is necessary but not sufficient. Per `CLAUDE.md`, UI features additionally require a manual pass confirming: no console errors, no visible layout shift, correct RTL mirroring, and that the feature reads as finished rather than templated — these are logged in `PROGRESS.md`, not just inferred from passing automated tests.
