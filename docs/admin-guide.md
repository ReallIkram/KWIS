# KWIS owner’s guide

## Standalone public hosting

The website can be published before connecting its backend. In that mode, public pages use initial content and online forms/admin are explicitly unavailable. Configure the backend and its URL later to enable the CMS; no account or secret is required just to view the public website.

## Sign in and access

Create your first administrator using the README command. There is no default password. Sign in at `#/admin/login`. On production, use the backend-hosted admin URL described in the deployment guide; this avoids third-party-cookie restrictions. Editors can manage content, uploads, applications and inquiries. Administrators additionally manage users and review the full activity log.

The Overview displays real database totals, recent editorial activity, and shortcuts. No visitor or conversion numbers are invented. Profile lets you change your name and password. Changing a password invalidates existing sessions. Forgot password sends a 30-minute link when SMTP is configured.

## The publishing rule

1. Open a collection from the sidebar.
2. Add an item or select an existing title.
3. Fill the labeled fields. The slug must be unique within that collection, lowercase, and use hyphens.
4. **Save draft** to retain work privately.
5. Use **Preview saved drafts** for a homepage preview, including draft navigation, footer and branding. Unsaved edits do not appear in preview.
6. **Publish** saves the current form and exposes its snapshot to the public API.

A published item can have newer private edits. Unpublish hides its snapshot without deleting the draft. Delete removes both and asks for confirmation. Duplicate makes a private copy with a new slug. Public pages refetch within 15 seconds and on focus; reloading also retrieves current published content.

## Team members

Open Team members → Add team member. Enter the person’s real name, job title, department, biography, experience, skills, photo, and social URLs. Use comma-separated skills. Save the draft, then publish. Confirm it appears on the Team page and its individual profile. Edit, unpublish, delete, or reorder using the same controls.

## Homepage and pages

Homepage builder manages sections for every page. Filter/search by title; the `Page slug` field determines where a section appears (`home`, `about`, etc.). Choose one safe section component and fill the fields it uses. Enable or disable sections, change background/layout, add images, galleries, FAQ items, cards, or buttons. The Hero section renders the slides managed in Hero slides.

Drag rows or use the up/down arrows. **Reordering saves drafts. Republish the moved entries** to publish their new order. Display order is numeric and sorting is ascending. Use unique values for predictable ordering. There is no freeform JavaScript or raw HTML execution.

Pages manages titles, introductions, body text, images and metadata. New single-segment page slugs become accessible automatically when published. Navigation links are added separately. The minimum standard pages are already seeded. Terms and privacy are draft examples requiring review before launch.

## Hero and media

Upload media in Media library first. Configure Cloudinary on the backend before uploading. Use Choose from media library in any editor or paste a known HTTPS asset URL. Hero slides support desktop/mobile images, video/poster, mute, loop, autoplay, overlay opacity, headings, exact-match highlighted words, two buttons, alignment, compact/large height, visibility and order. Reduced-motion users see an image/poster alternative. Browser autoplay may require muted video.

Files are stored in Cloudinary. Select a newly uploaded file to replace an existing image or video, save, then publish. Rename a media record or add alternative text in the library. Copy URL copies its address. Deleting a referenced media URL is refused. Content-specific image alt text should be set in the corresponding content editor. Sanitized SVG allows basic self-contained vector shapes only; scripts, external images, embedded HTML and remote paint references are excluded.

## Services, portfolio, technologies and testimonials

Collections share save, duplicate, publish, search, delete and ordering controls. Services have features, benefits, icon, category, related project slugs and technologies. Projects support rich case-study sections, galleries, video and external links. Team, portfolio, blog and job records receive public detail routes.

Use genuine testimonials with permission, and verified statistics. The initial database has none. Example service and technology records are explicitly marked as examples. Confirm or replace them before removing that label.

## Blog

Use the rich text toolbar for headings, emphasis, lists, links, quotes and code blocks. Add an author, category, tags and images. Save draft to continue later; publish when ready. Listing pages provide search, category filters and pagination. Publishing is manual; scheduling is not implemented. Both the API and the browser sanitize rich HTML.

## Careers and applications

Create a job with location, arrangement, type, deadline, requirements and responsibilities. Publish it to enable applications. Closing a job or passing its deadline disables submission server-side as well as in the UI. Applicants must attach a PDF resume (5 MB maximum). Cloudinary credentials are required for the form to complete; it never pretends a missing upload succeeded.

Applications lists stored candidates, notes and statuses. Open a submission to see details and download a resume using a short-lived authenticated URL. Resumes are excluded from the public media library. Deleting an application also removes its associated private resume from cloud storage. Configure retention and deletion policies before accepting real applicants. Automated malware scanning is not included; treat all uploaded documents as untrusted.

## Contact inbox and newsletter

Inquiries are stored even if notification email cannot be delivered. Search by name or email, filter statuses, add private notes, mark read/replied/qualified/archived, and delete. Export CSV downloads all entries in that inbox; formula-like cells are escaped. Export is an authenticated API operation. Newsletter subscribers can be viewed, exported, and removed; marketing campaign sending and automatic unsubscribe mail are not included.

## Navigation, footer, theme and location

Navigation: edit labels, destinations, enabled state and dropdown links. Footer: manage its CTA, copy, columns and nested links. Website settings: name, full name, tagline, logo/favicon, contact details, hours, copyright and social links. Edit the existing `global` entry for singleton settings instead of adding competing global records.

Theme: colors, supported font presets, radius and dark/light mode. Choose accessible colors and verify the public preview; arbitrary CSS and font execution are not supported. Office locations: city/province/country, full address, coordinates, map link/embed, contact details and office hours. The default uses city-level Abbottabad only. The public map derives a location query from the saved fields, or uses validated coordinates/admin-provided Google embed URL. Multiple office records are supported.

SEO: page slug matches its target record slug. Metadata fields include title, description, canonical, social image and noindex. GitHub Pages hash routing limits deep-page indexing; the live API sitemap honors exclusion flags, while the static frontend sitemap remains a root baseline. See README for that limitation.

## Before launch

Replace sample capabilities, complete verified company contact details, review legal text, configure cloud storage/email/Atlas, create your production administrator, verify cookie behavior on the actual host, test public inquiries and private resumes, and review a mobile viewport. Never enter passwords, API secrets or database credentials into public content fields.

### Public text labels

Website settings → Public website labels controls decorative copy and common interface wording. Each item has a stable key and display text. Existing seed records contain all defaults; in an older database, add the desired key to override its default. Publish the settings record after editing. An empty text value intentionally hides that label. Supported keys are listed in [default-copy.ts](../server/src/default-copy.ts), grouped under `hero.*`, `footer.*`, `about.*`, `contact.*`, `empty.*`, `blog.related`, `project.related` and `application.*`. Contact budget choices are a separate editable list. Technical validation and API error strings remain application messages.
