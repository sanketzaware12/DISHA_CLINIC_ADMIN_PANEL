# Modified and new files

## New
- `assets/js/site-content.js` – extracted real website content (seed)
- `assets/js/schema.js` – editable fields + website file/selector mapping
- `assets/js/cms.js` – content store (draft/published/versions), media, section editor engine, preview, page controls
- `assets/js/mods.js` – CMS modules (homepage, pages, services, blogs, media, doctors, testimonials, SEO, history, settings)
- `assets/css/cms.css` – styles for the section editor only
- `assets/site/**` – copy of the website for the site-styled preview (each page only gets one extra `<script>` for `preview-bridge.js`)
- `content/disha-content-seed.json`, `docs/*`, `README.md`

## Modified (small, targeted)
- `assets/js/app.js` – removed Products/Theme from sidebar; "Add New" menu items; search sources
- `assets/js/data.js` – `getList` reads real content for services/blogs/pages/team
- `assets/js/crud.js` – optional `store` so the table module can use the content store
- `assets/js/dashboard.js` – data from real content; Products card → Media Files; website URL check
- `pages/*.html` – script includes; in `website-settings`, `seo-management`, `version-history`, `theme-appearance` the large inline demo script was replaced by the shared modules

## Unchanged (byte-identical)
`login.html`, `index.html`, `assets/js/login.js`, `assets/js/redirect.js`, `assets/css/style.css`, `assets/css/components.css`, `assets/css/dashboard.css`, `my-profile.html`/`security.html` logic.

## Modules removed (website forms redirect to WhatsApp)
- Removed **Appointments & Enquiries**, **Version History** and **Team & Doctors** modules: menu items, pages, module code, dashboard widgets (appointment/enquiry analytics, recent activity, pending requests), header bell, global-search entries and profile notification rows.
- Website content (including the doctor profile data) and the internal change log used for publish tracking are untouched.

## Page Management redesign + header action buttons
- `assets/js/mods.js` – Page Management rebuilt: overview with page cards (status, sections, last published, Edit / Preview, search + status filter, Publish all in header) and a step-by-step page editor in the Homepage Builder style (About, Contact, Book Appointment: one step per section; Privacy, Terms: header + policy sections).
- `assets/js/cms.js` – `Page.wire` now places Preview / Save Draft / Publish in the top header of every page that uses it (Homepage Builder, Page Management editor, Service and Blog editors, Blogs page content, Website Settings). `Page.buttons()` returns an empty string, so nothing is duplicated in the page body.
- `assets/css/cms.css` – new `pm-*` rules appended at the end; no existing rule changed.


## Media Library removed
- Deleted `pages/media-library.html`, the sidebar entry and both module scripts.
- Removed every "Choose from library" button; image fields are upload-only (click or drag & drop, Replace, Remove, file-name strip).
- Dashboard "Media Files" card and chart bar replaced with Testimonials.

## Services module redesigned
- Overview: compact hero (no stats strip), search + status filter (All / Live / Hidden / Draft) and one premium directory panel: a row per service with order number, image thumbnail, name, badge, description, URL, group and section count, status + visibility switch, move up/down, Preview and Edit, plus an "Add a new service" row.
- Editor: same step-by-step wizard as Homepage Builder / Page Management (service tabs, progress rail, "Service card" step, then all 26 sections with their own icons, per-section Visible/Hidden switch, Back / Next / Save Changes / Publish page).
- Services listing page (/services/) uses the same wizard.
- Stray `pages/media-library.html` removed again.

- Services overview: removed the search bar, status filter and URL pills; the Services listing page is now a premium banner card (icon tile, section chips, status, Preview and Edit page).


## Preview fix: added / removed list items
- `assets/js/cms.js` – `Preview.build` now sends a list operation when an array grew or shrank (tick points, pills, cards, FAQs, steps, etc.).
- `assets/site/assets/js/preview-bridge.js` – new `locate` / `rep` logic finds the real list on the page, clones an existing item for each new one, removes deleted ones, and renumbers items.

