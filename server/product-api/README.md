# Product API

A small function that fetches Amazon product images and current prices for a
batch of ASINs. It exists because the site is a static build: Amazon's product
API requires a signed request, and the signing key cannot be shipped to a
browser.

> **⚠️ PA-API 5.0 was retired on 15 May 2026.** The code here signs requests
> with AWS SigV4 for an endpoint that no longer exists. Amazon's replacement is
> the **Creators API**: same product fields including images, but REST with
> OAuth 2.0 instead of SigV4, and PA-API keys do not carry over — you generate
> a new credential pair. Treat `paapi.js` as a reference for the handler shape,
> not as something to deploy.
>
> Eligibility also tightened. It is now a fully accepted Associates account with
> **ten qualified sales in the last thirty days**, not the three-in-180 this
> file used to record. For a site with no traffic that is circular, which is why
> `server/retailer-feed/` exists: affiliate networks publish feeds with licensed
> images and no sales threshold. Start there.

## Why it is not deployed

Three things have to be true before this can run, and none of them are yet:

1. **An approved Amazon Associates account.** Set your tag in
   `src/data/retailers.ts` first.
2. **Creators API credentials.** Issued only to Associates meeting the sales
   threshold above; a brand-new account cannot call the API at all.
3. **Somewhere to run a function.** GitHub Pages serves static files only. Vercel,
   Netlify and Cloudflare Workers all have free tiers that will host this.

Until then the catalogue runs on its own data with generated placeholder images,
and every consumer already handles missing media, so nothing breaks.

## Status of the code

`paapi.js` is written from Amazon's published specification and **has never been
executed** — credentials were not available, and the API it targets has since
been retired. Porting it means replacing `fetchFromAmazon` with a Creators API
call over OAuth 2.0; the handler, cache and response shape do not care which
upstream provides the data, which is the point of keeping them separate.

## Deploying

```bash
# Vercel: move index.js to api/products.js in a project, then
vercel env add AMAZON_ACCESS_KEY
vercel env add AMAZON_SECRET_KEY
vercel env add AMAZON_PARTNER_TAG      # e.g. yourtag-20
vercel deploy --prod
```

Then build the site with the endpoint configured:

```bash
VITE_PRODUCT_API=https://your-function.vercel.app/api/products npm run build
```

That single variable is the whole switch. With it set, `IS_LIVE_PRODUCT_DATA`
becomes true, cards show Amazon's image and Amazon's current price, and the
disclosure copy updates to say prices are live.

## Contract

```
GET /api/products?asins=B0XXXXXXXX,B0YYYYYYYY

200 {
  "B0XXXXXXXX": {
    "imageUrl": "https://m.media-amazon.com/images/I/...jpg",
    "price": 699.95,
    "currency": "USD",
    "fetchedAt": "2026-08-30T02:00:00.000Z"
  }
}
```

Unknown or failed ASINs are simply absent from the response. The client treats
absence as "use the placeholder", never as an error.

Prices are cached for 24 hours, which is also Amazon's maximum permitted age for
a displayed price. Do not raise it.
