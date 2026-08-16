# API_SPEC.md — IOMA Paris Dubai

Base URL: `/api/v1`. Full interactive contract served at `/api/docs` (Swagger UI) generated from NestJS decorators — this file documents conventions and the endpoint map; the Swagger output is the source of truth for exact request/response shapes once each module lands.

## Conventions

- **Auth**: `Authorization: Bearer <accessToken>` for protected routes; refresh via `POST /auth/refresh` using the httpOnly refresh cookie. Public routes need no header.
- **Pagination**: `?page=1&limit=20`, response envelope `{ data: T[], meta: { page, limit, total, totalPages } }`.
- **Filtering/sorting**: `?filter[field]=value&sort=-createdAt`.
- **Errors**: `{ statusCode, message, errorCode, details? }` from the global exception filter — never a raw stack trace or Mongoose error to the client.
- **Idempotency**: mutating payment/webhook endpoints accept `Idempotency-Key` header; duplicate keys return the original result without reprocessing.
- **Localization**: `Accept-Language: en|fr|ar` selects which locale field of a translatable resource is returned as `label`/`title`/etc. in list views (detail views return the full `{en,fr,ar}` object for editing contexts like admin).
- **Versioning**: URL-prefixed (`/api/v1`); breaking changes get `/api/v2`, old version kept until the frontend fully migrates.

## Endpoint Map by Module

### Auth (`/auth`)

`POST /register` · `POST /login` · `POST /refresh` · `POST /logout` · `POST /verify-email` · `POST /forgot-password` · `POST /reset-password` · `GET /me`

### Users & Profiles (`/users`, `/customer-profiles`, `/professional-profiles`, `/addresses`)

`GET/PATCH /customer-profiles/me` · `GET/POST/PATCH/DELETE /addresses` (own only) · `GET /professional-profiles/me` · `PATCH /professional-profiles/me/team` (admin/owner)

### Professional Applications (`/professional-applications`)

`POST /` (submit) · `GET /me` · `PATCH /:id` (draft edit, own) · `POST /:id/documents` (signed upload) · Admin: `GET /` (filterable by status) · `PATCH /:id/status` (approve/reject/request-documents/suspend)

### Catalog (`/products`, `/product-ranges`, `/categories`, `/skin-concerns`, `/ingredients`, `/product-variants`)

`GET /products` (filters: range, category, concern, search `q`) · `GET /products/:slug` · Admin CRUD on all catalog resources, `POST /product-variants/:id/media`

### Inventory & Pricing (`/inventory`, `/price-lists`)

Admin: `GET/PATCH /inventory/:variantId` · `GET/POST/PATCH /price-lists`

### Cart & Wishlist (`/cart`, `/wishlist`)

`GET /cart` · `POST /cart/items` · `PATCH /cart/items/:variantId` · `DELETE /cart/items/:variantId` · `POST /cart/apply-coupon` · `GET/POST/DELETE /wishlist`

### Orders, Payments, Shipments (`/orders`, `/payments`, `/shipments`)

`POST /orders` (checkout) · `GET /orders` (own, or admin all) · `GET /orders/:id` · `POST /orders/:id/cancel` · `POST /payments/intent` · `POST /payments/webhook/:provider` (signature-verified, idempotent) · Admin: `PATCH /orders/:id/fulfillment-status`, `POST /refunds`, `PATCH /shipments/:id`

### Partners & Booking (`/partners`, `/services`, `/treatments`, `/availability`, `/appointments`)

`GET /partners` (geo/filter query) · `GET /partners/:slug` · `GET /availability/:resourceId/slots?date=` · `POST /appointments` · `PATCH /appointments/:id/reschedule` · `POST /appointments/:id/cancel` · `GET /appointments/me` · Admin: full CRUD on partners/services/treatments/availability

### B2B Ordering (`/pro/catalog`, `/pro/cart`, `/pro/orders`)

Guarded by `ProfessionalApprovedGuard`. `GET /pro/catalog` (cabin + retail, professional pricing/MOQ) · `POST /pro/cart/items` · `POST /pro/orders` · `GET /pro/orders` · `POST /pro/orders/:id/reorder`

### Training (`/trainings`, `/training-sessions`, `/training-bookings`)

`GET /trainings` · `GET /training-sessions?trainingId=` · `POST /training-bookings` (professional-gated) · `GET /training-bookings/me` · `POST /training-bookings/:id/cancel` · Admin: CRUD trainings/sessions, `GET /training-bookings` (all), attendance marking

### Protocols & Documents (`/protocols`, `/documents`)

`GET /protocols` (professional-gated) · `GET /protocols/:slug` · `GET /documents/:id/signed-url` (ownership/permission-checked) · Admin: protocol CRUD, document upload

### Diagnosis & AI (`/diagnosis`, `/ai-analysis`, `/ai-consent`)

`POST /diagnosis` (submit answers → result) · `GET /diagnosis/me` · Admin: `GET/POST/PATCH /diagnosis-recommendations` (rules engine entries) · `POST /ai-consent` · `POST /ai-analysis` (upload + enqueue) · `GET /ai-analysis/:id` (poll status) · `GET /ai-analysis/me` (history) · `DELETE /ai-analysis/:id` (purges image + record)

### Content/CMS (`/content/pages`, `/articles`, `/article-categories`, `/faq`, `/translations`, `/navigation`, `/seo`)

Public `GET` by slug/locale; Admin CRUD + `POST /content/pages/:id/publish`, revision history endpoints

### Notifications (`/notifications`)

`GET /notifications/me` · `PATCH /notifications/:id/read` · Admin: `POST /notifications/broadcast`, `GET/PATCH /email-templates`

### Contact & Newsletter (`/contact`, `/newsletter`)

`POST /contact` (rate-limited, 5/min) — stores a `ContactMessage`, no auth required · `POST /newsletter/subscribe` (rate-limited, 5/min) — upserts a `NewsletterSubscriber` by email, idempotent. Both built ahead of the full CMS/notification system specifically so the public Contact page and footer newsletter form are real, functioning endpoints rather than dead UI — see `DECISIONS.md`.

### Search (`/search`)

`GET /search?q=&types=products,articles,partners,treatments,trainings,protocols`

### Admin (`/admin/*`)

`GET /admin/kpis` · `GET/POST/PATCH /admin/users`, `/admin/roles`, `/admin/permissions`, `/admin/settings` · `GET /admin/audit-logs`

## OpenAPI & Typed Client

NestJS's `@nestjs/swagger` decorators generate `/api/docs-json`. `packages/types` consumes that JSON at build time (via `openapi-typescript` or an equivalent codegen step wired into Sprint 4+ once the first non-auth modules stabilize) to produce the frontend's typed request/response types — the frontend never imports backend Mongoose types directly, per `CLAUDE.md`.
