# SEO Management – backend API contract

The admin panel works today in **local mode** (`SEO_API.mode = 'local'` in `assets/js/seo-api.js`): drafts and the "published" copy live in this browser only (`disha:seoTools`, `disha:seoToolsPub`). Nothing reaches the live website. Set `mode: 'remote'` once these endpoints exist. The UI then calls them, and it never claims more than the server confirms.

All endpoints: same origin, JSON, authenticated Admin only (session cookie or bearer token), CSRF protected, rate limited. Reject everything for non-admin users with `401/403`.

| Purpose | Method + path | Request body | Response |
|---|---|---|---|
| Load config | `GET /api/seo/config` | – | `{draft, published, files:{robots:{live,updatedAt}, sitemap:{live,updatedAt}}}` |
| Save draft | `PUT /api/seo/config/draft` | the full draft object (see below) | `{ok:true, updatedAt}` |
| Publish | `POST /api/seo/config/publish` | `{manifest}` (see below) | `{ok:true, publishedAt, written:{robots,sitemap,schema,tracking}}` |
| Write robots.txt | `PUT /api/seo/files/robots.txt` | `{content}` | `{ok:true, url, updatedAt}` |
| Write sitemap.xml | `PUT /api/seo/files/sitemap.xml` | `{content}` | `{ok:true, url, updatedAt}` |
| Check live URL | `POST /api/seo/files/probe` | `{url}` | `{ok:true, status:200}` |

## Draft object

```json
{ "v":1,
  "schema":{"pages":{"home":{"enabled":true,"dateModified":"","blocks":[{"id":"…","json":"{…}","enabled":true,"source":"existing|generated|custom","mode":"manual|auto"}]}}},
  "robots":{"content":"…","source":"generated|edited|uploaded","updatedAt":"ISO","authorised":false},
  "sitemap":{"content":"<?xml …","source":"…","updatedAt":"ISO","opts":{"lastmod":true}},
  "tracking":{"ga":{"enabled":false,"id":""},"gsc":{"enabled":false,"code":"","confirmed":false},
              "bing":{"enabled":false,"code":"","confirmed":false},"gtm":{"enabled":false,"id":""}} }
```

## Publish manifest (built by the panel from the **published** content)

```json
{ "version":1, "generatedAt":"ISO", "siteUrl":"https://real-domain", "placeholderDomain":false,
  "tracking":{"head":[{"id":"gtm:GTM-XXXXXXX","html":"…"}], "bodyStart":[{"id":"gtm:GTM-XXXXXXX","html":"<noscript>…"}]},
  "robots":{"content":"…"}, "sitemap":{"content":"<?xml …"},
  "schema":{"/services/hernia-repair-surgery/":["<script type=\"application/ld+json\">…</script>"]} }
```
`Download publish manifest` (Analytics tab and Publish preview) produces the same file for a manual hand-off.

## What the backend must do

1. **Authorisation**: Admin role only, on every endpoint.
2. **robots.txt / sitemap.xml**: re-validate (never trust the browser): text ≤ 500 KiB for robots; well-formed XML with namespace `http://www.sitemaps.org/schemas/sitemap/0.9`, ≤ 50,000 URLs, ≤ 50 MB for the sitemap. Write atomically to the web root so `https://DOMAIN/robots.txt` and `https://DOMAIN/sitemap.xml` answer with `200`. Keep the previous file as a backup.
3. **JSON-LD**: parse every block with a real JSON parser and re-serialize it (never string-concatenate). Escape `<`, `>`, `&`, U+2028, U+2029 inside the script element. Never execute user-supplied script.
4. **Tracking tags**: use the `html` strings from the manifest only after checking IDs against `^G-[A-Z0-9]{6,12}$`, `^GTM-[A-Z0-9]{4,10}$`, `^[A-Za-z0-9_-]{20,100}$` (Search Console) and `^[A-Fa-f0-9]{16,64}$` (Bing). Place `head` entries inside `<head>` and `bodyStart` entries right after `<body>`. One tag per `id`. Do not add them to the admin panel or the login page.
5. **Sync**: regenerate sitemap and schema from published content whenever a blog or service is published, unpublished or deleted (the panel's "Out of step with content" box shows what would differ).
6. **Do not report success you did not verify.** Search Console / Bing verification is confirmed only by those tools.
