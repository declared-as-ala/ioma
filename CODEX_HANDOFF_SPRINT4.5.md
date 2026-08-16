# Handoff prompt — Sprint 4.5 (Responsive & Mobile Hardening)

Paste everything below this line to Codex.

---

You are continuing work on **IOMA Paris Dubai**, a production-grade digital platform (Next.js 15 + NestJS + MongoDB monorepo) at `C:\Users\Ala\Desktop\ioma`. This is a real client project with binding rules, not a prototype.

**Before touching any code, read these files in full:**

1. `CLAUDE.md` — binding rules for this repo, overrides your defaults. For this sprint specifically: "Touch targets ≥ 44×44px on mobile," "Color is never the only signal," the UI Rules section (no glassmorphism/neon/heavy shadows — restraint comes from typography/whitespace/photography), and — as always — **update `PROGRESS.md` after every meaningful task, keep `TODO.md` checkboxes in sync with `SPRINTS.md`/`PROGRESS.md`, log real architectural decisions in `DECISIONS.md`.**
2. `DESIGN_SYSTEM.md` — read the "Breakpoints" section closely: `sm 390px · md 768px · lg 1024px · xl 1280px · 2xl 1440px`, and the spacing/grid section (12-column, 24px gutter desktop / 16px mobile).
3. `SPRINTS.md` — read the **Sprint 4.5 — Responsive & Mobile Hardening** entry in full (inserted between Sprint 4 and Sprint 5; numbered 4.5 deliberately so it doesn't renumber every later sprint reference already written elsewhere). This is your objective, task list, acceptance criteria, and required tests, verbatim.
4. `TODO.md` — the Sprint 4.5 checklist (currently unchecked) mirrors the `SPRINTS.md` entry.
5. `PROGRESS.md` — read the whole file, at minimum skim every "bugs found and fixed" subsection. This project's single hardest-enforced rule: **every claim in this log is backed by a real HTTP request or a real Playwright browser run against a running server — never inferred from a successful build or an eyeballed screenshot.** Follow that discipline here too — "looks fine at 1440 and 390" is not the same as "verified no horizontal overflow at all 5 breakpoints," and this project has repeatedly found real bugs that a superficial check missed.
6. `apps/web/playwright.config.ts` and `apps/web/e2e/public-smoke.spec.ts` — the existing smoke-test pattern you'll extend. Also skim `apps/web/e2e/design-system.a11y.spec.ts` and `apps/web/e2e/guest-checkout.spec.ts` for how this project structures Playwright specs (locale loop, `test.describe`, real assertions against rendered DOM, not snapshot-only).

## Scope

Everything built in Sprints 0–4 (the design system, the full public site, and the Sprint 4 commerce surface). **Not** Sprint 5's account pages — those are being built separately and may not exist yet when you start; if they do exist by the time you run this, sweep them too, but don't block on them.

Full route list to check at every breakpoint:

- `/design-system` (every token/primitive on the page)
- `/`, `/maison`, `/technology`, `/professionals`, `/contact`, `/faq`
- `/treatments`, `/treatments/diagnosis-consultation`, `/treatments/hydra-protocol`, `/treatments/renew-protocol`, `/treatments/calm-protocol`
- `/journal`, `/journal/dubai-summer-barrier-routine`, `/journal/reading-a-diagnosis`
- `/privacy-policy`, `/cookie-policy`, `/shipping-policy`, `/return-policy`, `/terms-and-conditions`, `/accessibility-statement`, `/ai-consent`
- `/shop`, `/shop/hydra-serum-intense` (or any real seeded product slug — check `apps/api/src/seed/catalog-data.ts` if slugs have changed)
- `/cart`, `/checkout` (all 3 steps: address, delivery, payment), `/checkout/confirmation/[orderNumber]` (you'll need a real order number — run through a guest checkout first, or read `apps/web/e2e/guest-checkout.spec.ts` for how the existing test does it)
- `/wishlist`

At breakpoints **390 / 768 / 1024 / 1280 / 1440**, in **all 3 locales** (`en`/`fr`/`ar` — `ar` is RTL, check it doesn't just mirror correctly at desktop but also wrap/reflow correctly at narrow widths).

## What to actually do

1. **Find real defects, don't just eyeball and move on.** Likely trouble spots based on what's already known about this codebase:
   - `header.tsx`'s primary nav is `hidden lg:flex` — below `lg` (1024px) there is currently **no visible replacement**. Check whether a mobile menu trigger exists at all; if not, this is a real, ship-blocking gap (users below 1024px currently cannot reach primary navigation), not a nice-to-have.
   - The checkout wizard's step indicator (`apps/web/src/app/[locale]/(shop)/checkout/page.tsx`) renders 3 steps with connecting lines in a single `flex` row — check it doesn't overflow or wrap awkwardly at 390px.
   - PDP's two-column grid (`apps/web/src/app/[locale]/(shop)/shop/[slug]/page.tsx`, `grid gap-12 md:grid-cols-2`) — confirm the image and content actually stack cleanly below `md` (768px), not just technically not-overflow.
   - The cart drawer (`apps/web/src/components/shop/cart-drawer.tsx`, uses the `Sheet` primitive at `sm:max-w-sm`) — check its width and content readability on a 390px viewport where `sm:max-w-sm` doesn't apply.
   - Homepage's range tile grid and results stat band (`apps/web/src/app/[locale]/(public)/page.tsx`) — dense grids are the most likely place for overflow.
   - Any `group-hover:` usage (product card hover states, nav underlines) — confirm the underlying content/action is still reachable without hover on a touch device (it usually is, since touch "hover" fires on tap in most browsers, but verify rather than assume, especially for anything that reveals a _secondary_ action only on hover).
   - Icon-only buttons using the `icon-xs`/`icon-sm` size variants in `apps/web/src/components/ui/button.tsx` (`size-6`/`size-7` = 24px/28px) — these are **under** the 44×44px minimum `CLAUDE.md` requires for mobile touch targets. Decide per-instance: bump to `icon` (32px, still short) or `icon-lg` (36px, still short) on mobile via a responsive class, or add invisible touch-target padding (a common pattern: keep the visual size small, expand the hit area with `before:absolute before:inset-[-Npx]` or similar) — don't just blanket-resize every icon button if that breaks the visual density Sprint 2 established; use judgment and note the pattern you land on in `DECISIONS.md`.
2. **Fix what you find.** This sprint's acceptance criteria is fixed defects, not a written report of defects. Follow this project's existing component/token conventions (`DESIGN_SYSTEM.md`, existing Tailwind usage patterns) rather than introducing new one-off responsive hacks.
3. **Write the automated regression suite** — either extend `apps/web/e2e/public-smoke.spec.ts` or add a new `apps/web/e2e/responsive-smoke.spec.ts`. Loop over the route list × 3 locales × 5 breakpoints (`page.setViewportSize({ width, height })` before navigating, or set it once per test), and at minimum assert:
   ```ts
   const hasOverflow = await page.evaluate(
     () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
   );
   expect(hasOverflow).toBe(false);
   ```
   Plus a handful of targeted, specific assertions for the fixes you make in step 2 (e.g., "the mobile nav trigger is visible and clickable at 390px," "the checkout step indicator's bounding box doesn't exceed the viewport width at 390px"). This is a large matrix (≈20 routes × 3 locales × 5 breakpoints ≈ 300 combinations if done naively) — use judgment on trimming it to something that runs in reasonable CI time without losing real coverage: e.g., the full breakpoint sweep on `en` for every route, but only the two most failure-prone breakpoints (390 and 768) for `fr`/`ar`, since locale mainly affects text length/RTL direction rather than layout structure per se. Document whatever reduction strategy you choose and why.
4. **Live-verify against a rebuilt Docker container**, not just `pnpm dev` — this project has repeatedly found bugs (CORS, Docker build-arg vs runtime env vars, stale Mongoose reflection metadata) that only surfaced in a production-built container. See `infrastructure/docker/docker-compose.yml` and the `docker compose -f infrastructure/docker/docker-compose.yml up -d --build web api` pattern used throughout `PROGRESS.md`.
5. Run the full existing verification chain before calling this done: `pnpm --filter @ioma/web typecheck && pnpm --filter @ioma/web lint`, then `pnpm test` and `pnpm build` at the repo root, then the full Playwright suite (`npx playwright test` from `apps/web`) including your new responsive spec — all green, not just the new spec.
6. **Update docs**: `PROGRESS.md` (new "Completed Tasks — Sprint 4.5" section following the exact structure of the existing Sprint 4 section — objective bullets, then any real bugs found and fixed with the next sequential bug number continuing from wherever the bug log currently ends — check the file, don't guess the number), `TODO.md` (check off the Sprint 4.5 items), `SPRINTS.md` (flip the Sprint 4.5 header from `**NOT STARTED**` to `**DONE** (<today's date>)`), `DECISIONS.md` for any non-obvious call (the touch-target-padding-vs-resize decision mentioned above is a good candidate).

## House style, in short

- Conventional commits, but **do not commit anything** unless explicitly asked — this repo's standing rule is that batches of work are presented for review first.
- No emojis unless asked.
- Don't add new abstractions/config beyond what this sprint needs — this is a hardening pass on existing components, not a redesign. If a component's existing responsive approach (e.g., `sm:`/`md:`/`lg:` Tailwind variants) already matches the codebase's conventions, extend it; don't introduce a different responsive strategy (container queries, a CSS-in-JS breakpoint hook, etc.) without a real reason logged in `DECISIONS.md`.
- If something in this handoff turns out to be stale (a route that's moved, a component that's been refactored since this was written), trust the actual source over this document — it's a snapshot of one point in time.
