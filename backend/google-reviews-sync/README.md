# Google reviews sync (DISHA CMS)

A tiny serverless function that fetches your clinic's Google reviews and hands them to the
**Testimonials** page of the admin panel. New reviews arrive as **New** and are never shown on the
website until you press **Show** and **Publish**.

The Google API key stays here, on the server. Never paste it into the admin panel or website JS.

## 1. Google setup (one time)
1. Open Google Cloud Console → create/select a project → attach a billing account.
2. Enable **Places API (New)** (the legacy Places API is not available for new projects).
3. Create an API key and restrict it to **Places API (New)** (add an IP/HTTP restriction if you can).
4. Find your clinic's **Place ID** with Google's *Place ID Finder*.

## 2. Deploy (Cloudflare Workers, free tier is enough)
```bash
cd backend/google-reviews-sync
# edit wrangler.toml: PLACE_ID and ALLOWED_ORIGINS (the origin the admin panel is served from)
npx wrangler secret put GOOGLE_API_KEY
npx wrangler secret put SYNC_TOKEN        # any long random string
npx wrangler deploy
```
`worker.js` only uses `fetch`/`Request`/`Response`, so it also runs on Vercel Edge, Deno Deploy, etc.

## 3. Connect the admin panel
Testimonials → **Settings**: paste the Place ID, the deployed Worker URL and the same `SYNC_TOKEN`.
Then click **Sync now**. Until the CMS has a real backend/database the reviews are stored in the browser
(like all other content), so sync runs when an admin clicks the button. Once the backend exists, call this
same URL from a scheduled job to sync automatically.

No server yet? Call the Google Place Details endpoint yourself, then use Testimonials → **Import** and paste
the JSON. Both the raw Google response and this function's output are accepted.

## Notes and limits
- Google returns at most **5 reviews per call**. Each sync adds the ones it has not seen before, so over time you
  accumulate more. `LANGUAGES="en,mr,hi"` makes one call per language and may surface additional reviews.
- Show Google reviews with attribution (reviewer name, rating, "Google") and do not edit their text; the
  admin panel locks Google reviews for that reason. Check Google's current terms for display and caching rules.
- Ratings without text are skipped.
- Output shape: `{ name, rating, total, mapsUrl, reviews:[{ id, author, photo, url, rating, text, date }] }`