## Preview fix: cards (services, blogs, reviews)
- `assets/site/assets/js/preview-bridge.js` – builds Service cards (Home + Services page), Blog cards (+ category chips and count) and Patient review slider from the CMS records, using the real site markup; hidden items are removed, new ones added, order follows the CMS.
- `assets/js/cms.js` – `Preview.build` sends these card lists; new (unsaved-to-site) services/blogs preview on a copy of an existing page; Testimonials preview opens the real home page.
- `assets/js/mods.js` – Testimonials Preview button opens the real site preview.


## Sections removed from the website -> removed from the admin panel (content version 1.0.2)
- Homepage: **Common Surgical Conditions** removed (Homepage Builder now has 14 sections).
- All 7 service pages: **Similar Conditions, Treatment Options, Healthy Habits, Preparation, Prevention, Patient Reviews** removed, and the **"Who may be a good candidate?"** box inside *Laser Option / Procedure Information* removed (each service now has 20 sections).
- `assets/js/schema.js`, `assets/js/site-content.js`, `content/disha-content-seed.json`: sections, fields and order updated.
- `assets/js/cms.js`: one-time migration 1.0.1 -> 1.0.2 strips the removed sections from the browser's saved draft + published copy (other edits are kept); preview review cards now only for Home / Testimonials.
- `assets/js/mods.js`: section icons cleaned up, Homepage count is read from the content (was hard-coded 15), Testimonials: removed the per-review "Service page" selector and the "all 7 service pages" wording (service pages have no reviews section any more).
- `assets/site/**`: preview copy synced with the current website (home, 7 service pages, `premium.css`, `service-detail.css`); `preview-bridge.js` tag kept on every page.
- Stray, unlinked `pages/media-library.html` deleted (Media Library was already removed).
- Not touched: all other modules, login, sidebar, header, component styles.

