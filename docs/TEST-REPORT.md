# SEO Management – test report

Run with: `node tests/seo-logic-test.js` (rules and validators, 33 checks) and `python3 tests/seo-ui-test.py` (real Chromium through Playwright, 65 checks, serve the project folder on port 8765 first).

**Result: logic 33/33 passed, browser 65/65 passed, 0 console or page errors.**

| Area | What was checked |
|---|---|
| Schema | Overview of 14 pages; existing schema imported untouched; homepage shown as Missing (WebSite, Organization); opening a page does not create a draft change; invalid JSON, missing @context, bad URL, bad date caught; save blocked on errors; unsaved-changes guard; duplicate type blocked and detected; delete asks for confirmation; reset to existing; non-destructive completion (services gain url/image/serviceType, existing description kept; blog `dateModified` added only after the admin enters a date, existing `mainEntityOfPage` kept); draft posts never output |
| Robots.txt | Empty at start; generate; save; blocking `/assets/` and `/services/` is an error until authorised; wildcard rules are not mis-flagged; rule before User-agent, unknown lines, relative Sitemap URL caught; download; upload with errors flagged; wrong file type rejected; live check says "needs backend" |
| Sitemap | 21 URLs generated from published content; official namespace; `lastmod` only where a real date exists; duplicate and admin/login URLs, malformed XML and a wrong root element rejected; draft blog shown as left out; out-of-step check |
| Analytics | 4 cards start as Not Configured; invalid GA ID rejected; GA shows Enabled only when valid and on; Search Console shows Verification Pending (never "verified" by itself); GTM ID extracted from a pasted snippet and the rest discarded (no script text stored); duplicate/double-counting warning; injection plan; disable shows Disabled |
| Publish | Confirmation text says the live site is unchanged; published copy stored; manifest built from published content; `<` escaped in JSON-LD; admin and login excluded; draft post excluded; state survives reload; tab kept in the URL |
| Existing modules | Dashboard, Homepage Builder, Page Management, Services, Blogs, Testimonials, Website Settings, My Profile, Security load with no errors; the existing Page SEO editor still lists its 21 pages |
| Responsive | No horizontal overflow at 390, 820 and 1024 px on all four new tabs |

## Not testable here (needs the real backend / live site)
- Live availability of `/robots.txt` and `/sitemap.xml`.
- Injection of schema and tracking tags into the live pages.
- Google Search Console and Bing verification, Google Rich Results eligibility.
- Role-based authorisation on the endpoints.
