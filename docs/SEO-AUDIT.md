# SEO audit (page-wise)

Generated from the website copy in `assets/site/` and the existing JSON-LD of every page. The placeholder domain `www.dishaclinic.example` is used throughout the site until the real address is set.

## Summary

- 21 website pages audited: 8 static pages, 7 service pages, 6 blog posts.
- Every page already has a title, a meta description and a canonical URL.
- **Missing recommended schema:** Homepage has MedicalClinic + Physician but no `WebSite` and no `Organization` block.
- **Service pages** (7) have `Service` + `MedicalProcedure`, `FAQPage` and `BreadcrumbList`, but the `Service` block has no `url`, `image` or `serviceType`.
- **Blog posts** (6) have `BlogPosting` + `BreadcrumbList`, but no `dateModified`, and the publisher has no logo.
- No page has a JSON syntax error or a duplicate block.
- `robots.txt` and `sitemap.xml` do **not exist** in the website copy.
- No analytics or verification tag is live (about 10 pages carry a `[REPLACE]` placeholder comment for Search Console only).

## Page table

| Page URL | Title chars | Description chars | Canonical | Robots meta | Schema types present | Status | Missing recommended |
|---|---|---|---|---|---|---|---|
| `/` | 52 | 163 | yes | index,follow | MedicalClinic, Physician | missing | WebSite, Organization |
| `/about-us/` | 59 | 162 | yes | index,follow | Physician, BreadcrumbList | warn | - |
| `/services/` | 63 | 163 | yes | index,follow | BreadcrumbList | warn | - |
| `/blogs/` | 66 | 161 | yes | index,follow | BreadcrumbList | warn | - |
| `/contact-us/` | 64 | 162 | yes | index,follow | MedicalClinic, Physician, BreadcrumbList | warn | - |
| `/book-appointment/` | 60 | 164 | yes | index,follow | BreadcrumbList | warn | - |
| `/privacy-policy/` | 52 | 157 | yes | index,follow | BreadcrumbList | warn | - |
| `/terms-and-conditions/` | 60 | 163 | yes | index,follow | BreadcrumbList | warn | - |
| `/services/piles-haemorrhoid-surgery/` | 84 | 169 | yes | index,follow | Service, MedicalProcedure, FAQPage, BreadcrumbList | warn | - |
| `/services/fissure-treatment/` | 54 | 160 | yes | index,follow | Service, MedicalProcedure, FAQPage, BreadcrumbList | warn | - |
| `/services/fistula-treatment/` | 54 | 159 | yes | index,follow | Service, MedicalProcedure, FAQPage, BreadcrumbList | warn | - |
| `/services/pilonidal-sinus-surgery/` | 57 | 158 | yes | index,follow | Service, MedicalProcedure, FAQPage, BreadcrumbList | warn | - |
| `/services/hernia-repair-surgery/` | 53 | 156 | yes | index,follow | Service, MedicalProcedure, FAQPage, BreadcrumbList | warn | - |
| `/services/appendix-surgery/` | 48 | 155 | yes | index,follow | Service, MedicalProcedure, FAQPage, BreadcrumbList | warn | - |
| `/services/gallbladder-stone-surgery/` | 57 | 153 | yes | index,follow | Service, MedicalProcedure, FAQPage, BreadcrumbList | warn | - |
| `/blogs/hernia-symptoms-types-and-when-surgery-is-needed/` | 49 | 186 | yes | index,follow | BlogPosting, BreadcrumbList | warn | - |
| `/blogs/laser-piles-treatment-how-it-works-and-recovery/` | 64 | 203 | yes | index,follow | BlogPosting, BreadcrumbList | warn | - |
| `/blogs/kidney-stone-symptoms-prevention-and-treatment/` | 55 | 191 | yes | index,follow | BlogPosting, BreadcrumbList | warn | - |
| `/blogs/gallbladder-stone-symptoms-and-treatment/` | 57 | 155 | yes | index,follow | BlogPosting, BreadcrumbList | warn | - |
| `/blogs/piles-vs-fissure-symptoms-causes-when-to-see-doctor/` | 59 | 164 | yes | index,follow | BlogPosting, BreadcrumbList | warn | - |
| `/blogs/laparoscopic-surgery-recovery-what-to-expect/` | 59 | 159 | yes | index,follow | BlogPosting, BreadcrumbList | warn | - |

## Schema issues found (what the panel checks)

**`/`**
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/about-us/`**
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/services/`**
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/blogs/`**
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/contact-us/`**
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/book-appointment/`**
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/privacy-policy/`**
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/terms-and-conditions/`**
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/services/piles-haemorrhoid-surgery/`**
- Recommended property "url" is missing.
- Recommended property "image" is missing.
- Recommended property "serviceType" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/services/fissure-treatment/`**
- Recommended property "url" is missing.
- Recommended property "image" is missing.
- Recommended property "serviceType" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/services/fistula-treatment/`**
- Recommended property "url" is missing.
- Recommended property "image" is missing.
- Recommended property "serviceType" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/services/pilonidal-sinus-surgery/`**
- Recommended property "url" is missing.
- Recommended property "image" is missing.
- Recommended property "serviceType" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/services/hernia-repair-surgery/`**
- Recommended property "url" is missing.
- Recommended property "image" is missing.
- Recommended property "serviceType" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/services/appendix-surgery/`**
- Recommended property "url" is missing.
- Recommended property "image" is missing.
- Recommended property "serviceType" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/services/gallbladder-stone-surgery/`**
- Recommended property "url" is missing.
- Recommended property "image" is missing.
- Recommended property "serviceType" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/blogs/hernia-symptoms-types-and-when-surgery-is-needed/`**
- Recommended property "dateModified" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/blogs/laser-piles-treatment-how-it-works-and-recovery/`**
- Recommended property "dateModified" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/blogs/kidney-stone-symptoms-prevention-and-treatment/`**
- Recommended property "dateModified" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/blogs/gallbladder-stone-symptoms-and-treatment/`**
- Recommended property "dateModified" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/blogs/piles-vs-fissure-symptoms-causes-when-to-see-doctor/`**
- Recommended property "dateModified" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.

**`/blogs/laparoscopic-surgery-recovery-what-to-expect/`**
- Recommended property "dateModified" is missing.
- URLs use the placeholder domain (dishaclinic.example). Set the real address in Website Settings before publishing.


## Pages that need updates

1. Homepage: add `WebSite` and `Organization` (Schema tab ▸ Homepage ▸ Complete missing).
2. All 7 service pages: add `url`, `image`, `serviceType` to the existing `Service` block. Existing values are not changed.
3. All 6 blog posts: add the publisher logo, and `dateModified` once an update date is entered in the Schema tab.
4. Everything: replace the placeholder domain once the real website address is set in Website Settings.
