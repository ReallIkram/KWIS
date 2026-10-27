# Deployment and launch

## Architecture and present state

Use the designated `ReallIkram/KWIS` repository. The corresponding GitHub Pages base is `/KWIS/`, with an eventual public URL of `https://reallikram.github.io/KWIS/`. This is a target, not a claim that a live site has been deployed. If you intentionally rename the repository, the workflow derives its base from the repository name; also adjust sitemap and backend static mount settings.

GitHub Pages hosts only browser files. Express must run on a Node host; data belongs in MongoDB Atlas and media in Cloudinary. A running local database is not an Atlas deployment. No paid resources are created automatically.

## Publish the public site now — no credentials required

Settings → Pages → Source should be GitHub Actions (as shown in your screenshot). Push to main or run the Pages workflow. It builds and tests the frontend and deploys without needing any repository API variable. No backend account or email credentials are required to display the initial public website.

Without `VITE_API_BASE_URL`, the production frontend reads `initial-content.json`, generated from the explicitly authored initial public seed content. It contains no users, passwords, submissions or environment values. Team/portfolio/testimonial records remain empty until genuine content is provided. Contact, newsletter, application, and admin operations are explicitly unavailable; this mode never simulates saving data.

To switch to the live CMS later, deploy the backend using the optional steps below, set `VITE_API_BASE_URL` and optionally `VITE_ADMIN_URL`, then rerun Pages. Once connected, content is read from the real API and publishes without frontend rebuilds. Changing the backend's secrets does not require rebuilding the frontend.

## 1. MongoDB Atlas — when enabling the CMS

Create an Atlas project/cluster and a least-privilege database user restricted to the application database. Configure access for your Node host's actual outbound addresses/private network. Keep TLS verification enabled; avoid unrestricted inbound access. Put the Atlas connection string in the Node host's **server-only** `MONGODB_URI`. Percent-encode special characters in database passwords. Provision backup and retention settings suitable for real inquiries and resumes.

Use a separate disposable database/user for integration tests. `TEST_MONGODB_URI` overrides the test binary and creates/drops a uniquely named database.

## 2. Cloudinary

Create an account and configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` on the backend. These are raw server-side signing values, not browser variables or proxy placeholders. Permit image/video uploads and authenticated raw PDF delivery on your Cloudinary account. No unsigned public upload preset is required.

Test an image, MP4/WebM clip, SVG, and private PDF with your account. Confirm resume URLs are inaccessible without a signed download and signed links expire. Cloud media delivery and account policy behavior cannot be verified without real credentials. Configure quotas and retention before accepting real uploads.

## 3. Node hosting (Render blueprint included)

Create a Render web service from this repository, or apply `render.yaml`. Configure:

- Node 24, root directory repository root.
- Build: `npm ci && npm run build`.
- Start: `npm run start -w server`.
- Health: `/api/v1/health`.
- `NODE_ENV=production`, hosting-assigned `PORT`.
- `MONGODB_URI`: Atlas URI.
- `JWT_SECRET`: unique random 48+ byte value; never reuse the local key.
- `FRONTEND_ORIGIN`: comma-separated exact origins, e.g. `https://reallikram.github.io,https://YOUR-BACKEND-HOST`. No paths, wildcards, or trailing slash.
- `SERVE_CLIENT=true`, `VITE_SITE_BASE_PATH=/KWIS/`.
- `VITE_API_BASE_URL=https://YOUR-BACKEND-HOST/api/v1` (public).
- `VITE_ADMIN_URL=https://YOUR-BACKEND-HOST/KWIS/#/admin/login` (public).
- `PUBLIC_SITE_URL=https://reallikram.github.io/KWIS/`.
- `ADMIN_SITE_URL=https://YOUR-BACKEND-HOST/KWIS`.
- Cloudinary values above.
- Optional SMTP configuration below.
- `TRUST_PROXY_HOPS`: only the exact proxy-hop count confirmed by the host. Never set Express trust proxy to unrestricted `true`.

After the service is reachable, seed and create its first administrator through its secure server shell (`npm run seed`, `npm run admin:create`). Supply `ADMIN_PASSWORD` securely to that process, not in a committed file. Seed does not create a password or overwrite content. Do not leave shell history containing secrets.

### Cookie topology

The backend can serve `client/dist` at `/KWIS/`. Use its `#/admin/login` page for administration. Its API and admin UI share an origin, allowing secure HttpOnly cookies with `COOKIE_SAME_SITE=lax`. Public content and forms on GitHub Pages use the explicitly allowed CORS origin. GitHub Pages does not need an admin cookie for those operations.

