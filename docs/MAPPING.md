# DISHA Clinic – Website ↔ Admin Panel Mapping

Generated from the real website HTML (`disha-clinic-website.zip`) and the CMS schema (`assets/js/schema.js`). **The HTML files are the source of truth**; README/checklist files in the website ZIP were not trusted where they disagreed.

How to read it: **Website** = file + CSS selector where the content lives. **Admin** = module/section where it is edited. **Storage** = path inside the content store (`localStorage` now; same JSON shape for the backend later, see `content/disha-content-seed.json`).

## 1. Global values (written once, used in many places)

Phone, WhatsApp, e-mail, address, maps link and site URL are stored as `{{tokens}}` inside the content, so one change in **Website Settings** updates every place.

| Token | Settings field | Occurrences in site content |
|---|---|---|
| `{{phone}}` | Phone (international) | 9 |
| `{{phoneDisplay}}` | Phone (display) | 15 |
| `{{whatsapp}}` | WhatsApp number | 10 |
| `{{email}}` | E-mail | 5 |
| `{{address}}` | Full address | 3 |
| `{{mapsLink}}` | Google Maps link | 11 |
| `{{siteUrl}}` | Website URL | 64 |

Also global (from `assets/js/config.js`): clinic name, tagline, footer text, social links, time slots, closed days, header service menu, footer services list.

## 2. Homepage

- Website file: `index.html`
- Admin: Homepage Builder (section list: show/hide, reorder, edit)
- Storage: `home.sections[id].data`

