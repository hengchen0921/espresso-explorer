/**
 * Affiliate product feeds, normalised.
 *
 * Every network publishes a different shape — Impact and AvantLink lean CSV,
 * ShareASale offers both — but they all carry the same four things this site
 * needs: an identifier, a name, a price and an image URL. The column names
 * below cover the common spellings; add to them rather than writing a second
 * parser per network.
 */

const IMAGE_KEYS = ['image_url', 'imageurl', 'large_image', 'image', 'imagelarge', 'thumbnail']
const PRICE_KEYS = ['price', 'sale_price', 'saleprice', 'retail_price', 'current_price']
const NAME_KEYS = ['name', 'product_name', 'productname', 'title']
const BRAND_KEYS = ['brand', 'manufacturer', 'merchant_brand']
const ID_KEYS = ['asin', 'sku', 'id', 'product_id', 'productid', 'mpn', 'upc']

export function parseFeed(text) {
  const trimmed = text.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const data = JSON.parse(trimmed)
    const rows = Array.isArray(data) ? data : (data.products ?? data.items ?? [])
    return rows.map(lowerKeys)
  }
  return parseCsv(trimmed)
}

function lowerKeys(row) {
  const out = {}
  for (const [key, value] of Object.entries(row)) out[key.toLowerCase().trim()] = value
  return out
}

/**
 * Minimal RFC-4180 CSV: quoted fields, escaped quotes, embedded newlines and
 * commas. Product names contain commas constantly ("Bambino, Stainless"), so
 * a naive split on `,` silently shifts every later column.
 */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else quoted = false
      } else field += char
      continue
    }

    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += char
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows
  if (!header) return []
  const keys = header.map((h) => h.toLowerCase().trim())
  return body
    .filter((cells) => cells.length >= keys.length - 1)
    .map((cells) => Object.fromEntries(keys.map((key, i) => [key, cells[i] ?? ''])))
}

function pick(row, keys) {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value)
  }
  return ''
}

function toPrice(raw) {
  // Feeds quote prices as "1,299.00", "$499", "499.00 USD".
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const value = Number.parseFloat(cleaned)
  return Number.isFinite(value) ? value : null
}

/** Lowercase alphanumerics only, so "Bambino Plus" matches "bambino-plus". */
export function normalise(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function buildIndex(rows) {
  const byId = new Map()
  const byName = new Map()

  for (const row of rows) {
    const imageUrl = pick(row, IMAGE_KEYS)
    if (!imageUrl) continue

    const entry = {
      imageUrl,
      price: toPrice(pick(row, PRICE_KEYS)),
      currency: pick(row, ['currency']) || 'USD',
    }

    for (const key of ID_KEYS) {
      const id = pick(row, [key])
      // First writer wins: feeds repeat a product per variant, and the first
      // row is the parent listing rather than a colour or bundle.
      if (id && !byId.has(id)) byId.set(id, entry)
    }

    const name = pick(row, NAME_KEYS)
    if (name) {
      const brand = pick(row, BRAND_KEYS)
      const composite = normalise(`${brand}${name}`)
      if (!byName.has(composite)) byName.set(composite, entry)
      const bare = normalise(name)
      if (!byName.has(bare)) byName.set(bare, entry)
    }
  }

  return { byId, byName }
}

/**
 * Identifier first, then name. Name matching is a fallback rather than the
 * primary path on purpose: two machines in a range differ by one word, and a
 * loose match puts the wrong picture on a card — which is worse than no
 * picture, because nothing looks broken.
 */
export function matchProduct(index, id, nameAndBrand) {
  if (id && index.byId.has(id)) return index.byId.get(id)
  if (!nameAndBrand) return null

  const [name = '', brand = ''] = nameAndBrand.split('|')
  return (
    index.byName.get(normalise(`${brand}${name}`)) ?? index.byName.get(normalise(name)) ?? null
  )
}
