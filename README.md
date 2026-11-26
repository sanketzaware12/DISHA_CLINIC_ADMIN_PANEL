# DISHA Clinic CMS – Admin Panel (Phase 1–3: mapping + frontend)

Stack: HTML, Tailwind (CDN, as before), vanilla JS. No frameworks, no Python, no build step.

## Run
Open `index.html` (or `login.html`). Demo login is unchanged: `admin@disha.demo` / `Admin@123` (browser-only check; real authentication comes with the backend).

## What this phase delivers
The admin panel now edits the **real content of the DISHA website**, extracted from its HTML (not demo data):

| Module | Status |
|---|---|
| Homepage Builder – 14 real sections, 2 herbal products inside it, show/hide, reorder | Done (frontend) |
| Page Management – About (10 sections), Contact, Book Appointment, Privacy, Terms | Done (frontend) |
| Services – 7 services × 20 sections, shared service card (home + Services page), listing page content | Done (frontend) |
| Blog Management – 6 articles, listing card + article editor, listing page content | Done (frontend) |
| Testimonials (starts empty) | Done (frontend) |
| Website Settings, SEO Management (21 pages) | Done (frontend) |
| Save Draft / Preview / Publish | Draft + "published copy" work **in this browser only**; Preview shows the real site design |
| Real publishing to the website, real auth, image storage, DB, APIs | **Phase 4–5 (pending)** |

## Important: what "Publish" means right now
Content lives in `localStorage` (`disha:content` = draft, `disha:contentPub` = published snapshot, `disha:versions` = history). Nothing reaches the real website yet. Use **Version History → Export published JSON** to get the exact content the backend should serve (`content/disha-content-seed.json` is the starting copy, same shape).

## Where the backend will plug in
All reads/writes go through the `Content` object in `assets/js/cms.js` (`load`, `save`, `saveDraft`, `publish`, `restore`) and `Media.upload`. Replace those bodies with API calls; the editors, schema and mapping do not change. `assets/js/schema.js` lists every field and its website file + CSS selector (also in `docs/MAPPING.md`).

## Design preservation
Login page, `style.css`, `components.css`, `dashboard.css`, sidebar and header are byte-identical to your files. New styles are only in `assets/css/cms.css` (section editor rows). Existing component classes are reused.

## Deliberate deviations (please review)
1. **Website Settings, SEO Management, Version History** pages were self-contained demos with fake data (and slug editing). Their inner layout is now built with the shared section editor so they can edit real values. Shell, sidebar, header and component styles are the same.
2. **Products** and **Theme & Appearance** are hidden from the sidebar (the 2 products are managed in Homepage Builder; theme editing would break the "design unchanged" rule). Their pages still exist and explain this.
3. **Existing service/blog pages cannot be deleted** from the CMS (to protect URLs); hide them. New records can be added as drafts; their page files are created in the website-integration phase.
4. **Preview** opens the **real website page in its own design** (a copy of your site is inside `assets/site/`, used only for previews) with your draft edits applied: text, images, links, hidden sections and global phone/e-mail. Added/removed list items (tick points, highlight pills, cards, FAQs, steps, etc.) now show in the preview too. Only section order is not previewed (it appears after publishing).
5. Dashboard "Total Products" card became **Testimonials** (the site has no product catalogue). The Media Library module was removed; every image field now has a simple Upload / Replace / Remove control with drag & drop.

## Content found that needs your approval (shown as placeholders in the panel)
E-mail and domain use `.example`; social links are `#`; registration number and parking text are placeholders; all review cards on the site are placeholders; patient count differs (3,500+ vs 2,500+). Nothing was invented – see `docs/MAPPING.md` §12.

## Updating from the previous zip
Content version is `1.0.2`. If you opened the earlier zip in your browser, the stored demo copy is replaced automatically with the corrected content (unsaved test edits are lost). Moving from `1.0.1` to `1.0.2` only removes the sections that were taken off the website (see docs/CHANGES.md); your saved edits are kept.

## Files
- `docs/MAPPING.md` – full website ↔ admin mapping · `docs/TEST-REPORT.md` – tests actually run · `docs/CHANGES.md` – modified/new files
- `content/disha-content-seed.json` – extracted real content
- `assets/site/` – copy of the website (pages, CSS, JS, images) used only for previews; `assets/site/assets/js/preview-bridge.js` applies the draft edits. The real website is untouched.


## SEO Management (Schema, Robots.txt, XML Sitemap, Analytics & Tracking)
Code: `assets/js/seo-existing.js`, `seo-api.js`, `seo-schema.js`, `seo-tools.js`. Docs: `docs/SEO-AUDIT.md`, `docs/SEO-API.md`, `docs/WEBSITE-INTEGRATION.md`, `docs/TEST-REPORT.md`. Runs in local mode until `SEO_API.mode` is set to `remote` and the backend exists. The live website is not changed by the admin panel before that.
