# Live website integration (what must exist on the real site)

The website copy in `assets/site/` is static HTML. Today its JSON-LD is written into each page. To make the admin panel the source of truth:

| Item | Where it must appear | Source |
|---|---|---|
| JSON-LD | `<head>` of each page, one `<script type="application/ld+json">` per block, no duplicates | `manifest.schema[path]` |
| Google Analytics / GTM / Search Console / Bing | `<head>` (and GTM noscript right after `<body>`) of **public** pages only | `manifest.tracking` |
| robots.txt | `https://DOMAIN/robots.txt` | `manifest.robots.content` |
| sitemap.xml | `https://DOMAIN/sitemap.xml` | `manifest.sitemap.content` |

**Duplicate prevention.** When the server injects schema from the manifest, it must first remove the schema blocks that are hard-coded in the page (they are imported unchanged into the Schema tab as "Existing on website", so no information is lost). One block per type per page.

**Domain.** The site and the manifest use the placeholder `https://www.dishaclinic.example` until Website Settings › Site URL is set. The panel warns on every screen until then.

**Status today.** Local mode only. The live website, robots.txt, sitemap.xml, tracking tags and Search Console / Bing verification are **not** changed by the admin panel until the backend in `SEO-API.md` is connected.
