# Delivery and verification checklist

This is a working local implementation, not a claim that every production acceptance criterion has been completed.

## Implemented

- Public home, about, service listing/detail, portfolio listing/detail, team listing/profile, technologies, industries, blog listing/detail, careers listing/detail, contact, privacy, terms, and custom single-slug pages.
- Responsive navy/mint design, original CSS illustration, mobile navigation and dropdowns, reduced motion, safe rich content, search/category filters/pagination and empty states.
- Real Express/Mongoose API, collection indexes, private submissions, server-side validation, cookies, JWT access/session rotation, password hashing, roles, password reset integration, request limits, CORS/Origin checks, sanitization and activity logging.
- Database-driven editorial modules for all core content types; draft snapshots, explicit publication, unpublish, duplicate, deletion, order fields, drag/keyboard reordering, homepage saved-draft preview.
- Services/projects/team/blog/jobs, hero video/images and posters, settings, navigation/footer links, location maps, dark/light brand options and safe component sections.
- Cloudinary image/video/SVG library integration, file-signature validation, private PDF storage and protected expiring download integration.
- Contact inbox, application workflow, newsletter list, status/notes, authenticated CSV, media metadata, profile and administrator account management.
- Disk-backed local MongoDB startup/prepare scripts, idempotent seed and first-admin CLI without default credentials.
- CI, GitHub Pages workflow supporting standalone public content without an API and connected CMS mode when configured, Render blueprint, configuration examples and operating documentation.

## Local checks

Final command results are reported in the handover. The automated suites cover frontend safe rendering, backend boundary security and media validation, actual MongoDB draft/publication/team CRUD and role checks, seed repeatability, real contact persistence, desktop/mobile routes, login redirect, and an owner using the dashboard to add/edit/publish/delete a team member. Browser fixtures are explicitly separated from the two actual API/database browser flows.

No cloud uploads, real SMTP delivery, Atlas connection, production performance scores, or deployed end-to-end behavior have been verified without those services. Passing a local build does not establish these results.

## Required prerequisites for live CMS/upload/email features (not for standalone public hosting)

- Supply a production MongoDB Atlas URI and permit the backend to reach it.
- Configure a Node hosting account/service, its public HTTPS URL, server session key, origins and proxy settings.
- Configure Cloudinary signing credentials and verify authenticated PDF/image/video delivery on the real account.
- Configure SMTP and verify notification/password-reset delivery, if those email workflows are required at launch.
- Create a production owner account securely; there is no shared/default password.
- Set repository API/admin URL variables, run Pages deployment, and verify the actual public site against the production API.
- Replace example capabilities, add verified people/work/testimonials, supply real contact details and review legal policies.

## Known scope gaps / deliberate limitations

- SEO: hash-routing metadata is client-rendered; no SSR, route prerenderer, or crawler-visible live CMS sharing previews. The live API sitemap honors exclusions, but hash route indexing is limited.
- No scheduled publishing, visitor analytics, marketing mail/campaign system, MFA, document malware scanning, or automatic image derivative selection. Manual publish, actual content/inquiry counts, and basic persistent cloud assets are implemented.
- The homepage builder uses safe predefined components, not a freeform design canvas. Reordering is saved as drafts and requires publishing the affected records. Preview currently focuses on the homepage/global shell, not individual unpublished detail pages.
- Core public decorative copy and contact labels can be overridden in Website settings → Public website labels. Technical errors, validation hints and some utility/form interface labels remain application interface strings.
- Media replacement is upload-and-reselect, not in-place file overwrite.
- UI testing covers desktop and 375px mobile flows, not every browser/device combination. Cloud storage, mail and production cookie behavior still require credentialed smoke tests.

Remaining gaps are recorded here rather than silently marked complete. Further code work can address them independently of the external service setup.

Standalone hosting: production builds without an API URL use a bundled initial-content snapshot. All persistence-dependent actions are explicitly unavailable until the real backend is enabled; no fake saving or login is provided.
