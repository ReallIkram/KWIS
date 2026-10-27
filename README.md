# KWIS — Knowlege Web Innovative Solutions

A React/TypeScript website and a MongoDB-backed editorial workspace for KWIS, Abbottabad, Khyber Pakhtunkhwa, Pakistan. Public content is read from the API at runtime. Saving drafts does not change published content; publishing updates the website without a frontend deployment.

**Current status:** implemented and validated locally with a real disk-backed MongoDB, Express API, and Chromium. Production database, Cloudinary, SMTP, and backend hosting must be configured by the owner. No live production deployment or cloud upload is claimed. See [delivery checklist](docs/status.md), [admin guide](docs/admin-guide.md), [API reference](docs/api.md), and [deployment guide](docs/deployment.md).

## Stack and structure

- `client/`: React 19, Vite, TypeScript, Tailwind 4, React Router, Motion, TanStack Query, React Hook Form, Zod, Lucide, TipTap, DOMPurify.
- `server/`: Express 5, TypeScript, Mongoose, bcrypt, short-lived JWT access cookies and rotated refresh sessions, Cloudinary, Nodemailer, Helmet, CORS, rate limits, Zod, server-side HTML and SVG sanitization.
- `tests/`: Playwright presentation tests and actual API/database browser flows.
- `server/src/*.test.ts`: security, validation, and MongoDB integration suites.
- `.github/workflows/`: CI and API-gated GitHub Pages deployment.
- `render.yaml`: backend deployment blueprint. It does not provision services until the owner applies it.

## Quick start

Use Node 24 (`.nvmrc`) and npm. Node >=22.12 is supported; the checked-in lockfile is authoritative.

```sh
npm ci
npm run db:prepare
```

Copy `server/.env.example` to `server/.env` without overwriting existing configuration. Generate a unique development `JWT_SECRET` with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` and paste it into the ignored `.env`. Never commit or share it. The onboarding instance already has a generated local development key.

Start the local database in one terminal:

```sh
npm run db:dev
```

The convenience database uses an official MongoDB 7.0.14 binary with the downloader's verification enabled and a persistent data directory at `.local/data`. It listens only on `127.0.0.1`, without authentication. It is for local development only. Downloading the binary requires `fastdl.mongodb.org`. To use an existing MongoDB instead, set `MONGODB_URI` and omit this process.

In another terminal:

```sh
npm run seed
npm run dev
```

The API listens on port 5000; Vite on 5173 with repository base `/KWIS/`. Open the frontend at that base path; admin routes are hash routes under `#/admin/login`. Hash routing survives direct refreshes on GitHub Pages. The seed is repeatable and preserves existing content. `npm run dev:local` starts all three processes after configuration exists.

## Create the first administrator

There is no default account or published password. From the repository root:

```sh
read -rs -p 'New admin password (12+ characters, max 72 UTF-8 bytes): ' ADMIN_PASSWORD
export ADMIN_PASSWORD
npm run admin:create
unset ADMIN_PASSWORD
```

Enter the email and display name when prompted. Keep the generated account password in your password manager. The command refuses to overwrite an existing account. Subsequent accounts are managed in the dashboard. Password reset requires working SMTP; a database-backed administrator can reset an account through a separately authorized maintenance action if email is unavailable.

## Content model

Content collections include settings, navigation, footer, pages, sections, hero, services, projects, team, technologies, testimonials, blog, careers, industries, process, statistics, FAQ, SEO, theme, and locations. Every record has a stable slug, editable order, draft data, and a separate published snapshot. Timestamps, published date, and editor identity are stored. Unique `(kind, slug)` indexes prevent URL collisions.

Users, hashed refresh sessions, media records, private submissions, and activity logs live in separate collections. Public endpoints expose only published content. The safe section registry supports hero, text, image/text, collection grids, statistics, CTA, FAQ, gallery, video, technology logos, process, contact form, and custom cards. It never executes CMS-provided JavaScript.

Services and technology examples are visibly labeled. Team members, testimonials, portfolio projects, jobs, articles, industry claims, and company statistics are not fabricated. Replace illustrative service descriptions and draft legal policies before launching.