| # | Section | Website selector | Editable fields |
|---|---|---|---|
| 1 | Hero Banner | `section.hero.hero-one` | Eyebrow `eyebrow` (text)<br>Heading – line 1 `h1a` (text, required)<br>Heading – line 2 `h1b` (text)<br>Tagline (italic) `tagline` (text)<br>Description `text` (long text)<br>Buttons (WhatsApp, Call, Book) `btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u`<br>Banner image `img` (image)<br>Banner image alt text `alt` (text)<br>Surgeon card image `s_img` (image)<br>Surgeon image alt text `s_alt` (text)<br>Surgeon card – name `s_name` (text)<br>Surgeon card – role `s_role` (text)<br>Highlight pills `pills` (list (one per line))<br>Vertical side text `vert` (text) |
| 2 | Statistics | `section.stats` | Statistics `items` (repeating items)<br>&nbsp;&nbsp;↳ Number (animated count) `num`<br>&nbsp;&nbsp;↳ Suffix (e.g. +) `suf`<br>&nbsp;&nbsp;↳ Text value (if no number) `text`<br>&nbsp;&nbsp;↳ Label `label` |
| 3 | Clinic Introduction | `section.about` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Paragraphs `paras` (paragraphs)<br>Tick points `bullets` (list (one per line))<br>Main image `img` (image)<br>Main image alt text `alt` (text)<br>Small image `sub` (image)<br>Small image alt text `sub_alt` (text)<br>Floating card – title `float_t` (text)<br>Floating card – text `float_d` (text) |
| 4 | Doctor Introduction | `section.surgeon` | Doctor image `img` (image)<br>Image alt text `alt` (text)<br>Caption – name `cap_t` (text)<br>Caption – qualification `cap_d` (text)<br>Badge – experience `badge_t` (text)<br>Badge – text `badge_d` (text)<br>Eyebrow `eyebrow` (text)<br>Doctor name `h2` (text, required)<br>Designation `role` (text)<br>Qualifications `pills` (list (one per line))<br>Introduction `text` (long text)<br>Facts (training, registration, availability) `facts` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Lines `lines`<br>Buttons `btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u` |
| 5 | Surgical Treatment (service cards) | `section.spec` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Description `intro` (long text)<br>Card link text `more_label` (text)<br>Help card – title `help_t` (text)<br>Help card – text `help_d` (long text)<br>Help card – points `help_pts` (list (one per line))<br>Help card – buttons `help_btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u` |
| 6 | Laser & Laparoscopic Surgery | `section.laser` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Main description `intro` (long text)<br>Laser treatment – heading `h3a` (text)<br>Laser treatment – content `pa` (long text)<br>Laparoscopic surgery – heading `h3b` (text)<br>Laparoscopic surgery – content `pb` (long text)<br>Side box – heading `know_t` (text)<br>Side box points `know` (repeating items)<br>&nbsp;&nbsp;↳ Bold lead `b`<br>&nbsp;&nbsp;↳ Text `t` |
| 7 | What to Expect at Clinic | `section.atclinic` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Cards `items` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d` |
| 8 | When Should You Consult a General Surgeon? | `section.pguide` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Description `intro` (long text)<br>Emergency box – bold text `emer_b` (text)<br>Emergency box – text `emer` (long text)<br>Questions & answers `items` (repeating items)<br>&nbsp;&nbsp;↳ Question `q`<br>&nbsp;&nbsp;↳ Answer `a` |
| 9 | Your Patient Journey | `section.section (heading "Your Patient Journey")` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Steps (numbered automatically) `items` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d` |
| 10 | Herbal Products (exactly 2) | `section.hb#herbal-products` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Intro – before bold `intro_a` (text)<br>Intro – bold text `intro_b` (text)<br>Intro – after bold `intro_c` (text)<br>Products `products` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Show on website `visible`<br>&nbsp;&nbsp;↳ Product name `name`<br>&nbsp;&nbsp;↳ Product image `img`<br>&nbsp;&nbsp;↳ Image alt text `alt`<br>&nbsp;&nbsp;↳ Badge `badge`<br>&nbsp;&nbsp;↳ Chips `chips`<br>&nbsp;&nbsp;↳ Description `desc`<br>&nbsp;&nbsp;↳ Info points `points`<br>&nbsp;&nbsp;↳ Button text `btn`<br>&nbsp;&nbsp;↳ WhatsApp pre-filled message `wa_msg`<br>&nbsp;&nbsp;↳ Hours text `hours`<br>&nbsp;&nbsp;↳ Location text `loc`<br>Disclaimer `disclaimer` (long text) |
| 11 | Patient Reviews | `section.reviews` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Description `intro` (long text)<br>"More reviews" button text `more.t` (text)<br>"More reviews" link `more.u` (link) |
| 12 | Visit Our Clinic | `section.onggl` | Eyebrow `eyebrow` (text)<br>Heading `h2` (text, required)<br>Description `intro` (long text)<br>Facts (landmark, building, floor, parking, hours) `facts` (repeating items)<br>&nbsp;&nbsp;↳ Label `b`<br>&nbsp;&nbsp;↳ Value `t`<br>Nearby areas text `near` (text)<br>Buttons `btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u`<br>Google Maps embed URL `map` (link)<br>Map title `map_title` (text)<br>Map bar label `map_label` (text)<br>Map bar button text `map_btn` (text) |
| 13 | Frequently Asked Questions | `section.faqx` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>FAQs `items` (repeating items)<br>&nbsp;&nbsp;↳ Question `q`<br>&nbsp;&nbsp;↳ Answer `a` |
| 14 | Final CTA | `section.section > .cta` | Heading `h2` (text, required)<br>Description `p` (long text)<br>Buttons `btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u` |

Notes: the **7 service cards** in "Surgical Treatment" are not stored here – they come from the service records (see §6). **Herbal Products** has exactly 2 products (fixed count, no add/delete) and no separate product pages. **Patient Reviews** cards come from Testimonials.

## 3. About Us

- Website file: `about-us/index.html`
- Admin: Page Management → About Us
- Storage: `about.sections[id].data`

