# DECISIONS.md — IOMA Paris Dubai

Architecture/product decisions, dated, with rationale. Append-only; if a decision is later reversed, add a new entry that supersedes it rather than editing history.

---

### 2026-08-05 — Isolate git to `ioma/` rather than reuse the home-directory repo

The pre-existing git root at `C:\Users\Ala` tracks an unrelated project's history (a workforce-management app, diverged 9/17 commits from its own remote) and is not scoped to this project at all. Committing IOMA work there would corrupt an unrelated repo and remote. **Decision**: `git init` a dedicated repo inside `ioma/`, confirmed with the operator before any commit. The home-directory repo is never touched by this project.

---

### 2026-08-05 — Modular monolith, not microservices

The brief explicitly allows either but recommends starting monolithic. **Decision**: one NestJS API, one Next.js app, internally modular by domain (see `ARCHITECTURE.md`). Reasoning: the platform's domains (catalog, booking, B2B, diagnosis, admin) are highly interrelated (an order references a diagnosis-recommended routine; an appointment references a partner and a treatment; admin touches everything) — network-call overhead and distributed-transaction complexity from microservices would slow delivery without a scale requirement that justifies it yet. Each module is cohesive enough to extract later (e.g., AI analysis processing, if it needs independent GPU-backed scaling) without a rewrite.

---

### 2026-08-05 — MongoDB over a relational database

Specified in the brief. Reasoning also holds independently: the domain has several naturally document-shaped, multi-locale entities (Product with `{en,fr,ar}` fields nested at multiple levels, Page/CMS sections, diagnosis answer sets of variable shape) that would require significant normalization overhead in a relational schema for no query benefit this platform needs. Referential integrity risk is mitigated with consistent `ref` + index conventions documented in `DATA_MODEL.md`, and true transactional needs (booking slot reservation, payment/order consistency) use Mongo multi-document transactions where required.

---

### 2026-08-05 — Provider-abstraction pattern for Payment, AI Analysis, Maps, Email, SMS, Search

No real credentials exist yet for payment, AI vision, or maps (see `ENVIRONMENT.md`). **Decision**: define a TypeScript interface per capability, ship a working default (mock payment, mock AI analysis clearly labeled simulated, keyless OSM/Leaflet maps, dev-SMTP email, MongoDB text search) behind that interface, and make the real adapter a drop-in implementation of the same interface selected by config. This lets every dependent feature (checkout, AI diagnosis, partner locator) be built completely and testably now, with zero rework needed beyond writing the adapter once credentials arrive.

---

### 2026-08-05 — Gotham as the default institutional typeface (System 1), Futura PT reserved for the claim/editorial voice

The charter offers two interchangeable institutional systems (Gotham and Futura PT) but shows Futura Book specifically and only for the logo claim. **Decision**: use Gotham (System 1) as the default site-wide institutional voice for consistency, keep Futura PT available as a secondary/editorial option for future storytelling sections, and always use Futura Book for the logo claim per the charter's explicit rule. Until licensed font files are supplied, Manrope substitutes for Gotham and Jost substitutes for Futura PT (visually compatible, open license, swappable via one config change) — see `DESIGN_SYSTEM.md` and `CLIENT_REQUIREMENTS.md`.

---

### 2026-08-05 — Range colors scoped via `data-range` attribute, not global Tailwind color tokens

The brief is explicit that range colors (Hydra/Energize/etc.) must only appear in that range's own context, never as generic UI accents. Making them global Tailwind theme colors would make that misuse one keystroke away for every future contributor. **Decision**: expose them as CSS custom properties activated by a `data-range="..."` attribute scoped to range-specific components (product cards, range hero, routine badges) — structurally harder to misuse as a generic accent than a global color-palette entry.

---

### 2026-08-05 — pnpm + Turborepo monorepo

