import { createHash, createHmac } from 'node:crypto'

/**
 * Amazon Product Advertising API 5.0 — GetItems.
 *
 * ── Status: written from the published specification, never executed ─────────
 * PA-API credentials are only issued to Associates who have already made
 * qualifying sales, so this could not be run end to end before shipping. Treat
 * it as a starting point to verify, not as known-good code. The signing is the
 * part most likely to need adjusting; `SIGNING NOTE` below marks where.
 *
 * On the "Creators API": Amazon runs a Creators/Influencer programme, but I
 * could not confirm that it exposes a product-data API that supersedes PA-API.
 * If it does, only `fetchFromAmazon` needs replacing — the handler, cache and
 * response shape are provider-agnostic.
 */

const SERVICE = 'ProductAdvertisingAPI'
const REGION = process.env.AMAZON_REGION ?? 'us-east-1'
const HOST = process.env.AMAZON_HOST ?? 'webservices.amazon.com'
const MARKETPLACE = process.env.AMAZON_MARKETPLACE ?? 'www.amazon.com'
const PATH = '/paapi5/getitems'
const TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'

const hash = (value) => createHash('sha256').update(value, 'utf8').digest('hex')
const hmac = (key, value) => createHmac('sha256', key).update(value, 'utf8').digest()

function signingKey(secret, date) {
  return hmac(hmac(hmac(hmac(`AWS4${secret}`, date), REGION), SERVICE), 'aws4_request')
}

/** SIGNING NOTE: canonical request must match Amazon's byte for byte. */
function sign({ accessKey, secretKey, body, amzDate, dateStamp }) {
  const headers = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    host: HOST,
    'x-amz-date': amzDate,
    'x-amz-target': TARGET,
  }

  const signedHeaders = Object.keys(headers).sort().join(';')
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key}:${headers[key]}\n`)
    .join('')

  const canonicalRequest = [
    'POST',
    PATH,
    '',
    canonicalHeaders,
    signedHeaders,
    hash(body),
  ].join('\n')

  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, hash(canonicalRequest)].join('\n')
  const signature = hmac(signingKey(secretKey, dateStamp), toSign).toString('hex')

  return {
    ...headers,
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  }
}

/** GetItems accepts at most ten ASINs per call. */
export const MAX_BATCH = 10

export async function fetchFromAmazon(asins) {
  const accessKey = process.env.AMAZON_ACCESS_KEY
  const secretKey = process.env.AMAZON_SECRET_KEY
  const partnerTag = process.env.AMAZON_PARTNER_TAG

  if (!accessKey || !secretKey || !partnerTag) {
    throw new Error('AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY and AMAZON_PARTNER_TAG are required')
  }

  const body = JSON.stringify({
    ItemIds: asins.slice(0, MAX_BATCH),
    ItemIdType: 'ASIN',
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Marketplace: MARKETPLACE,
    Resources: ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price'],
  })

  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const headers = sign({ accessKey, secretKey, body, amzDate, dateStamp })

  const response = await fetch(`https://${HOST}${PATH}`, { method: 'POST', headers, body })
  if (!response.ok) {
    throw new Error(`PA-API ${response.status}: ${await response.text()}`)
  }

  const payload = await response.json()
  const fetchedAt = new Date().toISOString()
  const out = {}

  for (const item of payload?.ItemsResult?.Items ?? []) {
    out[item.ASIN] = {
      imageUrl: item?.Images?.Primary?.Large?.URL ?? null,
      price: item?.Offers?.Listings?.[0]?.Price?.Amount ?? null,
      currency: item?.Offers?.Listings?.[0]?.Price?.Currency ?? 'USD',
      fetchedAt,
    }
  }

  return out
}
