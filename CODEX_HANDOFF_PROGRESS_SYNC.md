# Handoff prompt — reconcile PROGRESS.md/TODO.md with what's actually built, then continue

Paste everything below this line to Codex (or another coding agent).

---

You are continuing work on **IOMA Paris Dubai**, a production-grade digital platform (Next.js 15 + NestJS + MongoDB monorepo) at `C:\Users\Ala\Desktop\ioma`. This is a real client project with binding rules, not a prototype.

**Before touching any code, read these files in full, in this order:**

1. `CLAUDE.md` — the binding rules for this repo. Overrides your default behavior. Pay special attention to: no placeholders/dead buttons/fake data, every mutating endpoint needs DTO validation + auth guard, forms use React Hook Form + Zod with shared schemas in `packages/validation`, all API reads/writes go through TanStack Query, full EN/FR/AR i18n (AR is RTL) on every page, WCAG 2.2 AA, and — the rule most relevant to this handoff — **`PROGRESS.md` must be updated after every meaningful task, and `TODO.md` checkboxes must stay in sync with `SPRINTS.md`/`PROGRESS.md`: "a task is not 'done' in one file while still unchecked in another."**
2. `ARCHITECTURE.md`, `DATA_MODEL.md` (read the "Partners & Booking" and "B2B" sections closely), `DECISIONS.md`, `CLIENT_REQUIREMENTS.md`, `DESIGN_SYSTEM.md`, `API_SPEC.md`.
3. `SPRINTS.md` — read the Sprint 7 and Sprint 8 entries in full (objective, tasks, acceptance criteria, required tests).
4. `TODO.md` — the Sprint 7 and Sprint 8 checklists.
5. `PROGRESS.md` — read the whole file. This project's single hardest-enforced rule, stated repeatedly throughout this file: **every claim in this log is backed by a real HTTP request or a real Playwright browser run against a running server — never inferred from a successful build.** The bug log (currently ending at #39) documents many real, non-obvious bugs found this way — worth reading so you don't reintroduce them.

## The problem you're being asked to fix

`SPRINTS.md` currently marks **Sprint 7 — Partners & Booking as `DONE (2026-08-07)`** and **Sprint 8 — B2B as `DONE`**. `TODO.md` mirrors this — Sprint 7 fully checked, Sprint 8 checked except for one line: `- [ ] Playwright E2E: registration → approval → order` is still unchecked.

**But `PROGRESS.md` has no "Completed Tasks — Sprint 7" or "Completed Tasks — Sprint 8" section at all**, no bug-log entries for either sprint, and its own "Current Sprint" / "Remaining Work" sections still read "Sprints 0-6 ... complete. Next: Sprint 7." This is a direct, in-repo contradiction of `CLAUDE.md`'s own rule quoted above, and it means nobody can currently trust the "DONE" markers on Sprint 7/8 — they were never backed by this project's required live-verification step, or that step happened somewhere its results were never written down.

Real code does exist for both sprints (confirmed before this handoff was written — do not rebuild from scratch):