| # | Section | Website selector | Editable fields |
|---|---|---|---|
| 1 | Page Header | `section.ph` | Page heading `h1` (text, required)<br>Introduction `p` (long text) |
| 2 | Doctor Profile | `section.surgeon` | Doctor image `img` (image)<br>Image alt text `alt` (text)<br>Badge – title `badge_t` (text)<br>Badge – text `badge_d` (text)<br>Eyebrow `eyebrow` (text)<br>Doctor name `h2` (text, required)<br>Designation `role` (text)<br>Introduction `text` (long text)<br>Tick points `bullets` (list (one per line))<br>Buttons `btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u` |
| 3 | About Us Introduction | `section.about` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Paragraphs `paras` (paragraphs)<br>Tick points `bullets` (list (one per line))<br>Button `btn` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u`<br>Main image `img` (image)<br>Main image alt text `alt` (text)<br>Small image `sub` (image)<br>Small image alt text `sub_alt` (text)<br>Floating card – title `float_t` (text)<br>Floating card – text `float_d` (text) |
| 4 | Doctor Education & Expertise | `section.tj-sec` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Description `intro` (long text)<br>Timeline items `items` (repeating items)<br>&nbsp;&nbsp;↳ Label / year `k`<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d`<br>Bottom link text `btn` (text) |
| 5 | Our Mission & Our Vision | `section.section (.card.mv)` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Mission / Vision cards `items` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d` |
| 6 | Reasons Patients Trust Us | `section.section (.card.why)` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Reasons `items` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d` |
| 7 | What to Expect | `section (.tj4)` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Description `intro` (long text)<br>Steps `items` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d` |
| 8 | Trained, Certified & Accountable | `section (.credsplit)` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Paragraphs `paras` (paragraphs)<br>Button text `btn.t` (text)<br>Button link `btn.u` (link)<br>Certificate (full size) `full` (image)<br>Certificate thumbnail `img` (image)<br>Image alt text `alt` (text)<br>Tag – title `tag_t` (text)<br>Tag – text `tag_d` (text) |
| 9 | Clinic Environment | `section.infra` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Description `intro` (long text)<br>Gallery images `items` (repeating items)<br>&nbsp;&nbsp;↳ Image `img`<br>&nbsp;&nbsp;↳ Alt text `alt`<br>&nbsp;&nbsp;↳ Caption `cap` |
| 10 | Final Consultation CTA | `section > .cta` | Heading `h2` (text, required)<br>Description `p` (long text)<br>Buttons `btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u` |

## 4. Contact Us

- Website file: `contact-us/index.html`
- Admin: Page Management → Contact Us
- Storage: `contact.sections[id].data`

| # | Section | Website selector | Editable fields |
|---|---|---|---|
| 1 | Page Heading | `section.ct-hero` | Eyebrow `eyebrow` (text)<br>Heading (before highlighted word) `h1a` (text, required)<br>Highlighted word `h1b` (text)<br>Introduction `sub` (long text)<br>Info pills `pills` (list (one per line))<br>Live status text `live_note` (text)<br>Buttons `btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u` |
| 2 | Quick Contact Cards | `section.ct-quick` | Cards `items` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Sub text `d`<br>&nbsp;&nbsp;↳ Action text `cta`<br>&nbsp;&nbsp;↳ Link `u`<br>&nbsp;&nbsp;↳ Highlighted card `feat` |
| 3 | Get in Touch (labels) | `section.ct-main .ct-card:first-child` | Heading `h2` (text, required)<br>Introduction `p` (text)<br>Row labels (Address, Phone, WhatsApp, Email, Follow us) `labels` (list (one per line)) |
| 4 | Enquiry Form | `form.ct-form` | Form heading `h2` (text, required)<br>Form description `p` (text)<br>Field labels (existing fields only) `fields` (list (one per line))<br>Submit button text `submit` (text)<br>Success – heading `ok_t` (text)<br>Success – messages `ok_p` (list (one per line))<br>Privacy note `note` (text) |
| 5 | Working Days & Hours | `section.ct-main .ct-card (hours)` | Heading `h2` (text, required)<br>Description `p` (text)<br>Time slots title `slots_title` (text)<br>Button text `btn` (text)<br>Button link `btn_u` (link) |
| 6 | Find Us (map) | `section.ct-main .ct-card (map)` | Heading `h2` (text, required)<br>Description `p` (text)<br>Google Maps embed URL `embed` (link)<br>Directions button text `btn` (text) |
| 7 | Final CTA | `section.ct-bandsec` | Heading `h2` (text, required)<br>Description `p` (long text)<br>Buttons `btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u` |

## 5. Book Appointment

- Website file: `book-appointment/index.html`
- Admin: Page Management → Book Appointment
- Storage: `booking.sections[id].data`

| # | Section | Website selector | Editable fields |
|---|---|---|---|
| 1 | Page Heading | `section.ph` | Page heading `h1` (text, required)<br>Description `p` (long text) |
| 2 | Appointment Form | `form#bookForm` | Field labels (existing fields only) `labels` (list (one per line))<br>Dropdown placeholder `select_ph` (text)<br>Gender options `genders` (list (one per line))<br>Service / Department options `services` (list (one per line))<br>Doctor options `doctors` (list (one per line))<br>Time-slot hint `slot_hint` (text)<br>Message placeholder `msg_ph` (text)<br>Consent text – start `consent_pre` (text)<br>Consent text – "and" `consent_and` (text)<br>Consent text – end `consent_post` (text)<br>Submit button text `submit` (text) |
| 3 | Success Message | `#bookOk` | Heading `h3` (text)<br>Message `p` (text)<br>WhatsApp button text `wa_btn` (text)<br>E-mail button text `mail_btn` (text) |
| 4 | Urgent Advice | `aside .box.pri` | Heading `h3` (text)<br>Text `p` (long text)<br>Button text (number comes from Settings) `btn` (text) |
| 5 | Working Hours box | `aside .box (working hours)` | Heading `h3` (text)<br>Rows `rows` (repeating items)<br>&nbsp;&nbsp;↳ Days `0`<br>&nbsp;&nbsp;↳ Hours `1` |
| 6 | What to Bring | `aside .box (what to bring)` | Heading `h3` (text)<br>Checklist items `items` (list (one per line)) |

