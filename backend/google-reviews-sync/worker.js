/**
 * DISHA CMS – Google reviews sync function (Cloudflare Workers / any fetch-style runtime)
 *
 * Calls Google Places API (New) "Place Details" for your clinic and returns the
 * reviews in the simple JSON shape the Testimonials page understands.
 * The Google API key lives ONLY here (as a secret), never in the admin panel.
 *
 * Secrets / variables (see README.md):
 *   GOOGLE_API_KEY   (secret)   Google Cloud API key with Places API (New) enabled
 *   PLACE_ID         (variable) Your clinic's Google Place ID
 *   SYNC_TOKEN       (secret)   Optional shared secret; the admin panel sends it as X-Sync-Token
 *   ALLOWED_ORIGINS  (variable) Comma separated admin panel origins, e.g. https://admin.example.com
 *   LANGUAGES        (variable) Optional, e.g. "en,mr,hi" (one Google call per language)
 */
const FIELDS = 'id,displayName,rating,userRatingCount,googleMapsUri,reviews';

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, max-age=300', ...headers },
  });

async function fetchPlace(env, lang) {
  const url = 'https://places.googleapis.com/v1/places/' + encodeURIComponent(env.PLACE_ID) + '?languageCode=' + encodeURIComponent(lang);
  const res = await fetch(url, { headers: { 'X-Goog-Api-Key': env.GOOGLE_API_KEY, 'X-Goog-FieldMask': FIELDS } });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).error?.message || ''; } catch (_) {}
    const err = new Error('Google API error ' + res.status + (detail ? ': ' + detail : ''));
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export function normalize(places) {
  const first = places[0] || {};
  const seen = new Set();
  const reviews = [];
  for (const p of places) {
    for (const r of p.reviews || []) {
      if (!r.name || seen.has(r.name)) continue;
      seen.add(r.name);
      reviews.push({
        id: r.name, // places/PLACE_ID/reviews/REVIEW_ID – stable, used to avoid duplicates
        author: r.authorAttribution?.displayName || 'Google user',
        photo: r.authorAttribution?.photoUri || '',
        url: r.authorAttribution?.uri || '',
        rating: r.rating || 0,
        text: (r.originalText?.text || r.text?.text || '').trim(),
        date: r.publishTime || '',
      });
    }
  }
  return {
    name: first.displayName?.text || '',
    rating: first.rating || 0,
    total: first.userRatingCount || 0,
    mapsUrl: first.googleMapsUri || '',
    reviews,
  };
}

export default {
  async fetch(req, env) {
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || 'null',
      'Access-Control-Allow-Headers': 'X-Sync-Token',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      Vary: 'Origin',
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405, cors);
    if (env.SYNC_TOKEN && req.headers.get('X-Sync-Token') !== env.SYNC_TOKEN) return json({ error: 'Unauthorized' }, 401, cors);
    if (!env.GOOGLE_API_KEY || !env.PLACE_ID) return json({ error: 'Sync function is not configured (GOOGLE_API_KEY / PLACE_ID).' }, 500, cors);

    const langs = (env.LANGUAGES || 'en').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5);
    try {
      const places = await Promise.all(langs.map((l) => fetchPlace(env, l)));
      return json(normalize(places), 200, cors);
    } catch (e) {
      return json({ error: e.message }, 502, cors);
    }
  },
};
