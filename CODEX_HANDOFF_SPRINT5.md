# Handoff prompt — finish Sprint 5 (Customer Account)

Paste everything below this line to Codex.

---

You are continuing work on **IOMA Paris Dubai**, a production-grade digital platform (Next.js 15 + NestJS + MongoDB monorepo) at `C:\Users\Ala\Desktop\ioma`. This is a real client project with binding rules, not a prototype.

**Before touching any code, read these files in full, in this order:**

1. `CLAUDE.md` — the binding rules for this repo. Overrides your default behavior. Pay special attention to: no placeholders/dead buttons/fake data, every mutating endpoint needs DTO validation + auth guard, forms use React Hook Form + Zod with shared schemas in `packages/validation`, all API reads/writes go through TanStack Query (never ad hoc `fetch`), Zustand only for genuinely client-only state, full EN/FR/AR i18n (AR is RTL) on every page, WCAG 2.2 AA, and — critically — **update `PROGRESS.md` after every meaningful task, keep `TODO.md` checkboxes in sync with `SPRINTS.md`/`PROGRESS.md`, and log architectural decisions in `DECISIONS.md` with rationale.**
2. `ARCHITECTURE.md` — monorepo/module structure, route group conventions.
3. `DATA_MODEL.md` — read the "Identity & Access" section closely (`User`, `CustomerProfile`, `Address`).
4. `SPRINTS.md` — read the Sprint 5 entry in full for the objective, task list, acceptance criteria, and required tests.
5. `TODO.md` — the Sprint 5 checklist (currently unchecked).
6. `PROGRESS.md` — read the whole file, but especially the most recent entries (Sprint 4's bug list and the Sprint 5 "Current Task" note once you get there) to understand how this project verifies work: **every claim in this log is backed by a real HTTP request or a real Playwright browser run against a running server — never inferred from a successful build.** Follow that same discipline. This file's bug log also documents several real, non-obvious bugs (Docker build-arg vs runtime env vars, CORS origin mismatches, Jest/nanoid/pnpm ESM issues, Mongoose union-type reflection metadata) — worth skimming so you don't reintroduce them.
7. `DECISIONS.md` — architectural decisions with dates and rationale, append-only.
8. `CLIENT_REQUIREMENTS.md` — what's genuinely missing from the client (real content, credentials, legal copy) and what stands in for it meanwhile. Never invent data that belongs in this list.
9. `DESIGN_SYSTEM.md` — tokens, typography, the "no default shadcn look" rule, range-color usage restriction.
10. `API_SPEC.md` — endpoint conventions.

## Current state (what's already done)

Sprints 0–4 are complete and live-verified (full public site, design system, B2C e-commerce with cart/checkout/payments). Sprint 5 (Customer Account) is **in progress**, started but not finished:

**Already built and live-tested (do not rebuild):**

- Backend `AccountModule` (`apps/api/src/modules/account/`): `CustomerProfile`, `Address`, `AccountDeletionRequest` schemas; `GET/PATCH /account/profile`, `GET/POST/PATCH/DELETE /account/addresses[/:id]`, `PATCH /account/password`, `POST /account/deletion-request`. All auth-guarded (`JwtAuthGuard`), address endpoints enforce per-user ownership (verified live: a second user gets a 403 trying to touch another user's address). Registered in `app.module.ts`.
- `packages/types/src/auth.ts`: added `AuthResult` type.
- Frontend auth plumbing: `apps/web/src/stores/auth-store.ts` (Zustand + persist — `user`/`accessToken`/`refreshToken`), `apps/web/src/lib/api.ts` rewritten to attach `Authorization: Bearer` and auto-refresh-and-retry once on a 401 (with in-flight refresh deduping — don't break this, the refresh-token rotation on the backend treats a duplicate rotation as a stolen-token replay and revokes the whole session).
- `apps/web/src/hooks/use-auth.ts`: `useLoginMutation`, `useRegisterMutation`, `useLogout`.
- `apps/web/src/app/[locale]/login/page.tsx` and `.../register/page.tsx`: real forms using the existing `loginSchema`/`registerSchema` from `@ioma/validation` (already existed, mirrors the API DTOs exactly). **Not yet live-tested in a browser.**
- `apps/web/src/components/layout/account-link.tsx`: a client component that links to `/account` if logged in, `/login` if not. **Written but not yet wired into `header.tsx`** (header currently still has a static `Link href="/account" prefetch={false}"` — replace it with `<AccountLink />`, remove `/account` from the `NOT_YET_BUILT` prefetch-disable sets in both `header.tsx` and `footer.tsx` since it's now a real route).
- Messages: `Login`, `Register`, and `Account` (with `nav`, `dashboard`, `profile`, `addresses`, `orders`, `security`, `deletion` sub-namespaces) added to all three `apps/web/messages/{en,fr,ar}.json` — already written, validated as parseable JSON, real translations (not machine-translated placeholders).

**Not yet built — this is your job:**

1. **Account pages** (`apps/web/src/app/[locale]/(account)/account/...` — create the `(account)` route group per `ARCHITECTURE.md`):
   - `/account` — dashboard (welcome message using the real first name, quick links to the other subsections)
   - `/account/profile` — profile form (first/last name, phone, date of birth, skin concerns, newsletter opt-in, preferred locale) wired to `GET/PATCH /account/profile`
   - `/account/addresses` — list + add/edit/remove saved addresses, wired to the address CRUD endpoints, "set as default" action
   - `/account/orders` — order history list, reusing the existing `GET /orders` endpoint and `useOrderQuery`-style pattern already established in `apps/web/src/hooks/use-orders.ts` (Sprint 4) — empty state if no orders yet
   - `/account/security` — change-password form wired to `PATCH /account/password`, must surface the "current password incorrect" error distinctly
   - `/account/delete` — deletion-request flow: explanation text (deletion is a _request_, not immediate — see the `warning` translation key already written), optional reason field, confirmation step before submitting (per `CLAUDE.md`: "every destructive or hard-to-reverse action requires confirmation"), wired to `POST /account/deletion-request`
   - A shared `(account)` layout that **client-side guards** every page under it: if `useAuthStore.getState().user` is null after hydration, redirect to `/login`. (Tokens live in `localStorage` via the Zustand persist middleware, not a cookie, so this has to be a client-side check — there's no server-side session to check at request time. This is a known, accepted limitation for this sprint, not something to "fix" by re-architecting token storage — don't scope-creep into cookie-based sessions.)
   - Add a "Sign out" action (use the existing `useLogout()` hook) somewhere in the account nav.
   - Link `/wishlist` (already fully built in Sprint 4, was just waiting on real login to be reachable) from the account nav too.
2. **Explicitly out of scope for this sprint** — do not build these, just leave them out of the account nav: "saved routines," "diagnosis/before-after history," and "appointments list" depend on the Diagnosis engine (Sprint 6) and Booking engine (Sprint 7), neither of which exist yet. Building hollow shells for data models that don't exist yet would violate `CLAUDE.md`'s placeholder rules. If you want to note this, add one line to `PROGRESS.md`/`TODO.md` saying so — mirror how Sprint 3 handled the Professionals page (routed to the real Contact form instead of a stub application portal, explicitly logged as Sprint 8 scope).
3. **Forgot-password flow**: also out of scope. `packages/validation/src/auth.ts` already has `forgotPasswordSchema`/`resetPasswordSchema` written ahead of time, but there's no backend endpoint and no `EmailProvider` adapter wired yet (see `CLIENT_REQUIREMENTS.md`) — an email-based reset flow can't actually deliver an email right now. Don't build a dead-end UI for it.
4. **Tests** (required by `SPRINTS.md`'s Sprint 5 entry):
   - Jest: authorization tests proving a user can never read/write another user's profile or addresses. The address ownership check is already covered by a live manual test in this session (documented in your context above) but **not yet an automated Jest test** — write one in `apps/api/src/modules/account/` following the existing pattern in `apps/api/src/modules/payments/payments.service.spec.ts` (mock the Mongoose model via `@nestjs/testing`'s `Test.createTestingModule`, `getModelToken`).
   - Playwright: a full account-navigation E2E test (register → land on `/account` → visit every subsection → update profile → add an address → change password → sign out) in `apps/web/e2e/`, following the pattern in `apps/web/e2e/guest-checkout.spec.ts`. Run it against a **rebuilt Docker container**, not just `pnpm dev` — this project has repeatedly found real bugs (CORS, missing Docker build args, stale schema reflection metadata) that only showed up in a production-built container, not dev mode. See `infrastructure/docker/docker-compose.yml` and the `up -d --build web api` pattern already used throughout `PROGRESS.md`.
5. **Live-verify everything before calling it done** — this project's single hardest-enforced rule. A green `pnpm build` or an HTTP 200 is not proof a feature works: run `pnpm --filter @ioma/api typecheck && pnpm --filter @ioma/api lint`, same for `@ioma/web`, then `pnpm test` and `pnpm build` at the repo root, then rebuild the Docker containers and actually exercise the flow with `curl`/a real Playwright browser session — register a user, update their profile, add/edit/delete an address, change their password (test both wrong-current-password and correct), request deletion, sign out, confirm the account pages 401/redirect when logged out. If anything about the API contract in this handoff turns out to be stale (a route, a field name, a response shape), re-read the actual source file rather than trusting this document — this handoff is a snapshot of one point in time.
6. **Update docs when done**: `PROGRESS.md` (new "Completed Tasks — Sprint 5" section following the exact structure of the existing Sprint 4 section — objective bullets, then any real bugs found and fixed with the next sequential bug number, continuing from wherever the bug log currently ends), `TODO.md` (check off Sprint 5 items, honestly note the three deferred subsections and forgot-password), `SPRINTS.md` (flip the Sprint 5 header from `**NOT STARTED**` to `**DONE** (<today's date>)`), `DECISIONS.md` if you make any non-obvious architectural call (e.g., the client-side-only auth-guard limitation above is exactly the kind of thing that belongs there, dated, with the "why").

## House style, in short

- Conventional commits, but **do not commit anything** unless explicitly asked — this repo's standing rule is that batches of work are presented for review first.
- No emojis unless asked.
- Don't add abstractions, config toggles, or "future-proofing" beyond what Sprint 5 actually needs.
- Match the existing code's patterns exactly (look at how Sprint 4's `apps/web/src/app/[locale]/(shop)/cart/page.tsx` and `apps/web/src/hooks/use-orders.ts` are structured before inventing a new pattern for account pages — they're the closest precedent).