## 6. Privacy Policy & Terms & Conditions

| Page | File | Storage | Sections |
|---|---|---|---|
| Privacy Policy | `privacy-policy/index.html` | `privacy` | 11 (each: anchor id, heading, rich-text content) |
| Terms & Conditions | `terms-and-conditions/index.html` | `terms` | 11 |

Editor: Page Management → page. Heading, intro, "Last updated" line and every section (add/delete/reorder, rich text). Legal text is not rewritten.

## 7. Services

- Admin: Services (list, order, show/hide) → Edit service. Services page content: Services → "Services page content".
- Storage: `services[slug]` (record + `listing` card + `sections[id].data`); listing page: `servicesPage`.
- All 7 service pages share one 20-block structure, so one editor serves all; each service has independent content.

| Service | Page | Card image |
|---|---|---|
| Piles (Haemorrhoid) Treatment | `services/piles-haemorrhoid-surgery/index.html` | `assets/img/service-piles-haemorrhoid-surgery.jpg` |
| Anal Fissure Treatment | `services/fissure-treatment/index.html` | `assets/img/service-fissure-treatment.jpg` |
| Anal Fistula Treatment | `services/fistula-treatment/index.html` | `assets/img/service-fistula-treatment.jpg` |
| Pilonidal Sinus Treatment | `services/pilonidal-sinus-surgery/index.html` | `assets/img/service-pilonidal-sinus-surgery.jpg` |
| Hernia Repair Surgery | `services/hernia-repair-surgery/index.html` | `assets/img/service-hernia-repair-surgery.jpg` |
| Appendix Surgery | `services/appendix-surgery/index.html` | `assets/img/service-appendix-surgery.jpg` |
| Gallbladder Stone Surgery | `services/gallbladder-stone-surgery/index.html` | `assets/img/service-gallbladder-stone-surgery.jpg` |

**Service card** (`listing`) fields: Name on website cards; Short description (home + Services page cards); Card image; Card image alt text; Services-page badge (e.g. Laser option); Card link text. It feeds the homepage "Surgical Treatment" cards **and** the Services-page cards.

## 7a. Service page sections (every service)

- Website file: `services/<slug>/index.html`
- Admin: Services → Edit service
- Storage: `services[slug].sections[id].data`