Fast, disk-efficient (pnpm's content-addressable store suits a monorepo with many shared packages), and Turborepo's task graph/caching keeps `lint`/`typecheck`/`build`/`test` fast as the codebase grows across 12 sprints. Alternative considered: npm workspaces alone — rejected for weaker caching/orchestration at this project's scale.

---

### 2026-08-05 — Tailwind CSS v4, not v3

The project started on Tailwind v3 (the version pinned when `CLAUDE.md` was first written). Starting Sprint 2's shadcn work, the shadcn CLI (v4.16.1, "Nova" preset) and MCP registry turned out to generate **Tailwind v4-only syntax throughout** every component: arbitrary-value shorthand (`gap-(--card-spacing)`), the `--spacing()` CSS function, and bare boolean data-attribute variants (`data-checked:`, `in-data-[...]:`) that v3 doesn't parse at all — the build failed with "class does not exist" errors on `outline-ring/50` before this was diagnosed. **Decision**: migrate to Tailwind v4 immediately (CSS-first `@theme` config in `globals.css`, `@tailwindcss/postcss`, no more `tailwind.config.ts`) rather than hand-patch v4 syntax back to v3 in every component pulled from here on. Migrating now, with only ~2 pages of CSS written, is far cheaper than fighting this mismatch across the remaining 10 sprints of UI work — and it's what the shadcn/MCP tooling assumes going forward. Verified via a full `lint`/`typecheck`/`build`/`test` pass plus a live dev-server request confirming the compiled CSS contains real token values, not just a "build succeeded" log line (see `PROGRESS.md`'s Sprint 1 bug #12 for why that distinction matters). `DESIGN_SYSTEM.md`'s token tables are unaffected — only the CSS delivery mechanism changed, not any color/type/spacing value.

---

### 2026-08-05 — Cairo for the Arabic locale, pairing with the Manrope/Jost Gotham/Futura substitutes

The charter specifies no Arabic typeface at all (only the FR/EN/IT claim translations exist). Rather than fall back to a generic system Arabic font, which would visually clash with Manrope/Jost's geometric character, Cairo (a geometric Arabic sans, open license, available via `next/font/google`) was chosen deliberately for visual consistency with the Latin type system. Swapped automatically via an `html[lang="ar"]` CSS override in `globals.css` — no per-component logic needed. Revisit if/when the client supplies an official Arabic type direction.

---

### 2026-08-05 — Adopted an operator-supplied reference mockup as the homepage's visual target, rebuilding it a second time

The operator supplied a detailed, French-language homepage mockup (built with an external design tool) matching the luxury-editorial brief closely — utility bar, centered logo header, full-bleed portrait hero, a diagnosis section pairing a device photo with a metric grid, a black stat band, image-split treatment/partner sections, and a journal preview. **Decision**: rebuild the homepage a second time to match this reference's structure and hierarchy closely (see `PROGRESS.md` Sprint 3 round 2), since it's a stronger, more concrete expression of the same brief than the first pass, and adopting a concrete approved reference beats iterating blind. The reference's `92%` / `18` / `20` results-band numbers were **not** copied as-is — see the next entry.

---

### 2026-08-05 — Never copy invented statistics from a reference design, even a client-approved one

The reference mockup's "Résultats visibles" section displayed specific figures (92% of women reporting more comfortable skin, 18 diagnosis parameters, 20 minutes for an in-institute reading) with a small disclaimer asterisk. `CLAUDE.md` explicitly forbids inventing clinical claims, percentages, or stats — a rule that applies regardless of whether the number originated from the AI itself or from a reference file the operator provided, since neither is a real client-supplied data source. **Decision**: keep the section's exact visual design (three-stat band, disclaimer line) but render each number as an em dash with a caption disclosing the figures are pending real client-supplied data. This is the second time in this project this exact mistake was nearly made (the first was a self-invented Arabic claim translation, see `PROGRESS.md` bug #13) — flagging both here because the pattern (an otherwise-good source tempts fabrication of a specific, checkable number) is the actual risk, not the specific instance.

---

### 2026-08-06 — Demo/seed product catalogue instead of leaving Sprint 4 catalog-less

Sprint 4's acceptance criteria (`SPRINTS.md`) requires a genuinely functional guest checkout — browse, cart, checkout, mock-pay, confirmation — which structurally needs _some_ products to exist. No real IOMA SKU list, pricing, or INCI ingredient data has been supplied (see `CLIENT_REQUIREMENTS.md`). **Decision**: seed 14 demo products (2 per range: a serum + a cream/cleanser), using product naming and positioning directly derived from copy already approved for the homepage's per-range descriptions, illustrative-but-realistic AED pricing, and `fullIngredientsText` explicitly left as "to be supplied by IOMA Paris" in all 3 locales rather than an invented formula. This is treated the same as the mock payment/AI-analysis provider pattern — a documented, clearly-scoped stand-in that makes the real commerce engine (cart math, VAT, shipping tiers, stock decrement, order history) fully functional and testable now, swappable for the real catalogue as a data change with zero code rework. Not used for anything CLAUDE.md singles out as forbidden to invent (clinical claims, percentages, "N ans"-style stats) — those stayed off the seed data entirely.

---

### 2026-08-06 — ProductVariant and InventoryItem folded into one Mongoose collection

`DATA_MODEL.md` specifies `ProductVariant` and `InventoryItem` as separate collections (1:1, keyed by `variantId`). For Sprint 4's scope — no multi-warehouse requirement, no admin inventory UI yet (that's Sprint 10) — querying two collections for every PDP/cart/checkout price-and-stock read added a join with no present benefit. **Decision**: fold `quantityOnHand`/`quantityReserved`/`lowStockThreshold`/`backorderAllowed` directly onto `ProductVariant` for now. Splitting them back out is a straightforward migration if Sprint 10's admin needs warehouse-level tracking — no call site outside `apps/api/src/modules/catalog` and `orders.service.ts`'s stock-decrement step depends on the collection boundary.

---

### 2026-08-06 — Guest cart/wishlist identity via a client-generated `X-Guest-Session-Id` header, not a cookie

Cart and checkout must work for anonymous guests (`SPRINTS.md` Sprint 4). Two options existed: a server-set cookie (the API already has `credentials: true` CORS configured) or a client-generated UUID sent as a request header. **Decision**: header-based. A cookie's `SameSite`/`Secure` behavior differs between this repo's local dev shape (`apps/web` on :3000, `apps/api` on :4000 — genuinely cross-origin) and the documented production shape (same-origin behind a reverse proxy), which would mean testing one cookie configuration locally and shipping a different one — a real place for a silent regression to hide. A UUID generated once via `crypto.randomUUID()` and persisted in `localStorage` (`apps/web/src/lib/guest-session.ts`) behaves identically in both shapes, needs no CORS credential dance, and is trivially inspectable in tests. Logged-in requests never send this header — the API resolves cart ownership from the JWT instead (`OptionalJwtAuthGuard`).

---

### 2026-08-06 — Mock payment outcome is a checkout-form choice, not a hidden test hook

`SPRINTS.md` requires both a "guest checkout happy path" and a "mock payment failure/retry" flow to be genuinely exercisable, not simulated only in a test file. **Decision**: the checkout payment step's two buttons ("Simulate successful payment" / "Simulate failed payment") are the real, only UI for choosing a payment outcome while `PAYMENT_PROVIDER=mock` — visible to any user, not a hidden query param — paired with an explicit "Demo mode — no real charge will be made" banner per `CLAUDE.md`'s requirement that mock/demo functionality never be mistakable for real. This keeps the failure/retry path testable by both Playwright and a human reviewer through the identical UI a real payment step will eventually occupy.

---

### 2026-08-06 — `NEXT_PUBLIC_API_URL` must be a Docker build ARG, not a runtime `environment:` entry

Found live: after building Sprint 4's PLP against the containerized dev stack, the shop page consistently rendered "no products," even though `curl`ing the API directly returned all 14 seeded products. Root cause: `web.Dockerfile` never declared `NEXT_PUBLIC_API_URL` as a build `ARG`, and `docker-compose.yml` only set it under the `web` service's `environment:` block — which affects the already-built container's running process, not the `next build` step that inlines `NEXT_PUBLIC_*` vars into the client JS bundle. The browser's bundled `apiFetch` calls were silently falling back to same-origin (`""`), hitting the Next.js server on :3000 for a path that only exists on the API at :4000. This is exactly the class of bug `ENVIRONMENT.md` already warned about ("baked in at build time, not read at runtime") — the doc was right, the Dockerfile/compose wiring just never followed it. **Decision**: `web.Dockerfile` now declares `ARG NEXT_PUBLIC_API_URL=""` (defaulting empty, matching the documented same-origin production shape) before the `next build` step; `docker-compose.yml`'s dev-stack `web` service passes it via `build.args`, since the dev stack has no reverse proxy in front of `web`/`api` and the browser genuinely needs the API's host-reachable URL. Caught by an actual Playwright browser run against the rebuilt container, not by a curl/status-code check — see `PROGRESS.md`'s recurring lesson that a passing build or a 200 status code is not proof a client-side data flow works.

---

### 2026-08-06 — CORS accepts both `localhost` and `127.0.0.1` forms of `APP_URL` in local dev, never in production

Found live (reported by the operator, confirmed as a CORS problem on first guess): `apps/api`'s CORS config allowed only the exact string in `APP_URL` (`http://localhost:3000`), so opening the dev site via `http://127.0.0.1:3000` — the identical server, but a different browser-level origin — got a mismatched `Access-Control-Allow-Origin` header back and had every API response silently discarded by the browser. This was invisible to every existing check: `curl` doesn't enforce CORS, and `playwright.config.ts`'s `baseURL` happened to already use the one hostname (`localhost`) that worked. **Decision**: `main.ts` now derives allowed origins from `APP_URL` via a small `allowedOrigins()` helper — when the hostname is `localhost` or `127.0.0.1`, both interchangeable forms are allowed; for any other hostname (i.e., a real production `APP_URL`), the exact configured origin is returned unchanged, so this never widens CORS in production. The right fix is narrow and hostname-gated rather than a blanket "allow any origin," which would defeat the point of CORS entirely.

---

### 2026-08-06 — Customer account routes use a hydration-aware client guard while auth tokens remain in localStorage

Sprint 5's auth store persists the access token, rotating refresh token, and session user through Zustand's `persist` middleware. Those values are available only after browser hydration; the Next.js server cannot authenticate an account request because this sprint deliberately does not migrate the established token contract to cookies. **Decision**: the `(account)` route-group layout waits for Zustand persistence to finish hydrating, then redirects a missing session to the locale-aware `/login` route. It renders no account data while hydration/auth is unresolved. This is a client-navigation guard only; every account API endpoint remains independently protected by `JwtAuthGuard`, so direct requests cannot bypass authorization. Cookie-based server sessions would be a separate auth-architecture migration and are explicitly outside Sprint 5.

---

### 2026-08-06 — Bottom tab bar sits at `z-sticky-header` (40), not `z-drawer` (60), and reuses existing suppression logic for its spacer

`SPRINTS.md` Sprint 4.7's own draft suggested `z-drawer` for the new fixed bottom tab bar, but `sheet.tsx`'s mobile-nav/cart/search overlays already use `z-drawer` for both their backdrop (`inset-0 bg-black/50`) and content. Putting the tab bar at the same layer would make stacking depend on DOM order rather than intent. **Decision**: the tab bar uses `z-sticky-header` (40) instead — the same layer as the header, since conceptually both are persistent app chrome, not an overlay — so every real overlay (`z-drawer` 60, `z-modal` 70, `z-toast` 80) correctly renders above it with no extra coordination code needed; a Sheet's full-viewport backdrop already visually and interactively covers the bar whenever a drawer is open, verified live rather than assumed.

Also: the bar is suppressed on `/checkout` (the step navigation and submit button already own that screen's bottom edge). The bottom padding that reserves the bar's space for page content was originally a static Tailwind class on `<body>`, which meant `/checkout` carried dead reserved whitespace for a bar that never renders there. Extracted the suppression check into `bottom-tab-bar-suppression.ts`, shared by `BottomTabBar` (hides itself) and a new `BottomTabBarSpacer` (stops reserving space) — so the two can never disagree about which routes suppress the bar, and checkout's mobile layout has no unexplained gap at the bottom.

---

### 2026-08-06 — Bottom tab bar swaps the Bag tab for Diagnosis

Operator request: replace the mobile bottom tab bar's Bag tab with a Diagnosis tab, now that Sprint 6's diagnosis flows exist. **Decision**: the bar's five slots are now Home / Shop / Diagnosis / Wishlist / Account — cart is no longer directly reachable from the bottom bar. This is a deliberate trade, not an oversight: the header's cart icon (`cart-trigger`, opens the mini-cart drawer) remains present and fully functional at every viewport, including mobile, so cart access isn't lost — it just isn't in the bottom bar's five slots anymore. Diagnosis was chosen for that slot over keeping Bag because it's the platform's primary top-of-funnel action (`CLAUDE.md`: "every diagnosis/AI-analysis touchpoint must funnel toward a cart or a booked appointment") and, unlike Bag, had no persistent one-tap mobile entry point anywhere else. The live cart-count badge that previously lived on the Bag tab was removed along with it rather than moved to another tab — no other tab is cart-related, and bolting the badge onto an unrelated icon would be confusing. `apps/web/e2e/bottom-tab-bar.spec.ts`'s cart-badge test was replaced with an equivalent diagnosis-tab navigation test.

---

### 2026-08-07 — OSM/Leaflet as the default map provider for partner locator

No Google Maps API key exists yet (see `ENVIRONMENT.md`). **Decision**: use Leaflet with OpenStreetMap tiles as the default map provider — zero API key required, fully functional out of the box. The `PartnerLocatorMap` component dynamically imports Leaflet (client-side only, no SSR) and renders tiles from `tile.openstreetmap.org`. When/if a Google Maps key is supplied, swapping the tile provider is a focused component change, not a flow rebuild. This follows the same provider-abstraction pattern already established for payments, AI analysis, and email.

---

### 2026-08-07 — Booking double-booking prevention via capacity count + unique compound index

Two-layer defense against double-booking: (1) application-layer capacity check via `Availability.capacityPerSlot` — before inserting, `countDocuments` on existing confirmed/rescheduled appointments for the same slot and compares against capacity; (2) MongoDB compound unique index on `{partnerId, specialistId, startsAt}` with `partialFilterExpression: { status: { $ne: "cancelled" } }` — catches any race condition the application layer misses (two concurrent inserts that both pass the count check). The application check gives a better UX ("this slot is no longer available" vs. a raw MongoDB duplicate-key error), while the index guarantees data integrity under concurrent load (the `SPRINTS.md` acceptance criterion).

---

### 2026-08-07 — Partner and booking routes moved from NOT_YET_BUILT to live

Sprint 7 completed the partner locator and booking wizard, so `/partners` and `/booking` were removed from the header's `NOT_YET_BUILT` prefetch-disable set and the homepage's `prefetch={false}` link — these routes now benefit from Next.js's standard `<Link>` RSC prefetching like every other live route.

---

### 2026-08-08 — B2B role gating via composable guards, not RBAC collections

Sprint 8 introduces the first role-gated portal (B2B professional). Rather than waiting for Sprint 10's full RBAC collection system (Role/Permission tables with granular keys), the guards (`RolesGuard`, `ProfessionalApprovedGuard`) read the `roles: string[]` array already embedded on the User document (inherited from Sprint 1). The `@Roles("administrator", "super_administrator")` and `@RequireProfessional()` decorators compose cleanly on top of `JwtAuthGuard`. This is a pragmatic bridge — the same guards will be upgraded to check Permission collections when Sprint 10 lands, but the decorator API stays identical so no controller code changes.

---

### 2026-08-08 — B2B pricing: variant-level defaults with PriceList override layer

Product variants carry `b2bPriceMinor` and `moq` fields (added in Sprint 4's schema). Sprint 8 adds a `PriceList` collection that can override per-variant pricing for specific professional profiles, but the initial implementation uses variant-level defaults — the PriceList schema is created and plumbed through the module graph so the override layer is ready, but no admin UI to manage price lists exists yet (deferred to Sprint 10's admin modules). The cart's `addItem` method already accepts a `priceListId` parameter and the `resolvePrice` helper is structured to check PriceList first, falling back to `variant.b2bPriceMinor`.

---

### 2026-08-08 — Professional portal uses (pro) route group with client-side role guard

The professional portal lives under `(pro)/portal/` with a layout that checks the auth store's `user.roles` array client-side. Three states: approved → renders sidebar + portal content; pending → shows "application under review" message; neither → shows "access required" with link to `/professionals`. This mirrors the `(account)` layout pattern. Server-side enforcement happens at the API level via `ProfessionalApprovedGuard` — the client-side check is UX, not security.

---

### 2026-08-22 — IOMA AI Skin Expert 2.0: Unified Consultation & Deprecation of Standalone Questionnaire

The client requirement requests transforming the AI skin analysis into an end-to-end digital beauty consultation ("IOMA AI Skin Expert") and removing the legacy 5-step standard questionnaire. **Decision**: Deprecate `/diagnosis/standard` and unify the consultation entry point at `/diagnosis`. The new flow orchestrates: (1) Camera capture with live face-guide & quality checks, (2) Real Gemini Vision AI analysis (`gemini-2.5-flash` / `gemini-3.7-flash`), (3) Adaptive multi-turn consultation tailored to visual cues, current routine, and Dubai climate exposure, (4) Synthesized `SkinProfile`, (5) Deterministic 3-tier routine building (Essential, Complete, Premium) from real MongoDB products, and (6) Post-results conversational AI beauty advisor.

---

### 2026-08-22 — Deterministic Catalogue Grounding: LLM Never Hallucinates Products or Prices

To protect brand credibility and guarantee pricing accuracy, the AI is strictly decoupled from product inventory authority. **Decision**: The backend queries MongoDB (`Product`, `ProductVariant`, `ProductRange`, `SkinConcern`, `Category`) for eligible in-stock items based on deterministic skin concern, skin type, AM/PM routine position, and compatibility rules. The recommendation engine computes exact AED prices from database variants (`b2cPriceMinor`), while the LLM generates editorial explanations ("Why this product?", "What your skin is telling us") and powers conversational Q&A without ever inventing products or prices.

---

### 2026-08-23 — Homepage Cinematic Scroll Hero: Native Motion/React Pinning & Scroll-Driven Video Scrubbing

To deliver an art-directed luxury editorial Hero (Luxury Beauty Campaign × French Maison × Scientific Skincare) without compromising performance or introducing layout thrashing, we evaluated animation technologies and video architectures:

1. **Motion Architecture**: Selected `motion/react` with sticky CSS pinning (`position: sticky`, `top: 0`, container height `200vh` desktop / `140vh` mobile). Avoided third-party smooth scrolling hijacking (Lenis/Locomotive) to keep the user in 100% natural control of scroll physics. Single-library consistency with existing codebase (`CLAUDE.md`).
2. **Scroll-Driven Video Scrubbing**: Generated an optimized 1080p campaign video (`/videos/hero-cinematic.mp4` & `.webm`) with short keyframe GOP (`-g 5`) enabling instantaneous, frame-accurate seeking. An RAF loop synchronizes `video.currentTime` with the spring-smoothed scroll progress (`smoothProgress.get() * video.duration`), making the video come alive when the user scrolls ("when scroll the video will on").
3. **Multi-Phase Storytelling**: Orchestrated 4 scrubbed phases (Phase 1: Brand Entrance, Phase 2: Scientific Precision & Sphere Diagnostic Probe, Phase 3: "SUR-MESURE. PRÉCISION. IOMA." Transformation, Phase 4: Seamless Magazine Unfolding into Section 2).
4. **Header Dynamic Coordination**: When at the top of the homepage, the header is dark translucent with a white IOMA logo and white navigation links; upon scrolling, it transitions smoothly to solid white with black logo and dark links.
5. **Accessibility & Reduced Motion**: Automatically renders a static accessible fallback when `prefers-reduced-motion: reduce` is detected.
