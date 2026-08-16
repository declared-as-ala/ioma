# ARCHITECTURE.md — IOMA Paris Dubai

## Style: Modular Monolith

One deployable API (NestJS), one deployable web app (Next.js), clearly bounded internal modules. No microservices — see `DECISIONS.md` for rationale. Modules are internally cohesive and could be extracted later if a specific one (e.g., AI analysis processing) needs independent scaling, but nothing is built with cross-network calls between "services" today.

## Monorepo Layout

```
ioma/
├── apps/
│   ├── web/                     Next.js 15 App Router, TS, Tailwind
│   │   └── app/[locale]/
│   │       ├── (public)/        homepage, maison, technology, journal, treatments, contact, faq, legal
│   │       ├── (shop)/          catalogue, product, cart, checkout
│   │       ├── (account)/       customer dashboard (auth-gated)
│   │       ├── (pro)/           B2B portal (professional-approved-gated)
│   │       └── admin/           admin dashboard (RBAC-gated)
│   └── api/                     NestJS
│       └── src/
│           ├── modules/         one folder per bounded domain (see below)
│           ├── common/          guards, interceptors, filters, decorators
│           └── config/          env schema + validated config service
├── packages/
│   ├── ui/                      restyled shadcn primitives + IOMA composite components
│   ├── types/                   shared API/domain types
│   ├── validation/               Zod schemas (shared client validation + mirrored DTO rules)
│   ├── config/                  shared constants (locales, currencies, emirates list...)
│   ├── eslint-config/
│   └── tsconfig/
├── infrastructure/
│   ├── docker/                  Dockerfiles, docker-compose.yml (dev), compose.prod.yml
│   ├── nginx/                   reverse proxy config
│   └── scripts/                 seed, migrate, backup, minio bucket init
├── docs/                        long-form supplementary docs, ADR archive
└── IOMA_CHARTE_GRAPHIQUE_2026_FR.pdf   design source of truth — do not delete
```

## Backend Module Map (`apps/api/src/modules/`)

`auth`, `users`, `customer-profiles`, `professional-profiles`, `professional-applications`, `addresses`, `catalog` (products/variants/ranges/categories/concerns/ingredients), `inventory`, `pricing` (B2C + B2B price lists), `cart`, `wishlist`, `orders`, `payments` (provider-abstracted), `shipments`, `promotions`, `partners`, `services-treatments`, `availability`, `appointments`, `trainings`, `training-bookings`, `protocols`, `documents` (MinIO-backed), `diagnosis` (standard + rules engine), `ai-analysis` (provider-abstracted, queue-backed), `content` (CMS: pages/journal/faq/navigation/footer/seo/translations), `notifications` (in-app + email, queue-backed), `search`, `admin` (cross-cutting RBAC/audit/settings), `rbac` (roles/permissions).

Each module: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `schemas/` (Mongoose), `*.spec.ts`. Controllers depend only on services; services never import another module's schema directly — cross-module reads go through the other module's exported service.

## Frontend Data Flow

Server Components fetch via a typed API client (thin wrapper generated/hand-synced from the OpenAPI spec) for initial render (SEO-relevant public/catalogue/content pages). Client Components use TanStack Query for anything requiring mutation, optimistic UI, or client-side refetching (cart, wishlist, booking wizard, admin tables). Zustand holds only ephemeral client UI state (drawer open state, wizard step, locally-selected-but-unsaved filters) — it never duplicates server state.

## Cross-Cutting Concerns

- **Auth**: JWT access token (short-lived) + rotating refresh token (Redis-backed, hashed at rest), httpOnly secure cookies for the web app. Guards: `JwtAuthGuard` (authenticated), `RolesGuard`/`PermissionsGuard` (RBAC per `DATA_MODEL.md` Role/Permission), `ProfessionalApprovedGuard` (B2B-portal-specific gate).
- **Validation**: `class-validator` DTOs on every controller method via a global `ValidationPipe`; matching Zod schemas in `packages/validation` drive React Hook Form on the client, so client and server reject the same inputs.
- **Errors**: a single global exception filter normalizes every error to `{ statusCode, message, errorCode, details? }`; the frontend never parses ad hoc error shapes.
- **Background jobs**: BullMQ queues on Redis for email sending, image processing (AI analysis pipeline, product image variants), and notification fan-out. Each queue has a dedicated processor in its owning module.
- **File storage**: MinIO with two buckets minimum — `ioma-public` (product/CMS imagery, served via CDN-friendly public read) and `ioma-private` (professional documents, diagnosis/AI images, invoices) accessed exclusively via short-lived signed URLs issued by the API.
- **Search**: `search` module exposes one interface; default implementation queries MongoDB text indexes across products/articles/partners/treatments/trainings; a Meilisearch implementation of the same interface can be swapped in via config without touching callers.
- **i18n**: next-intl on the frontend; content/CMS/email-template translations stored per-locale in Mongo (`Translation`/CMS documents carry `{ en, fr, ar }` fields or a normalized translation-key table for high-volume strings); validation/error messages localized via the same key system.

## Provider Abstractions (built now, real adapters plugged in later)

| Interface              | Mock/default (v1)                                                                                     | Real adapter (pluggable)                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `PaymentProvider`      | In-memory mock: always-succeed/always-fail/random test cards                                          | Stripe / Checkout.com / PayTabs / Network International |
| `AiAnalysisProvider`   | Deterministic mock producing plausible indicator scores from an image hash, clearly labeled simulated | Real vision-AI vendor (TBD)                             |
| `MapProvider`          | OSM tiles via Leaflet, no API key required                                                            | Google Maps / Mapbox (key-gated)                        |
| `EmailProvider`        | Nodemailer to a local dev SMTP catcher (e.g., MailHog) in dev; console-log fallback                   | Real transactional provider (SES/Sendgrid/Postmark)     |
| `SmsProvider` (future) | No-op logger                                                                                          | Twilio/WhatsApp Business API                            |
| `SearchProvider`       | MongoDB text search                                                                                   | Meilisearch                                             |

## Infrastructure Topology (production)

```
Internet → Nginx/Caddy (TLS) → { web:3000, api:4000 }
                                     api → mongo:27017 (internal only)
                                     api → redis:6379  (internal only)
                                     api → minio:9000  (internal only, signed URLs only expose objects)
```

Mongo, Redis, and MinIO are never bound to a public port in production compose — only the reverse proxy is internet-facing. Full detail: `DEPLOYMENT.md`.

## Observability

Structured JSON logging (Pino or Nest's built-in logger configured for JSON) with OpenTelemetry-compatible trace/span fields left in place for future collector wiring; Sentry-compatible error adapter (`@sentry/node` / `@sentry/nextjs`) wired but no-ops without a `SENTRY_DSN`. No sensitive data (passwords, tokens, full card numbers, raw diagnosis images) ever enters logs.