| # | Section | Website selector | Editable fields |
|---|---|---|---|
| 1 | Hero | `section.sd-hero` | Eyebrow `eyebrow` (text)<br>Page heading (H1) `h1` (text, required)<br>"In short" label `short_label` (text)<br>In-short text `short` (long text)<br>Byline `byline` (text)<br>Floating chip 1 `float1` (text)<br>Floating chip 2 `float2` (text) |
| 2 | At a Glance (stats) | `.sd-stats` | Stat tiles `items` (repeating items)<br>&nbsp;&nbsp;↳ Number `num`<br>&nbsp;&nbsp;↳ Suffix `suf`<br>&nbsp;&nbsp;↳ Text (if no number) `text`<br>&nbsp;&nbsp;↳ Label `label` |
| 3 | Overview | `#overview` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Paragraphs `paras` (paragraphs)<br>Mini cards `minis` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d`<br>Box heading `box_t` (text)<br>Box items `box` (repeating items)<br>&nbsp;&nbsp;↳ Badge `n`<br>&nbsp;&nbsp;↳ Bold lead `k`<br>&nbsp;&nbsp;↳ Text `d` |
| 4 | Types & Approaches | `#types` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Intro `intro` (long text)<br>Cards `items` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d` |
| 5 | Symptoms & When to See a Specialist | `#symptoms` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Columns `cols` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Column title `t`<br>&nbsp;&nbsp;↳ Items `items`<br>Warning note `warn` (long text) |
| 6 | Causes & Risk Factors | `#causes` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Paragraphs `paras` (paragraphs)<br>Risk-factor chips `chips` (list (one per line)) |
| 7 | Diagnosis | `#diagnosis` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Intro `intro` (long text)<br>Steps `items` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d`<br>Note `note` (long text) |
| 8 | Non-Surgical Care | `#nonsurgical` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Intro `intro` (long text)<br>Groups `groups` (repeating items)<br>&nbsp;&nbsp;↳ Group title `t`<br>&nbsp;&nbsp;↳ Items `items`<br>Image `img` (image)<br>Image alt text `alt` (text)<br>Caption `cap` (text) |
| 9 | Surgery Information | `#surgery` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Intro `intro` (long text)<br>Image `img` (image)<br>Image alt text `alt` (text)<br>Caption `cap` (text)<br>Surgery options table `rows` (table) |
| 10 | Laser Option / Procedure Information | `#laser` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Paragraphs `paras` (paragraphs)<br>Note box heading `note_t` (text)<br>Note points `note` (list (one per line)) |
| 11 | Treatment Journey | `#journey` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Steps `items` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d` |
| 12 | Recovery & Aftercare | `#recovery` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Lead text `lead` (long text)<br>Image `img` (image)<br>Image alt text `alt` (text)<br>Help box heading `help_t` (text)<br>Help items `help` (list (one per line))<br>Urgent box heading `call_t` (text)<br>Urgent box text `call` (long text)<br>Urgent box button text `call_btn` (text) |
| 13 | Complications | `#ignored` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Intro `intro` (long text)<br>Cards `items` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d` |
| 14 | Myths & Facts | `#myths` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Myths `items` (repeating items)<br>&nbsp;&nbsp;↳ Myth `m`<br>&nbsp;&nbsp;↳ Fact `f`<br>Hint text `hint` (text) |
| 15 | Cost & Planning | `#cost` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Paragraphs `paras` (paragraphs)<br>Cost factors `items` (list (one per line))<br>Box heading `box_t` (text)<br>Box text `box` (long text)<br>Box button text `box_btn` (text) |
| 16 | Why Choose DISHA | `#why` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Intro `intro` (long text)<br>Points `points` (repeating items)<br>&nbsp;&nbsp;↳ Title `t`<br>&nbsp;&nbsp;↳ Description `d`<br>Image `img` (image)<br>Image alt text `alt` (text)<br>Caption `cap` (text) |
| 17 | Clinic Location | `#visit` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>Image `img` (image)<br>Image alt text `alt` (text)<br>Caption `cap` (text) |
| 18 | FAQs | `#faq` | Small label (eyebrow) `eyebrow` (text)<br>Heading `h2` (text, required)<br>FAQs `items` (repeating items)<br>&nbsp;&nbsp;↳ Question `q`<br>&nbsp;&nbsp;↳ Answer `a` |
| 19 | Final CTA | `section.sd-final` | Heading `h2` (text, required)<br>Description `p` (long text) |
| 20 | Medical disclaimer | `.sd-medical` | Disclaimer text `text` (long text) |

## 7b. Services listing page

- Website file: `services/index.html`
- Admin: Services → Services page content
- Storage: `servicesPage`

