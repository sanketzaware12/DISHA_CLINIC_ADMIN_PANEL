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
