# Retailer feed API

Serves the same contract as `server/product-api/`, from an affiliate network's
product feed instead of Amazon.

## Why this exists

Amazon is the cleanest licensing for product images, and `server/product-api/`
is written for it. It is also gated: you need a fully accepted Associates
account with **ten qualified sales in the last thirty days**. That is circular
for a new site — the images are part of what earns the sales.

Specialist espresso retailers solve the same problem without the circularity.
Seattle Coffee Gear, Whole Latte Love and similar run affiliate programmes
through Impact, ShareASale and AvantLink, and those networks publish product
feeds carrying licensed images, prices and availability. For this catalogue
they are both easier to join and a better subject-matter fit than a
general-purpose marketplace.

## Contract

```
GET /api/products?ids=SCG-BAM-450,SCG-GAG-CP&names=Bambino|Breville,Classic Pro|Gaggia

200 { "SCG-BAM-450": { "imageUrl": "...", "price": 299.95, "currency": "USD", "fetchedAt": "..." } }
```

`asins=` is accepted as a synonym for `ids=`, so this is a drop-in replacement
for the Amazon endpoint with no client change. Products with no match are
absent from the response; `ProductImage` treats absence as "use the
placeholder", never as an error. A dead or unreachable feed returns `{}` with
a 200 for the same reason — a broken upstream must degrade to the generated
drawings, not to a broken catalogue.

## Matching

**Identifier first, name second.** `names` is a positional fallback for feeds
keyed only by the retailer's own SKUs, where an ASIN lookup cannot work.

**The current client does not send `names`.** `src/catalog/amazon.ts` batches by
identifier alone, so today a SKU-keyed feed matches nothing. Either put the
retailer's SKU in each product's `asin` field (the field is an opaque key
downstream — nothing parses it as an ASIN), or widen the batching layer to
carry name and brand alongside the id. The first is a data edit; the second is
a real change to `flush()` and `useProductMedia`. Pick before you buy a feed.

Name matching is deliberately strict — full normalised `brand + name`, then
normalised `name`, and nothing looser. Two machines in a range differ by one
word ("Bambino" and "Bambino Plus"), and a fuzzy match puts the wrong picture
on a card. That is worse than no picture, because nothing looks broken.

## Parsing

`parseFeed` takes JSON or CSV; `feed.js` lists the column spellings the
networks use. Add to those arrays rather than writing a second parser.

The CSV parser handles quoted fields, escaped quotes and embedded commas,
which is not optional here: product names contain commas constantly
("Bambino, Stainless Steel"), and a naive `split(',')` silently shifts every
later column — you get prices in the currency field and no error anywhere.

```bash
node server/retailer-feed/feed.test.mjs   # 12 checks, no runner required
```

## Deploying

```bash
# Vercel: move index.js and feed.js to api/ in a project, then
vercel env add FEED_URL          # the network's feed endpoint
vercel env add FEED_AUTH         # Authorization header value, if the feed needs one
vercel env add ALLOWED_ORIGIN
vercel deploy --prod
```

Then point the site at it — the same variable either provider uses:

```bash
VITE_PRODUCT_API=https://your-function.vercel.app/api/products npm run build
```

The feed is fetched once and cached for six hours, not fetched per request:
these are whole-catalogue files, often several megabytes, refreshed daily at
best.

## Before you ship images

Read the network's terms. Most permit displaying feed images only while you
are an active affiliate for that merchant, require the click-through to carry
your tracking link, and forbid caching the image bytes on your own origin.
Hotlinking the CDN URL as this does is normally the required behaviour rather
than the lazy one.