## Media, email, and production

Cloudinary credentials are server-only values. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` on the server. Images and video are streamed to persistent cloud storage; resume PDFs use authenticated private storage and short-lived download URLs behind administrator authorization. Uploads fail clearly when storage is unconfigured; there is no fake local upload fallback.

Image uploads support JPEG, PNG, WebP, GIF, and sanitized self-contained SVG. Video supports MP4/WebM, up to 50 MB per upload. Resumes must be PDF and at most 5 MB. The hosting provider must allow those body sizes and Cloudinary PDF delivery. Replacing an asset means uploading a new file and selecting it in the content editor; referenced media cannot be deleted.

SMTP settings are in `server/.env.example`. Inquiry notifications are optional and delivery failure never discards the stored inquiry. Password reset email needs SMTP and `ADMIN_SITE_URL`. Do not place MongoDB, Cloudinary, SMTP, or session secrets in `VITE_*` variables. The latter are public in the browser bundle.

Production architecture: GitHub Pages frontend, separately hosted Express API, MongoDB Atlas, Cloudinary. GitHub Pages cannot run Express. Prefer the backend-hosted admin UI for same-origin cookie sessions; third-party cookie restrictions can block login from a GitHub Pages origin. See [deployment](docs/deployment.md).

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run test:db
npm run build
npx playwright install chromium
npm run test:e2e -- tests/browser.spec.ts
# With local API, database, and seed running:
RUN_FULLSTACK_E2E=1 npm run test:e2e -- tests/fullstack.spec.ts
```

In this cloud instance, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium` to use installed Chromium. Database integration tests create a unique disposable database, then remove it; never point `TEST_MONGODB_URI` at an account that cannot safely create/drop an isolated test database. `MONGOMS_DOWNLOAD_DIR=/tmp/kwis-mongodb` makes the test binary cache writable here. Tests do not disable TLS, package signatures, or binary checksums. Default unit tests explicitly skip the four database integration tests; `test:db` is the separate required integration command. The two full stack browser tests are explicitly skipped unless enabled.

## SEO and limitations

Dynamic metadata, semantic markup, social tags, canonical URLs, lazy images, a baseline root sitemap, and robots.txt are present. **Hash-based client routing is a deliberate GitHub Pages compatibility choice and limits route-level indexing and link previews.** The static frontend sitemap lists the root; the live `/api/v1/public/sitemap.xml` inventory includes current published routes and honors CMS exclusions. Hash URLs have limited search-engine support. Publishing CMS text does not regenerate static social preview HTML. No server-side rendering or Lighthouse score is claimed. Use a hosting platform supporting prerendering/SSR if deep-page search discovery is a launch requirement.

Scheduled publishing, automatic image derivative selection, malware scanning, 2FA, password reset delivery receipts, visitor analytics, and a drag-to-resize freeform page canvas are not implemented. The editor uses predefined safe components. See the checklist for external verification and launch prerequisites.

## Troubleshooting

- **Database unavailable:** start `db:dev`, verify `MONGODB_URI`, or check Atlas IP access, DNS and egress. Do not disable TLS.
- **API unavailable:** check the API health endpoint, backend logs, Vite proxy in development, and `VITE_API_BASE_URL` in production.
- **Cannot sign in:** create the first admin; confirm exact CORS origin, HTTPS cookie settings, and browser cookie policy. Prefer backend-hosted admin.
- **Upload returns 503:** configure all three Cloudinary values on the backend. Do not enter secrets in chat or frontend settings.
- **Email not received:** verify SMTP settings, sender authorization and recipient, and check provider delivery logs. Inquiries remain in the inbox.
- **Edit not public:** save and publish the item. Reorder saves drafts; republish moved records. Public content refetches every 15 seconds and on window focus.
- **Linux binary cache permissions:** set `MONGOMS_DOWNLOAD_DIR` to a writable directory, or use `TEST_MONGODB_URI` for integration tests.

For future tasks, use the existing checkout in the isolated environment; a Git worktree is unnecessary unless explicitly requested.
