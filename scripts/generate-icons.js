import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

/**
 * Home-screen icons, drawn rather than sourced.
 *
 * The site has no image assets on purpose — every machine and every product
 * drawing is generated — and app icons are not an exception worth making. The
 * mark below is the same one in `public/favicon.svg`, re-laid-out here at the
 * two proportions a home screen actually needs, then rasterised at build time.
 * The PNGs are gitignored; `prebuild` regenerates them, including in CI.
 *
 * Two versions matter, and treating them as one is the usual mistake:
 *
 * - **Standard** fills the square. iOS applies its own rounded mask on top, so
 *   the icon must NOT carry its own rounded corners or it gets double-rounded.
 *   (This is why the favicon's `rx="7"` is dropped here.)
 * - **Maskable** is cropped by Android to whatever shape the launcher uses, and
 *   may lose the outer 20% on every side. The mark is scaled to sit inside that
 *   safe zone, which is why it looks too small in the flat file and correct on
 *   a phone.
 */

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', 'public', 'icons')

const GROUND = '#17120F'
const COPPER = '#C15A2B'
const LINEN = '#EFE7DA'

/** The cup, from favicon.svg, in a 32×32 field. */
const MARK = `
  <path d="M9 8h11a5 5 0 0 1 0 10h-1v1a5 5 0 0 1-5 5h-0a5 5 0 0 1-5-5V8Z"
        fill="none" stroke="${COPPER}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M19 10h1a3 3 0 0 1 0 6h-1" fill="none" stroke="${COPPER}" stroke-width="2.2"/>
  <rect x="7" y="25" width="16" height="2.4" rx="1.2" fill="${LINEN}"/>
`

/** `scale` is about the mark's own centre, so padding grows evenly. */
function icon(scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${GROUND}"/>
  <g transform="translate(16 17.5) scale(${scale}) translate(-16 -17.5)">${MARK}</g>
</svg>`
}

const TARGETS = [
  // Standard: the mark as drawn, edge to edge.
  { file: 'pwa-192.png', size: 192, scale: 1 },
  { file: 'pwa-512.png', size: 512, scale: 1 },
  // Maskable: pulled in to survive an aggressive launcher crop.
  { file: 'pwa-maskable-512.png', size: 512, scale: 0.68 },
  // iOS reads this one, and never renders transparency — hence the solid ground.
  { file: 'apple-touch-icon.png', size: 180, scale: 1 },
]

await mkdir(OUT, { recursive: true })

for (const { file, size, scale } of TARGETS) {
  const png = await sharp(Buffer.from(icon(scale)), { density: 512 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()
  await writeFile(join(OUT, file), png)
  console.log(`icons: ${file} (${size}x${size}, ${(png.length / 1024).toFixed(1)} kB)`)
}