## New service / new blog now start with the full structure
- `assets/js/mods.js` – **Add service**: the new draft has all 20 service sections (same fields as the other services, content empty) and keeps the fixed labels that are identical on every service page (\"In short:\", chips, button texts, stat labels, card link text). **Add blog article**: the new draft has all article fields (incl. service-note texts and featured label) plus a starter set of 10 sections (What is it?, Common symptoms, Causes and risk factors, How it is diagnosed, Treatment options, Recovery and aftercare, Prevention, When to seek urgent help, Questions patients commonly ask, Conclusion) that can be renamed, deleted, added or reordered.

## Blog editor + preview: every part of the article is editable and previewed (this update)
- `assets/site/assets/js/preview-bridge.js` – new `postPage()`: the article preview is now rebuilt from the draft (title, category, subtitle, author, date, hero image, lead, introduction, **every section**, service note, share buttons, author box, "In this article" list, side CTA, related posts, closing CTA). New, renamed, added, deleted and re-ordered sections show immediately (new articles no longer keep the text of the old hernia page).
- `assets/js/cms.js` – `Preview.build` sends the whole article for blogs; `Content.normPost` (unique anchor ids from the heading, default share buttons, author name clean-up) runs on load / preview / save / publish; rich-text editor now has Paragraph, Sub-heading, Bold, Italic, Underline, Bullet list, Numbered list, Quote, Link, Remove link, Clear formatting, Undo, Redo; pasted text is cleaned (no stray fonts/colours); empty paragraphs are removed.
- `assets/js/schema.js` / `assets/js/mods.js` – new "Share buttons" field (one per line, delete a line to remove a button); anchor id is optional; new blogs start with the default share buttons.
- `assets/site/assets/css/blog-detail.css` – long text can no longer leave its box (hero, lead, sections, sidebar, buttons, author box); styles for sub-heading, numbered list, quote and underline. **Copy these appended rules to the real website's blog-detail.css as well.**
- `assets/css/cms.css` – editor toolbar wraps, readable formatting inside the editor, long text wraps in admin lists.

## Service editor + preview: new service gets the full template design (this update)
- `assets/site/assets/js/preview-bridge.js` – new `servicePage()`: the service page preview is now rebuilt from the draft with the real service-page markup (same classes, icons, backgrounds and behaviours as the 7 existing pages): hero (breadcrumb, eyebrow, H1, in-short, byline, floating chips), stats, page nav, and every section – Overview (+ at-a-glance box), Types, Symptoms, Causes, Diagnosis, Non-Surgical Care, Surgery table + image, Laser/Procedure box, Journey, Recovery (+ urgent box), Complications, Myths & Facts (flip cards), Cost (+ insurance box), Why Choose, Clinic Location, FAQs (accordion), Final CTA and disclaimer.
- A new service no longer previews on top of the Piles page text. Empty sections, empty cards/rows and empty fixed labels are skipped, so only what you filled in is shown; every filled section appears in the same design as the other services. Hidden sections stay hidden, the page nav only lists the sections that exist, phone / WhatsApp / address / hours follow Website Settings.
- Items added, deleted or re-ordered in a list (cards, steps, FAQs, table rows, myths, chips, tick points) show immediately.
- `assets/js/cms.js` – `Preview.build` now sends the whole service draft (`service`) instead of patching text pairs for `svc:` units; images uploaded in the editor appear in the preview.
- Checked in headless Chrome: for all 7 existing services the rebuilt page has the same text and the same page height as the real page; a new service filled step by step shows the same design; no sideways scroll on mobile (390 px).
- Not touched: blogs, homepage, pages, testimonials, settings, login, other modules.

## Service pages: long text stays inside cards + clear image labels
- `assets/site/assets/css/service-detail.css` (appended at the end) – long words / long lines now wrap inside cards, boxes, steps, journey, myths, chips, table cells, FAQ, hero and headings; grid children can shrink. **Copy these appended rules to the real website's service-detail.css too.**
- `assets/js/schema.js` – image fields now say where the photo appears (Surgery: tall photo left of the table; Non-Surgical: right of the care groups; Recovery: wide banner below the lead text; Why Choose: right of the reasons list; Clinic Location: left side of the Visit card) and that an empty field hides the image.

## SEO Management: Schema, Robots.txt, XML Sitemap, Analytics & Tracking
- SEO Management now has 5 tabs. **Page SEO** is the existing editor, unchanged.
- **Schema:** JSON-LD manager for the homepage, 7 services and 6 blog posts. Existing website schema is imported untouched; overview with filters; code editor; validation (syntax, @context, @type, required properties, URLs, dates, duplicates, sync with visible content); enable/disable, delete with confirmation, reset to existing, non-destructive "Complete missing schema", "Update from content". Draft posts and services are never output.
- **Robots.txt:** editor, generate, upload/replace, download, validate (protects service and blog pages, CSS/JS/images unless authorised), preview, status.
- **XML Sitemap:** generate from published content only (no drafts, hidden or noindex pages, no admin URLs, no duplicates), `lastmod` only from real recorded dates, upload/replace, download, XML validation, preview, "out of step" check.
- **Analytics & Tracking:** Google Analytics 4, Search Console, Bing, Tag Manager cards with enable/disable, status, validation, safe snippet building (only the ID is kept), injection plan, duplicate and double-counting warnings.
- New files: `assets/js/seo-existing.js`, `seo-api.js`, `seo-schema.js`, `seo-tools.js`, `docs/SEO-AUDIT.md`, `SEO-API.md`, `WEBSITE-INTEGRATION.md`, `docs/TEST-REPORT.md`, `tests/seo-ui-test.py`.
- Modified: `pages/seo-management.html` (4 script tags), `assets/css/cms.css` (`sx-*` classes appended). No other module was changed. SEO data is stored under its own keys, so the content version and saved edits are untouched.