| # | Section | Website selector | Editable fields |
|---|---|---|---|
| 1 | Page Heading | `section.ph-svc` | Eyebrow `eyebrow` (text)<br>Page heading `h1` (text, required)<br>Introduction `p` (long text)<br>Highlight pills `pills` (list (one per line)) |
| 2 | Surgical Treatment (cards heading) | `section.svc-spec .sh` | Eyebrow `eyebrow` (text)<br>Heading `h2` (text, required)<br>Description `intro` (long text) |
| 3 | "Not sure what you need?" card | `.spec-help` | Title `t` (text)<br>Text `d` (long text)<br>Points `pts` (list (one per line))<br>Buttons `btns` (repeating items, fixed count)<br>&nbsp;&nbsp;↳ Button text `t`<br>&nbsp;&nbsp;↳ Link `u` |
| 4 | Other Conditions + Consultation CTA | `section .cfw` | Eyebrow `eyebrow` (text)<br>Heading `h2` (text, required)<br>Text `p` (long text)<br>Button text `btn.t` (text)<br>Button link `btn.u` (link)<br>Conditions list `items` (list (one per line)) |

## 8. Blogs

- Admin: Blog Management (list, show/hide) → Edit article; "Blogs page content" for the listing heading.
- Storage: `posts[slug]`; listing: `blogsPage`.
- Table of contents is generated from the article sections; related posts are chosen by the editor.

| Article | Page | Sections |
|---|---|---|
| Hernia Symptoms, Types and When Surgery Is Needed | `blogs/hernia-symptoms-types-and-when-surgery-is-needed/index.html` | 11 |
| Laser Piles Treatment: How It Works and What Recovery Looks Like | `blogs/laser-piles-treatment-how-it-works-and-recovery/index.html` | 9 |
| Kidney Stone Symptoms, Prevention and Treatment Options | `blogs/kidney-stone-symptoms-prevention-and-treatment/index.html` | 8 |
| Gallbladder Stone Symptoms and Treatment in Kharadi, Pune | `blogs/gallbladder-stone-symptoms-and-treatment/index.html` | 11 |
| Piles vs Fissure: Symptoms, Causes and When to See a Doctor | `blogs/piles-vs-fissure-symptoms-causes-when-to-see-doctor/index.html` | 11 |
| Laparoscopic Surgery Recovery: What to Expect After | `blogs/laparoscopic-surgery-recovery-what-to-expect/index.html` | 12 |

**Listing card fields:** Show on website; Blog title; Short description (listing card + hero); Category; Publish date; Read time (e.g. 5 min read); Author name on listing card; Thumbnail image; Thumbnail alt text; Featured article; Card button text; Featured label.

**Article page fields:** Subtitle (hero); Author (hero); Author initial; Hero / article image; Hero image alt text; Lead paragraph; Introduction paragraphs; Article sections (table of contents is generated from these); Service note – before link; Service note – link text; Service note – linked service; Service note – after link; Share label; Author box – name; Author box – credentials; Side CTA – heading; Side CTA – text; Side CTA – button labels; Table of contents heading; Related posts heading; Related posts; Closing CTA – heading; Closing CTA – text; Closing CTA – button labels.

Blogs listing page (`blogs/index.html`, `section.bl-hero`): Page heading; Introduction; Highlight pills.

## 9. Website Settings (global)

**Clinic identity** – Clinic name `name` (text, required); Short name `short` (text); Tagline / subtitle `subtitle` (text); Footer description `about` (long text); Logo `logo` (image); Favicon `favicon` (image); Website URL `siteUrl` (link, required); Footer year `year` (text)

**Contact details** – Phone (international, for links) `phone` (text, required); Phone (display) `phoneDisplay` (text, required); WhatsApp number (digits only) `whatsapp` (text, required); WhatsApp pre-filled message `waText` (long text); E-mail `email` (text, required); Full address `address` (long text, required); Google Maps link `mapsLink` (link); Google Maps embed URL `mapsEmbed` (link)

**Hours, slots & closed days** – Hours text (footer) `hours` (text); Call-ahead text `callAhead` (text); Opening hours by day `hoursByDay` (repeating items, fixed count); &nbsp;&nbsp;↳ Day `day`; &nbsp;&nbsp;↳ Opens `open`; &nbsp;&nbsp;↳ Closes `close`; &nbsp;&nbsp;↳ Closed `closed`; Appointment time slots `slots` (list (one per line)); Closed days `closedDays` (days)

**Social media** – Social links `social` (repeating items, fixed count); &nbsp;&nbsp;↳ Network `label`; &nbsp;&nbsp;↳ URL `url`

