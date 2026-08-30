import type { Machine } from './types'

/**
 * Retailer links.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TO EARN COMMISSION, PUT YOUR REAL IDS IN `AFFILIATE_TAGS` BELOW.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Two deliberate choices:
 *
 * 1. Links are built from *search* queries rather than hard-coded product ids.
 *    An invented ASIN does not 404 — it silently points at a different product,
 *    which is worse than no link at all. A search for the brand, model and part
 *    number resolves correctly today and keeps working when a retailer changes
 *    its URLs. Replace them with direct product URLs in `DIRECT_URLS` as you
 *    verify each one.
 *
 * 2. Whether a link is disclosed as affiliate is derived from whether a tag is
 *    actually set, not from a separate flag. The disclosure therefore cannot
 *    drift out of step with reality: no tag, no commission, no claim of one.
 */

/** Your affiliate identifiers. Empty string = plain, uncompensated link. */
export const AFFILIATE_TAGS: Record<RetailerId, string> = {
  amazon: '',
}

export type RetailerId = 'amazon'

interface Retailer {
  id: RetailerId
  name: string
  /** Shown under the button so the destination is never a surprise. */
  note: string
  /** Query-based fallback used when no direct URL has been supplied. */
  search: (query: string, tag: string) => string
}

const RETAILERS: Retailer[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    note: 'Searches for the exact model',
    search: (query, tag) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(query)}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`,
  },
]

/**
 * Verified direct product URLs, by machine id then retailer id. Anything listed
 * here wins over the generated search link. Add your affiliate tag to the URL
 * itself when you paste it in.
 *
 *   'breville-barista-express': { amazon: 'https://www.amazon.com/dp/XXXXXXXXXX?tag=yourtag-20' },
 */
export const DIRECT_URLS: Partial<Record<string, Partial<Record<RetailerId, string>>>> = {}

export interface RetailerLink {
  id: RetailerId
  name: string
  note: string
  url: string
  /** True when this specific link carries a tag and therefore earns commission. */
  sponsored: boolean
}

export function retailerLinksFor(machine: Machine): RetailerLink[] {
  const query = `${machine.brand} ${machine.name} ${machine.modelCode}`

  return RETAILERS.map((retailer) => {
    const tag = AFFILIATE_TAGS[retailer.id] ?? ''
    const direct = DIRECT_URLS[machine.id]?.[retailer.id]

    return {
      id: retailer.id,
      name: retailer.name,
      note: direct ? 'Direct product page' : retailer.note,
      url: direct ?? retailer.search(query, tag),
      // A direct URL is assumed to carry its own tag; a generated one is
      // sponsored only if a tag was actually applied to it.
      sponsored: direct ? Boolean(tag) : Boolean(tag),
    }
  })
}

/**
 * Required verbatim by the Amazon Associates Operating Agreement wherever
 * Amazon links appear. Do not reword it.
 */
export const AMAZON_REQUIRED_DISCLOSURE =
  'As an Amazon Associate I earn from qualifying purchases.'

/** True when any link anywhere on the site can earn commission. */
export const HAS_AFFILIATE_LINKS = Object.values(AFFILIATE_TAGS).some((tag) => tag.length > 0)
