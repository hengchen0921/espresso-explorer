import { buildIndex, matchProduct, parseFeed } from './feed.js'

/**
 * GET /api/products?ids=B0XXXXXXXX,B0YYYYYYYY&names=Bambino|Breville,...
 *   → { "<id>": { imageUrl, price, currency, fetchedAt }, ... }
 *
 * Same contract as `server/product-api/`, different upstream. Amazon's is the
 * cleanest licensing for product images but is gated behind an Associates
 * account with ten qualified sales in the last thirty days — which a new site
 * cannot have, because it needs the images to make the sales. Specialist
 * espresso retailers (Seattle Coffee Gear, Whole Latte Love and similar) run
 * affiliate programmes through Impact, ShareASale and AvantLink, and those
 * networks publish product feeds carrying licensed images. For this catalogue
 * they are both easier to get into and a better subject-matter fit.
 *
 * The feed is fetched once and cached, not fetched per request: these are
 * whole-catalogue files, often several MB, and refreshed daily at best.
 */

const FEED_TTL_MS = 6 * 60 * 60 * 1000
/** Displayed prices should not outlive the affiliate networks' usual daily refresh. */
const PRICE_MAX_AGE_MS = 24 * 60 * 60 * 1000

let feedCache = null

async function getIndex() {
  if (feedCache && Date.now() - feedCache.loadedAt < FEED_TTL_MS) return feedCache.index

  const url = process.env.FEED_URL
  if (!url) throw new Error('FEED_URL is not set')

  const response = await fetch(url, {
    headers: process.env.FEED_AUTH ? { authorization: process.env.FEED_AUTH } : {},
  })
  if (!response.ok) throw new Error(`feed ${response.status}`)

  const index = buildIndex(parseFeed(await response.text()))
  feedCache = { index, loadedAt: Date.now() }
  return index
}

export default async function handler(request, response) {
  const url = new URL(request.url, `https://${request.headers.host ?? 'localhost'}`)

  // `ids` is the provider-neutral name; `asins` is accepted so this endpoint is
  // a drop-in for the Amazon one without a client change.
  const ids = (url.searchParams.get('ids') ?? url.searchParams.get('asins') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 50)

  // A feed keyed only by the retailer's own SKUs cannot be looked up by ASIN,
  // so the client may also pass "name|brand" pairs positionally as a fallback.
  const names = (url.searchParams.get('names') ?? '').split(',').map((v) => v.trim())

  response.setHeader('access-control-allow-origin', process.env.ALLOWED_ORIGIN ?? '*')
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('cache-control', 'public, max-age=3600, s-maxage=21600')

  if (ids.length === 0) {
    response.statusCode = 400
    return response.end(JSON.stringify({ error: 'ids_required' }))
  }

  try {
    const index = await getIndex()
    const fetchedAt = new Date().toISOString()
    const out = {}

    ids.forEach((id, i) => {
      const hit = matchProduct(index, id, names[i] ?? '')
      // Absent means "use the placeholder" to every consumer, never an error.
      if (!hit?.imageUrl) return
      out[id] = {
        imageUrl: hit.imageUrl,
        price: typeof hit.price === 'number' ? hit.price : null,
        currency: hit.currency ?? 'USD',
        fetchedAt,
      }
    })

    response.statusCode = 200
    return response.end(JSON.stringify(out))
  } catch (error) {
    console.error('retailer-feed:', error.message)
    // A dead feed must degrade to placeholders, not to a broken catalogue.
    response.statusCode = 200
    return response.end(JSON.stringify({}))
  }
}

export { PRICE_MAX_AGE_MS }