**Navigation & footer links** – Header "Services" dropdown groups `serviceGroups` (repeating items); &nbsp;&nbsp;↳ Group title `title`; &nbsp;&nbsp;↳ Services in group `items`; Short service names (menus) `menuServices` (repeating items); &nbsp;&nbsp;↳ Service `slug`; &nbsp;&nbsp;↳ Short name `label`; Footer – services list `footerServices` (multi-choice)

**Default SEO** – Default social sharing image `ogImage` (image)

Source file today: `assets/js/config.js` (`window.SITE`). Hard-coded copies not covered by tokens: opening hours (10 AM–9 PM) in `contact.js` and Contact-page HTML, and "Daily 10:00 AM – 9:00 PM" phrasing in several sections.

## 10. Other modules

| Module | Website content | Storage |
|---|---|---|
| Team & Doctors | Dr. Abhijeet Suresh Shinde (Home, About, blog author boxes) | `doctors[]` |
| Testimonials | Review cards on Home (currently placeholders) | `testimonials[]` (starts empty) |
| SEO Management | `<title>`, description, canonical, robots, Open Graph of 21 pages | `seo[]` |
| Appointments & Enquiries | Forms on `book-appointment` and `contact-us` | backend only |
| Version History | – | `localStorage disha:versions` |

### SEO pages

| Page | File |
|---|---|
| Home | `index.html` |
| About Us | `about-us/index.html` |
| Services | `services/index.html` |
| Blogs | `blogs/index.html` |
| Contact Us | `contact-us/index.html` |
| Book Appointment | `book-appointment/index.html` |
| Privacy Policy | `privacy-policy/index.html` |
| Terms & Conditions | `terms-and-conditions/index.html` |
| Service: appendix-surgery | `services/appendix-surgery/index.html` |
| Service: fissure-treatment | `services/fissure-treatment/index.html` |
| Service: fistula-treatment | `services/fistula-treatment/index.html` |
| Service: gallbladder-stone-surgery | `services/gallbladder-stone-surgery/index.html` |
| Service: hernia-repair-surgery | `services/hernia-repair-surgery/index.html` |
| Service: piles-haemorrhoid-surgery | `services/piles-haemorrhoid-surgery/index.html` |
| Service: pilonidal-sinus-surgery | `services/pilonidal-sinus-surgery/index.html` |
| Blog: gallbladder-stone-symptoms-and-treatment | `blogs/gallbladder-stone-symptoms-and-treatment/index.html` |
| Blog: hernia-symptoms-types-and-when-surgery-is-needed | `blogs/hernia-symptoms-types-and-when-surgery-is-needed/index.html` |
| Blog: kidney-stone-symptoms-prevention-and-treatment | `blogs/kidney-stone-symptoms-prevention-and-treatment/index.html` |
| Blog: laparoscopic-surgery-recovery-what-to-expect | `blogs/laparoscopic-surgery-recovery-what-to-expect/index.html` |
| Blog: laser-piles-treatment-how-it-works-and-recovery | `blogs/laser-piles-treatment-how-it-works-and-recovery/index.html` |
| Blog: piles-vs-fissure-symptoms-causes-when-to-see-doctor | `blogs/piles-vs-fissure-symptoms-causes-when-to-see-doctor/index.html` |

## 11. Not editable on purpose

- Hero illustrations on service pages (fixed SVG).
- Header/footer markup (built by `layout.js`; values come from Settings).
- URL slugs of existing pages (changing them would break links/canonicals).
- Page design, colours, fonts, animations.

## 12. Findings in the source that need a decision

1. **Placeholders**: e-mail `info@dishaclinic.example`, domain `dishaclinic.example` (canonicals, Open Graph, sitemap), social links all `#`, registration number `[add State Medical Council / NMR number]`, parking `[add parking details]`.
2. **Reviews** are placeholder cards (`[Reviewer name]`, `[Paste a real Google review here…]`) on Home – not published as real reviews.
3. **Patient count mismatch**: Home/About say 3,500+, service pages 2,500+.
4. **Booking form** lists 29 services, many not on the website (e.g. Kidney Stone, Prostate, Thyroid) – editable, but only change with clinic approval.
5. **`_service-template/README.md`** refers to a `build.py` that is not in the ZIP, and its JSON differs from the real HTML (HTML used).
6. Opening hours are hard-coded in `contact.js` and not driven by `config.js`.
