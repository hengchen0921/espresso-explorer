import { parseFeed, buildIndex, matchProduct, parseCsv } from './feed.js'

const csv = `SKU,Product_Name,Brand,Price,Image_URL,Currency
SCG-BAM-450,"Bambino, Stainless Steel",Breville,"299.95",https://cdn.example/bambino.jpg,USD
SCG-BAM-500,Bambino Plus,Breville,"$499.95",https://cdn.example/bambino-plus.jpg,USD
SCG-GAG-CP,Classic Pro,Gaggia,"449.00",https://cdn.example/gaggia.jpg,USD
SCG-NOIMG,No Image Product,Acme,"9.99",,USD
`
const rows = parseCsv(csv)
const index = buildIndex(parseFeed(csv))

const checks = [
  ['comma inside quoted name survives', rows[0]['product_name'] === 'Bambino, Stainless Steel'],
  ['column alignment held after that comma', rows[0]['brand'] === 'Breville'],
  ['currency column is last and intact', rows[0]['currency'] === 'USD'],
  ['match by SKU', matchProduct(index, 'SCG-BAM-450', '')?.imageUrl === 'https://cdn.example/bambino.jpg'],
  ['price parsed from bare number', matchProduct(index, 'SCG-BAM-450', '')?.price === 299.95],
  ['price parsed with $ prefix', matchProduct(index, 'SCG-BAM-500', '')?.price === 499.95],
  ['match by name|brand fallback', matchProduct(index, 'UNKNOWN', 'Bambino Plus|Breville')?.imageUrl === 'https://cdn.example/bambino-plus.jpg'],
  ['sibling models do NOT collide', matchProduct(index, 'x', 'Bambino Plus|Breville')?.imageUrl !== matchProduct(index, 'SCG-BAM-450', '')?.imageUrl],
  ['row with no image is skipped', matchProduct(index, 'SCG-NOIMG', '') === null],
  ['unknown id with no name returns null', matchProduct(index, 'NOPE', '') === null],
]

// JSON feeds take the same path.
const json = JSON.stringify({ products: [{ asin: 'B07', title: 'Silvia', brand: 'Rancilio', price: '895.00', image: 'https://cdn.example/silvia.jpg' }] })
const ji = buildIndex(parseFeed(json))
checks.push(['json feed, match by asin', matchProduct(ji, 'B07', '')?.imageUrl === 'https://cdn.example/silvia.jpg'])
checks.push(['json feed, title key recognised', matchProduct(ji, 'x', 'Silvia|Rancilio')?.price === 895])

let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}`)
  if (!ok) failed++
}
console.log(`\n${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
