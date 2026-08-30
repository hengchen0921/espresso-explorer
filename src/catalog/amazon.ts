import { useEffect, useState } from 'react'

/**
 * Live product data (image, current price) keyed by ASIN.
 *
 * ── Why this is a seam and not a direct integration ──────────────────────────
 *
 * Amazon's product data APIs require a request signed with a secret key. That
 * key can never be shipped to a browser, so the fetch has to happen on a server
 * — and this site is a static build with no server. `server/product-api/` holds
 * a reference implementation to deploy when there is somewhere to deploy it.
 *
 * Access is also gated: the Product Advertising API is issued to Associates who
 * have already made qualifying sales, so a brand-new account cannot call it at
 * all. Until then the catalogue runs on the static provider below, which is why
 * every consumer must handle `null` media rather than assume an image exists.
 *
 * Point `VITE_PRODUCT_API` at a deployed endpoint and the whole catalogue
 * switches to live data with no other change.
 */

export interface ProductMedia {
  imageUrl: string | null
  /** Amazon's current price, in dollars. Never the catalogue's own estimate. */
  price: number | null
  currency: string
  /** ISO timestamp, used to honour the 24-hour freshness requirement. */
  fetchedAt: string
}

export interface ProductDataProvider {
  id: string
  /** Batched deliberately: one request per screen, not one per card. */
  fetchMany(asins: string[]): Promise<Record<string, ProductMedia>>
}

/** Amazon requires displayed prices to be no more than 24 hours old. */
const TTL_MS = 24 * 60 * 60 * 1000
const CACHE_KEY = 'espresso-explorer:product-media'
/** GetItems accepts at most ten ASINs per call. */
const MAX_BATCH = 10

type CacheEntry = { media: ProductMedia | null; storedAt: number }

const memory = new Map<string, CacheEntry>()

function loadPersisted() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>
    const now = Date.now()
    for (const [asin, entry] of Object.entries(parsed)) {
      if (now - entry.storedAt < TTL_MS) memory.set(asin, entry)
    }
  } catch {
    // Corrupt or unavailable storage just means a cold cache.
  }
}
loadPersisted()

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(memory)))
  } catch {
    // Quota or private mode; the in-memory cache still works for this session.
  }
}

function readCache(asin: string): CacheEntry | undefined {
  const entry = memory.get(asin)
  if (!entry) return undefined
  if (Date.now() - entry.storedAt >= TTL_MS) {
    memory.delete(asin)
    return undefined
  }
  return entry
}

/** Nothing configured: the catalogue renders from its own data and placeholders. */
const staticProvider: ProductDataProvider = {
  id: 'static',
  async fetchMany() {
    return {}
  },
}

function endpointProvider(endpoint: string): ProductDataProvider {
  return {
    id: 'endpoint',
    async fetchMany(asins) {
      const url = `${endpoint}?asins=${encodeURIComponent(asins.join(','))}`
      const response = await fetch(url, { headers: { accept: 'application/json' } })
      if (!response.ok) throw new Error(`product api ${response.status}`)
      return (await response.json()) as Record<string, ProductMedia>
    },
  }
}

const endpoint = import.meta.env.VITE_PRODUCT_API as string | undefined

export const provider: ProductDataProvider = endpoint
  ? endpointProvider(endpoint)
  : staticProvider

export const IS_LIVE_PRODUCT_DATA = provider.id !== 'static'

// ─────────────────────────────────────────────────────────── batching ──
// Cards mount independently, so requests are collected across a microtask and
// sent as one call. Without this a 70-product page would fire 70 requests.

let pending = new Set<string>()
let flushing: Promise<void> | null = null
const waiters = new Set<() => void>()

function notify() {
  waiters.forEach((listener) => listener())
}

async function flush() {
  const asins = [...pending]
  pending = new Set()
  flushing = null
  if (asins.length === 0) return

  for (let i = 0; i < asins.length; i += MAX_BATCH) {
    const batch = asins.slice(i, i + MAX_BATCH)
    try {
      const result = await provider.fetchMany(batch)
      const storedAt = Date.now()
      for (const asin of batch) {
        memory.set(asin, { media: result[asin] ?? null, storedAt })
      }
    } catch {
      // A failed lookup is cached as "unavailable" for this session so the page
      // falls back to placeholders instead of retrying on every render.
      const storedAt = Date.now()
      for (const asin of batch) memory.set(asin, { media: null, storedAt })
    }
  }

  persist()
  notify()
}

function request(asin: string) {
  if (readCache(asin) || pending.has(asin)) return
  pending.add(asin)
  flushing ??= Promise.resolve().then(flush)
}

export type MediaState = 'unavailable' | 'loading' | 'ready'

/**
 * Media for one ASIN. Returns `unavailable` immediately when there is no ASIN
 * or no live provider, so cards render their placeholder on the first paint
 * with no spinner and no layout shift.
 */
export function useProductMedia(asin: string | null): {
  media: ProductMedia | null
  state: MediaState
} {
  const [, bump] = useState(0)

  useEffect(() => {
    if (!asin || !IS_LIVE_PRODUCT_DATA) return
    const listener = () => bump((n) => n + 1)
    waiters.add(listener)
    request(asin)
    return () => {
      waiters.delete(listener)
    }
  }, [asin])

  if (!asin || !IS_LIVE_PRODUCT_DATA) return { media: null, state: 'unavailable' }

  const cached = readCache(asin)
  if (!cached) return { media: null, state: 'loading' }
  return { media: cached.media, state: cached.media ? 'ready' : 'unavailable' }
}
