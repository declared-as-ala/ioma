# SECURITY.md — IOMA Paris Dubai

## Authentication & Sessions

- Passwords: Argon2id (fallback bcrypt cost ≥ 12 only if Argon2 native bindings are unavailable in the container). Never logged, never returned in any API response.
- Tokens: short-lived JWT access token (15 min) + rotating refresh token (7–30 days), refresh token stored **hashed** in Redis keyed by `userId:tokenFamily`; reuse of an already-rotated refresh token invalidates the entire token family (theft detection).
- Cookies: `httpOnly`, `secure`, `sameSite=lax` for the refresh cookie; access token kept in memory on the client, never in `localStorage`.
- Rate limiting: `@nestjs/throttler` on `/auth/*` (stricter limits on login/register/forgot-password) and on booking/checkout mutation endpoints to blunt abuse.
- Account lock: N consecutive failed logins (configurable, default 5) locks the account for a cooldown window and notifies the user by email.

## Authorization

- RBAC via `Role`/`Permission` (see `DATA_MODEL.md`). Every controller method declares required permissions via a decorator + `PermissionsGuard` — **UI hiding is never the only gate**; the same check exists server-side.
- Professional-portal and admin routes additionally check account status (`professional_approved`, not `pending`/`suspended`/`rejected`) via `ProfessionalApprovedGuard`.
- Object-level checks (a customer can only read/write their own addresses/orders/wishlist; a professional's team member can only act within their own `ProfessionalProfile`) enforced in the service layer, not just at the route level.

## Input & File Validation

- Every DTO validated with `class-validator` via a global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` — unexpected fields are rejected, not silently dropped.
- File uploads: MIME allow-list (JPEG/PNG/WebP for images, PDF for documents), max size enforced server-side (not just client-side), filename sanitized, content-sniffed (not trusted from the `Content-Type` header alone). A malware-scan hook point (`documents.service.ts`) is left in place, no-op by default, ready to wire to ClamAV or a cloud scanning API before go-live.

## Transport & Headers

- Helmet on the API (CSP, HSTS, X-Content-Type-Options, X-Frame-Options `DENY`, Referrer-Policy `strict-origin-when-cross-origin`).
- CORS restricted to the known web app origin(s) per environment — never `*` in production.
- CSRF: same-site cookies + custom header check (`X-Requested-With`) on state-changing requests from the web app; API-to-API/webhook calls authenticate via signature, not cookies.

## Storage

- MinIO: `ioma-private` bucket (professional documents, diagnosis/AI images, invoices) never publicly readable; access exclusively via short-lived signed URLs issued after an authorization check in the API. `ioma-public` bucket (product/CMS imagery) is the only public-read bucket.
- Backups documented in `DEPLOYMENT.md`; backup archives themselves are treated as sensitive data (encrypted at rest, access-restricted).

## Payments

- No card data ever touches our servers — payment provider adapters use hosted fields/redirect/tokenization; we store only `providerReference`/status, never PAN/CVV.
- Webhooks verified by signature per provider; every webhook processed idempotently via `Payment.idempotencyKey` — replays are safe no-ops.

## AI & Diagnosis Data

- `AIAnalysis` requires a linked `AIConsent` record before any image is accepted — enforced server-side, not just gated by a UI checkbox.
- Users can delete their own analyses; deletion removes both the Mongo record's sensitive fields and the underlying MinIO object (not just a soft-delete flag left pointing at a live image).
- Configurable retention policy (`Setting` key `aiAnalysis.retentionDays`) drives a scheduled job that purges images past retention even if the user never explicitly deletes them.
- Results are never labeled as medical diagnosis; mock-provider results carry an explicit "simulated" flag surfaced in the UI, not just in an API field nobody reads.

## Logging & Monitoring

- Structured JSON logs; explicit redaction list (password fields, tokens, Authorization headers, full card/payment payloads, raw diagnosis/AI image bytes) applied before any log line is emitted.
- Sentry-compatible adapter wired but inert without `SENTRY_DSN` set (see `ENVIRONMENT.md`).
- `AuditLog` collection records admin/professional-approval/role-change/order-status-change actions with actor, before/after, and timestamp.

## Environment & Secrets

- All config loaded and validated (Zod/Joi schema) at API boot; missing required variables **fail startup**, never silently fall back to an insecure default in production (`NODE_ENV=production` tightens this further — e.g., refuses to boot with the mock payment provider active).
- `.env` files are gitignored; only `.env.example` (no real values) is committed.

## Backup Strategy (see `DEPLOYMENT.md` for commands)

Daily `mongodump` to an encrypted, access-restricted location; MinIO bucket sync/replication for object data; both retained on a rolling window (default 30 days) with a documented restore drill.

## Security Checklist (tracked to completion across sprints, not all true yet in Sprint 1)

- [ ] Argon2id password hashing live
- [ ] Rotating refresh tokens + reuse detection live
- [ ] RBAC guards on every protected route
- [ ] Rate limiting on auth + checkout + booking routes
- [ ] Helmet + CORS allow-list configured per environment
- [ ] File upload MIME/size validation + malware-scan hook point
- [ ] Signed URLs only for private bucket access
- [ ] Payment webhook signature verification + idempotency
- [ ] AI consent gate enforced server-side
- [ ] AI image delete/retention job implemented
- [ ] Log redaction verified (no secrets/PII in log output)
- [ ] Backup + restore drill documented and tested