If you instead run the admin directly on GitHub Pages against a separate-site API, set `COOKIE_SAME_SITE=none` and use HTTPS. Modern browser third-party-cookie blocking can still prevent login; this topology requires real browser testing and is not the recommended default. Never solve it by storing access tokens in localStorage or disabling browser protections.

## 4. Email — optional, configure later

You can leave all SMTP fields blank when publishing the public site. They are needed only when you enable outgoing inquiry notifications or password-reset emails.

| Variable        | Meaning                                       | Typical example                                     |
| --------------- | --------------------------------------------- | --------------------------------------------------- |
| `SMTP_HOST`     | Email provider's outgoing mail server         | Gmail: `smtp.gmail.com`                             |
| `SMTP_PORT`     | Connection port specified by the provider     | `587` (STARTTLS), or `465` (implicit TLS)           |
| `SMTP_USER`     | Provider's SMTP username                      | Often your email address                            |
| `SMTP_PASSWORD` | Provider's SMTP credential                    | App password or service credential; never commit it |
| `MAIL_FROM`     | Authorized sender address shown to recipients | Your verified company email                         |
| `MAIL_TO`       | Where inquiry notifications should arrive     | Your company's inbox                                |

Use your actual provider's documented settings. Gmail normally requires an app password and account configuration; your ordinary account password is not a safe generic SMTP setting. These examples do not assume you use Gmail. Backend hosting environment variables or an ignored backend `.env` are appropriate; GitHub Pages cannot execute Express or read a server `.env` at runtime.

Configure `SMTP_HOST`, `SMTP_PORT`, optional `SMTP_USER`/`SMTP_PASSWORD`, authorized `MAIL_FROM`, and notification recipient `MAIL_TO`. Port 465 enables implicit TLS; port 587 uses normal STARTTLS negotiation. Confirm your provider's TLS and sender requirements. Notifications use plain text and do not render user-provided HTML.

Test inquiry notification and forgot/reset password with a real mailbox. Forgot password intentionally returns a generic response when the account is missing or email delivery is unconfigured. Missing SMTP does not discard contact submissions.

## 5. GitHub Pages

After the backend is live and independently verified:

```sh
gh variable set VITE_API_BASE_URL --repo ReallIkram/KWIS --body 'https://YOUR-BACKEND-HOST/api/v1'
gh variable set VITE_ADMIN_URL --repo ReallIkram/KWIS --body 'https://YOUR-BACKEND-HOST/KWIS/#/admin/login'
gh workflow run pages.yml --repo ReallIkram/KWIS
```

Replace `YOUR-BACKEND-HOST` with the actual deployed host. These variables are public URLs, never secrets. Configure repository Settings → Pages → GitHub Actions. The Pages workflow runs on pushes to main or manual dispatch. An absent API URL selects the standalone public version; a supplied URL selects the connected CMS version.

When connected to an API, the frontend fetches published content at runtime with no-store and 15-second refetch. Content publishing does not trigger another Actions build. Code changes and changes to build-time API/base/admin URLs do require a build.

## 6. Verify before announcing launch

- Actual production health returns 200 and Atlas is connected.
- Homepage and every public route work under `/KWIS/`, including a direct refresh.
- Same-origin backend admin can sign in, refresh the page, sign out, and reset a password.
- Editor cannot manage users; unauthenticated requests cannot retrieve submissions/resumes.
- Upload real image, SVG, hero video, and PDF; verify delivery and privacy/expiration.
- Add and publish a temporary team member; confirm it appears on the GitHub Pages site without rebuilding. Edit a draft and confirm the old public version remains until republished; then delete the test record.
- Publish a new hero heading, footer link, theme color and office location; verify on the public frontend.
- Submit an inquiry and application; verify database records, admin statuses, CSV, and real email delivery.
- Review mobile layout, keyboard controls, legal copy, retention policy and Cloudinary quotas.
- Measure performance on the actual deployed host. No unmeasured Lighthouse score should be reported.

## SEO tradeoff

Hash routes make GitHub Pages refreshes reliable but are unsuitable for strong per-page SEO. The SPA updates metadata after JavaScript runs; many social crawlers will see only the root HTML. The baseline sitemap therefore lists the root, not invented crawlable hash URLs. CMS noindex and metadata fields work in the client. The live `/api/v1/public/sitemap.xml` inventory honors publication state and exclusion flags; its hash-route entries still have limited crawler support. For search-critical launch, migrate public rendering to an SSR/prerender-capable host and define a content-aware revalidation strategy. GitHub Pages does not support SSR.

## Cloud task environment versus production

Publishing the Codex environment snapshots local tools, source and development data for future tasks. It does **not** publish the website, provision Atlas/Render/Cloudinary, or preserve running processes. Restart the local database and API/frontend in each task using the saved start instructions. Use the current isolated checkout; do not create a worktree unless explicitly requested.
