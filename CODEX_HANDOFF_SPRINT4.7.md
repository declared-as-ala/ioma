# Handoff prompt — Sprint 4.7 (Mobile Bottom Tab Navigation)

Paste everything below this line to Codex.

---

You are continuing work on **IOMA Paris Dubai**, a production-grade digital platform (Next.js 15 + NestJS + MongoDB monorepo) at `C:\Users\Ala\Desktop\ioma`. This is a real client project with binding rules, not a prototype.

**Before touching any code, read these files in full:**

1. `CLAUDE.md` — binding rules, overrides your defaults. For this sprint specifically: "Touch targets ≥ 44×44px on mobile," no glassmorphism/heavy shadows/loud gradients (restraint from typography/whitespace, not decoration), and — as always — **update `PROGRESS.md` after every meaningful task, keep `TODO.md` checkboxes in sync with `SPRINTS.md`/`PROGRESS.md`, log real architectural decisions in `DECISIONS.md`.**
2. `DESIGN_SYSTEM.md` — breakpoints (`sm 390 / md 768 / lg 1024 / xl 1280 / 2xl 1440`) and the Z-Index Scale section (`--z-sticky-header 40 · --z-dropdown 50 · --z-drawer 60 · --z-modal 70 · --z-toast 80 · --z-tooltip 90`) — the bottom tab bar needs to sit correctly in this stack.
3. `SPRINTS.md` — read the **Sprint 4.7 — Mobile Bottom Tab Navigation** entry in full (inserted after Sprint 4.6, before Sprint 5; numbered 4.7 so it doesn't renumber every later sprint reference already written elsewhere). This is your objective, task list, acceptance criteria, and required tests, verbatim — the rest of this prompt expands on it, doesn't replace it.
4. `TODO.md` — the Sprint 4.7 checklist mirrors the `SPRINTS.md` entry.
5. `PROGRESS.md` — read the whole file, at minimum every "bugs found and fixed" subsection and the most recent Sprint 4.5/4.6 entries. This project's hardest-enforced rule: **every claim in this log is backed by a real HTTP request or a real Playwright browser run against a running server — never inferred from a successful build.** Follow that here too.
6. **Read the current state of the two sprints this one builds on, don't assume — they may still be in flight:**
   - `apps/web/src/components/layout/mobile-navigation.tsx` (Sprint 4.6's hamburger-drawer mobile nav — this sprint **adds to**, does not replace, this; the drawer is for the full site nav, the new bottom bar is for the 5 most-used destinations).
   - `apps/web/src/components/layout/header.tsx` (current structure: sticky header, scroll-shadow state, `MobileNavigation` trigger, `AccountLink`, `CartTriggerButton`, primary nav `hidden ... xl:flex`).
   - `apps/web/src/components/layout/account-link.tsx` and `apps/web/src/components/shop/cart-trigger-button.tsx` — **reuse their login-aware / cart-count logic directly, don't duplicate it** — the Account tab and Bag tab in the new bottom bar should read from the same `useAuthStore`/`useCartQuery` sources these already use.
   - `apps/web/src/lib/motion-tokens.ts` (Sprint 4.6's central motion system) — the tab bar's tap feedback and any entrance animation must use this, not a new one-off `motion`/CSS transition.
   - Check whether Sprint 4.5's responsive-hardening fixes (mobile nav, 44px touch targets, checkout/PDP/cart reflow) have actually landed and been verified yet — `PROGRESS.md`'s Sprint 4.5 entry will say. If 4.5 is still mid-verification when you start, that's fine — just be aware layout details (page bottom padding, checkout's own mobile layout) may still be shifting under you; re-read the actual current source rather than trusting a stale description.

## What to build

1. **`apps/web/src/components/layout/bottom-tab-bar.tsx`** — a client component, fixed to the viewport bottom, visible only below `lg` (1024px — match the header's existing breakpoint choice for where its own primary nav disappears). 5 tabs:
   - **Home** → `/`
   - **Shop** → `/shop`
   - **Bag** → `/cart`, with the live item-count badge (same data source as `cart-trigger-button.tsx`'s badge)
   - **Wishlist** → `/wishlist`
   - **Account** → `/account` if logged in, `/login` if not (same logic as `account-link.tsx`)

   Each tab: icon (lucide-react, consistent with icons already used elsewhere in the header — check what's already imported for Home/Shop/Bag/Wishlist/Account concepts before picking new ones) + short label beneath it (real translated text, all 3 locales — add an `Nav.bottomTab.*` or similar namespace to `apps/web/messages/{en,fr,ar}.json` if the existing `Nav` keys don't already cover short-form labels; check first, don't duplicate translation keys that already exist for the same concept).

2. **Active-tab state**: highlight the tab matching the current route (reuse the `pathname`-matching approach already in `header.tsx`'s primary nav, e.g. `pathname.endsWith(link.href)`), `aria-current="page"` on the active tab's link for screen readers, and a visual treatment consistent with the header's existing active-state pattern (filled icon, or the same `layoutId` accent-underline/pill technique used in `header.tsx`'s primary nav — pick whichever reads better at tab-bar scale, but stay within the existing visual language, not a new pattern).

3. **Real native-app details** — this is the actual point of the sprint, not just 5 links in a flex row:
   - `padding-bottom: env(safe-area-inset-bottom)` (or the Tailwind arbitrary-value equivalent) so the bar clears the iOS home-indicator area on devices that have one.
   - A subtle top border or shadow separating the bar from page content — restrained, matching `DESIGN_SYSTEM.md`'s "no heavy shadows" rule, not a heavy elevation effect.
   - Tap feedback (scale or opacity change on press) via `lib/motion-tokens.ts`'s existing tokens, wrapped in the same `useReducedMotion()` guard pattern already used in `header.tsx` (see how `shouldReduceMotion` gates the `layoutId` animation there).
   - `z-drawer` (60) or appropriate — reason about whether it should be below the cart/search drawers (which slide in from the side/top and would visually go above a bottom-fixed bar) or need special handling so it doesn't fight with them for taps when a drawer is open; the simplest correct approach is likely hiding/not-rendering the tab bar while any Sheet/Dialog is open, if that's easy to detect from the existing Zustand drawer stores (`cart-drawer-store.ts`, `search-store.ts`) — check those first rather than inventing a new coordination mechanism.

4. **The easy-to-miss bug: page content must never render underneath the bar.** Every page needs bottom padding (or the root layout needs it) equal to the bar's rendered height on mobile viewports, applied only when the bar is actually visible (below `lg`). Check specifically:
   - Long scrollable pages (journal articles, legal pages) — does the last paragraph/link end up hidden behind the bar?
   - The checkout flow's own submit/continue buttons and the PDP's add-to-cart button — these are exactly the kind of page-bottom fixed/near-bottom elements that collide with a new fixed bottom bar. Decide whether the tab bar should be **suppressed entirely on `/checkout` and its sub-routes** (there's already a competing bottom UI there — the step navigation and submit button) and log that decision with reasoning in `DECISIONS.md`. Don't just let them silently overlap.
   - The cart drawer and any other bottom-sheet-style overlay — confirm it still renders above the tab bar correctly (z-index) and that closing it doesn't leave a rendering artifact.

5. **RTL**: confirm tab order reads correctly under `dir="rtl"` (icons/labels should mirror the same way the rest of the site's RTL layout does — check how `header.tsx`/`footer.tsx` handle this already, likely via logical CSS properties rather than manual reordering) and that any directional icon (if you use one, e.g. a chevron) mirrors via the existing `rtl:rotate-180` pattern used elsewhere in this codebase (see `apps/web/src/components/ui/cta-arrow.tsx` for the established pattern — don't reinvent it).

## Tests

Add to `apps/web/e2e/` (new file, e.g. `bottom-tab-bar.spec.ts`, following the structure of existing specs like `guest-checkout.spec.ts`):

- Bar is visible at 390px/768px, absent at 1024px+.
- Each of the 5 tabs navigates to the correct route; the correct tab shows active state on each of the 5 destination pages.
- Add an item to cart, confirm the Bag tab's badge count updates to match (same assertion style as any existing cart-badge test, if one exists — check `apps/web/e2e/guest-checkout.spec.ts` and Sprint 4.6's motion suite first).
- No vertical overlap between the bar and page content: on a long page, assert the last visible/focusable element's bounding box doesn't intersect the tab bar's bounding box.
- RTL: tab order/labels render correctly at `ar` locale.
- `prefers-reduced-motion`: tap feedback is disabled/instant (mirror however Sprint 4.6's existing reduced-motion tests assert this — check `e2e/motion-and-overlays.spec.ts` if it exists).

## Verification (non-negotiable in this project)

1. `pnpm --filter @ioma/web typecheck && pnpm --filter @ioma/web lint` clean.
2. `pnpm test` and `pnpm build` at the repo root clean.
3. Rebuild the Docker web container (`docker compose -f infrastructure/docker/docker-compose.yml up -d --build web` — check if `api` also needs rebuilding depending on what else has changed since the last build) and run the full Playwright suite (`npx playwright test` from `apps/web`), including your new spec, against the **rebuilt container**, not `pnpm dev`. This project has repeatedly found real bugs (CORS, Docker build-arg vs runtime env vars, SSR-only exceptions) that only surfaced in a production-built container — don't skip this step or report success from dev-mode testing alone.
4. Actually look at it: take a real Playwright screenshot at 390px of at least the homepage and one commerce page with the bar visible, and visually confirm nothing looks broken before calling this done.

## Update docs when done

- `PROGRESS.md`: new "Completed Tasks — Sprint 4.7" section, same structure as the existing Sprint 4/4.6 sections (objective bullets, then any real bugs found and fixed with the next sequential bug number — check the file for the current highest number, don't guess).
- `TODO.md`: check off the Sprint 4.7 items.
- `SPRINTS.md`: flip the Sprint 4.7 header to `**DONE** (<today's date>)`.
- `DECISIONS.md`: at minimum the checkout-suppression call (or whatever you actually decide there) and the drawer-coordination approach (hide-on-open vs. z-index layering) — both are exactly the kind of non-obvious call this file exists for.

## House style, in short

- Conventional commits, but **do not commit anything** unless explicitly asked.
- No emojis unless asked.
- This is an additive UI feature on top of an already-consistent design system and motion system — reuse existing tokens, icons, translation keys, and state stores wherever one already covers the need. The fastest way to get this wrong is to duplicate logic that `account-link.tsx`, `cart-trigger-button.tsx`, or `motion-tokens.ts` already own.
- If anything in this handoff turns out stale (a component renamed, a store restructured since this was written — plausible, since Sprints 4.5/4.6 were still landing when this was written), trust the actual current source over this document.
