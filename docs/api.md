# API reference

Base: `/api/v1`. JSON request bodies unless stated. Responses use `{data: ...}` or `{error: "..."}`. List endpoints may add `total`. Errors: 400 validation, 401 session required, 403 access/origin denied, 404 missing, 409 duplicate/in-use asset, 429 rate limit, 503 dependency unavailable. Health uses `{status: "ok"}` and 200, or 503 when disconnected.

## Public

| Method | Path                   | Body / response                                                                                                    |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| GET    | `/health`              | Database health                                                                                                    |
| GET    | `/public/content`      | Published content only, ordered by published order; `Cache-Control: no-store`                                      |
| POST   | `/public/contact`      | `name,email,message`; optional `phone,company,service,budget,website` (honeypot must be empty)                     |
| POST   | `/public/newsletter`   | `email`, empty optional `website`                                                                                  |
| POST   | `/public/applications` | Multipart: `name,email,message,job` (job slug), PDF `resume`; optional phone/portfolio/linkedin and empty honeypot |

Public forms are limited to 10 requests/hour/IP. The broader API is limited to 300 requests/minute/IP. Tune limits and trusted proxy configuration for the production host.

## Sessions

| Method | Path            | Body                                                             |
| ------ | --------------- | ---------------------------------------------------------------- |
| POST   | `/auth/login`   | `email,password`                                                 |
| POST   | `/auth/refresh` | Rotates HttpOnly refresh cookie, one-time previous refresh token |
| POST   | `/auth/logout`  | Revokes refresh and clears both cookies                          |
| GET    | `/auth/me`      | Current account                                                  |
| POST   | `/auth/forgot`  | `email`; always generic response                                 |
| POST   | `/auth/reset`   | `token,password`                                                 |

Access JWT: 30 minutes, signed with server-only key, issuer/audience checked. Refresh: opaque random token, SHA-256 hash stored server-side, expires after 7 days. Account active state and session version are checked on protected requests. Passwords use bcrypt cost 12 with 12-character minimum and 72-byte UTF-8 limit. Authentication/reset endpoints are rate limited. State-changing browser requests must use an allowed Origin. Use `credentials: include`; the frontend handles one refresh retry.

## Editorial collections

Kinds: `settings,navigation,footer,pages,sections,hero,services,projects,team,technologies,testimonials,blog,careers,industries,process,statistics,faq,seo,theme,locations`.

| Method | Path                                 | Operation                                                  |
| ------ | ------------------------------------ | ---------------------------------------------------------- |
| GET    | `/admin/content/:kind`               | Draft records, `page=1&limit=30&search=...`, max limit 100 |
| POST   | `/admin/content/:kind`               | Create private draft                                       |
| PUT    | `/admin/content/:kind/:id`           | Replace draft fields, preserve published snapshot          |
| POST   | `/admin/content/:kind/:id/publish`   | Snapshot current draft                                     |
| POST   | `/admin/content/:kind/:id/unpublish` | Remove public snapshot                                     |
| POST   | `/admin/content/:kind/:id/duplicate` | Copy as draft under a generated slug                       |
| DELETE | `/admin/content/:kind/:id`           | Delete both versions                                       |

Create/update body: `{title,slug,order,data}`. Slug is lowercase alphanumeric words separated by single hyphens. `data` contains collection-specific editorial fields; [client field registry](../client/src/admin/fields.ts) documents the exact keys. The server rejects unsafe URL schemes, wrong list/boolean types and out-of-range ratings, coordinates and overlay values. Rich HTML and object keys are sanitized. Uploaded private/internal model fields cannot be set through this API.

## Workspace

| Method    | Path                  | Operation                                                          |
| --------- | --------------------- | ------------------------------------------------------------------ |
| GET       | `/admin/dashboard`    | Actual counts and recent activity                                  |
| GET/PATCH | `/admin/profile`      | Current profile; PATCH `name`, optional `password,currentPassword` |
| GET/POST  | `/admin/users`        | Admin-only accounts; POST `name,email,password,role`               |
| PATCH     | `/admin/users/:id`    | Admin-only `name,role,active`; invalidates sessions                |
| DELETE    | `/admin/users/:id`    | Admin-only delete and revoke; cannot delete yourself               |
| GET       | `/admin/activity`     | Admin-only latest 100 activity records                             |
| GET       | `/admin/inbox/:kind`  | `messages,applications,subscribers`; page/limit/search/status      |
| PATCH     | `/admin/inbox/:id`    | `status,notes`                                                     |
| DELETE    | `/admin/inbox/:id`    | Delete record; application resume also removed                     |
| GET       | `/admin/export/:kind` | Authenticated CSV for inbox kind                                   |

Editors can manage editorial content and submissions. Only administrators can manage accounts or access full logs. Self-demotion, self-disable and self-delete are rejected.

## Media

| Method | Path                | Operation                                           |
| ------ | ------------------- | --------------------------------------------------- |
| GET    | `/admin/media`      | Public media metadata only; page/limit/search       |
| POST   | `/admin/media`      | Multipart `file`; up to 50 MB; verified type        |
| PATCH  | `/admin/media/:id`  | `name,alt`                                          |
| DELETE | `/admin/media/:id`  | Delete unused public asset; rejects referenced URLs |
| GET    | `/admin/resume/:id` | Protected signed download URL, 60-second expiration |

Cloudinary must be configured; no filesystem fallback. Resume references are media IDs available only on private submissions. API does not expose raw credentials or password/reset-token hashes.
