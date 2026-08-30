import { fetchFromAmazon, MAX_BATCH } from './paapi.js'

/**
 * GET /api/products?asins=B01N5,B07X9
 *   → { "B01N5": { imageUrl, price, currency, fetchedAt }, ... }
 *
 * Deploy anywhere that runs a Node function (Vercel, Netlify, Cloudflare with
 * nodejs_compat) and point the site's VITE_PRODUCT_API at it. The secret keys
 * live here and never reach a browser, which is the entire reason this exists.
 */

/** Amazon requires displayed prices to be under 24 hours old. */
const TTL_MS = 24 * 60 * 60 * 1000
const cache = new Map()

function cached(asin) {
  const entry = cache.get(asin)
  if (!entry) return undefined
  if (Date.now() - entry.storedAt >= TTL_MS) {
    cache.delete(asin)
    return undefined
  }
  return entry.media
}

export default async function handler(request, response) {
  const url = new URL(request.url, `https://${request.headers.host ?? 'localhost'}`)
  const asins = (url.searchParams.get('asins') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 50)

  // Same-origin is expected; widen only if the site is served from elsewhere.
  response.setHeader('access-control-allow-origin', process.env.ALLOWED_ORIGIN ?? '*')
  response.setHeader('content-type', 'application/json; charset=utf-8')
  // Let the CDN absorb repeat traffic; Amazon rate-limits hard on new accounts.
  response.setHeader('cache-control', 'public, max-age=3600, s-maxage=86400')

  if (asins.length === 0) {
    response.statusCode = 200
    response.end('{}')
    return
  }

  const result = {}
  const missing = []
  for (const asin of asins) {
    const hit = cached(asin)
    if (hit) result[asin] = hit
    else missing.push(asin)
  }

  try {
    for (let i = 0; i < missing.length; i += MAX_BATCH) {
      const batch = missing.slice(i, i + MAX_BATCH)
      const fetched = await fetchFromAmazon(batch)
      const storedAt = Date.now()
      for (const asin of batch) {
        const media = fetched[asin] ?? null
        if (media) {
          cache.set(asin, { media, storedAt })
          result[asin] = media
        }
      }
    }
  } catch (error) {
    // Partial data beats an error page: the client falls back to placeholders
    // for anything missing, so a failed lookup degrades instead of breaking.
    console.error('[product-api]', error)
  }

  response.statusCode = 200
  response.end(JSON.stringify(result))
}