- `apps/api/src/modules/partners/` — `partners.module.ts`, `partners.controller.ts`, `partners.service.ts` (+ `partners.service.spec.ts`), `availability.service.ts`, schemas for `Partner`/`Availability`/`Service`/`Treatment`, DTOs for querying partners/availability. Registered in `app.module.ts`.
- `apps/api/src/modules/appointments/` — `appointments.module.ts`, `appointments.controller.ts`, `appointments.service.ts` (+ `appointments.service.spec.ts`), `Appointment` schema, DTOs. Registered in `app.module.ts`.
- `apps/web/src/app/[locale]/(public)/partners/page.tsx` and `.../partners/[slug]/page.tsx`.
- `apps/web/src/app/[locale]/(public)/booking/page.tsx` and `.../booking/confirmation/[id]/page.tsx`.
- A full-repo `pnpm typecheck` passes cleanly with all of this in place (spot-checked before writing this handoff — that's the extent of the verification done so far, i.e. almost none of what this project actually requires).
- Presumably a B2B module exists too for Sprint 8 (professional applications/dashboard/orders) — locate it the same way (`find apps/api/src/modules -maxdepth 1`, check `app.module.ts` imports) before assuming its shape.

## What you need to actually do

**Do not just edit `PROGRESS.md` to say "done" based on the code existing or the build passing.** Follow this project's own standard exactly:

1. **Audit Sprint 7 end to end.** Read every file in `partners`/`appointments` (API) and `partners`/`booking` (web). Check it against `SPRINTS.md`'s Sprint 7 acceptance criteria specifically:
   - "booking the last available slot for a resource makes it unavailable to a second concurrent booking attempt (server-enforced, not just UI-disabled)" — find the concurrency-safe logic (should be a Mongo transaction or an atomic conditional update in `appointments.service.ts`/`availability.service.ts`) and confirm a Jest test actually exercises two concurrent booking attempts for the same slot and asserts only one succeeds. If that test doesn't exist or doesn't genuinely simulate concurrency (e.g. it just calls the service twice sequentially, which proves nothing), write a real one.
   - "map renders with zero API key required by default" — confirm the partner locator actually uses OSM/Leaflet (or whatever keyless provider) and renders without any Maps API key configured in `.env`.
   - Reschedule/cancel with policy, reminder job — `TODO.md` currently notes "reminder job deferred to Sprint 10 admin scope"; confirm that's still an accurate, honest statement (not a silently-abandoned requirement) or correct it.
2. **Audit Sprint 8 end to end**, same treatment, against its acceptance criteria: an unapproved professional cannot see B2B pricing or place an order (server-enforced — write/find a test that actually tries this as a `pending`/`suspended`/`rejected` professional and asserts it's blocked, not just checks the code path exists); admin approval/rejection/suspension actually flips access; the portal is visually distinct from the admin/SaaS-generic look (`CLAUDE.md`'s UI rules). **Specifically resolve the unchecked `TODO.md` line**: either the Playwright registration → approval → order E2E test genuinely exists and passes (in which case check the box) or it doesn't (in which case write it — see `apps/web/e2e/guest-checkout.spec.ts` and `apps/web/e2e/account-navigation.spec.ts` for this repo's established E2E patterns).
3. **Live-verify, the way every other sprint in `PROGRESS.md` was verified**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` at the repo root, then rebuild the Docker containers (`docker compose -f infrastructure/docker/docker-compose.yml up -d --build web api`, wait for both healthy), run the seed script, and actually exercise both sprints against the rebuilt stack — real `curl`/Playwright runs, not inference from a green build. Fix whatever you find broken; this codebase's own history (bugs #1-39) shows real defects routinely hide behind a passing build.
4. **Backfill `PROGRESS.md` honestly**, matching its exact existing structure and tone (see the Sprint 5 and Sprint 6 "Completed Tasks" sections as your template — bullet points on what's real and how it was verified, then a numbered "bugs found and fixed" subsection continuing from #40 for anything genuinely broken you find and fix during this audit). If something in Sprint 7 or 8 turns out to be incomplete or not actually working, **say so plainly** — do not paper over it to make the "DONE" marker retroactively true. Update `PROGRESS.md`'s "Current Sprint" and "Remaining Work" sections to match reality once you're done.
5. **Correct `TODO.md`/`SPRINTS.md`** if anything you find contradicts their current claims — including reverting a "DONE" marker to something honest (e.g. "DONE except X, see PROGRESS.md") if that's what's true. Add any non-obvious architectural findings to `DECISIONS.md`, dated, with rationale.
6. **Only once Sprint 7 and Sprint 8 are genuinely, verifiably done and documented**, continue to **Sprint 9 — Training & Protocols** per its `SPRINTS.md` entry (training catalogue reusing Sprint 7's availability/capacity primitives, protocol library gated to approved professionals, signed MinIO URLs for PDFs/videos — never public).

## One open item to carry forward, not lose

`PROGRESS.md`'s "Blockers" section currently flags an unresolved, real infrastructure issue: Next.js's built-in image optimizer can permanently hang on a specific `(url, width, quality)` variant of the homepage hero image if a request for that variant is interrupted mid-flight, reproducible under the Docker container's actual `next start` production command. It's root-caused (see bug #39) but not fixed — only worked around by restarting the `web` container. If you hit homepage `page.goto` timeouts in Playwright during this work, that's almost certainly this bug recurring, not a new regression — restart `ioma-dev-web-1` and re-check before assuming you broke something. It still needs a real fix (Next.js patch upgrade + re-test, cache pre-warming, or a CDN-served hero image) before production launch; feel free to pick it up if you have bandwidth after Sprint 9, but don't let it block sprint progress.

## House style, in short

- Conventional commits, but **do not commit anything** unless explicitly asked — this repo's standing rule is that batches of work are presented for review first.
- No emojis unless asked.
- Don't add abstractions, config toggles, or "future-proofing" beyond what's actually needed.
- Match the existing code's patterns exactly — Sprint 4/5/6's modules (`cart`, `account`, `diagnosis`) are the closest precedent for service/controller/DTO/schema structure, provider-abstraction pattern, and ownership-enforcement testing style.
