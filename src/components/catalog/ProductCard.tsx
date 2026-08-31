import { Link } from 'react-router-dom'
import { amazonLinkFor, HAS_AFFILIATE_LINKS, linkRel } from '@/data/retailers'
import { useProductMedia } from '@/catalog/amazon'
import { ProductImage } from '@/catalog/ProductImage'
import type { CatalogProduct } from '@/catalog/types'
import { cx, formatPrice } from '@/lib/format'
import { ArrowGlyph } from '@/components/ui/Button'

/**
 * A catalogue card. Flagship machines get a route into their 3D teardown; every
 * other product is a plain card with an affiliate link, which is the whole
 * distinction between the two halves of the catalogue.
 */
export function ProductCard({ product }: { product: CatalogProduct }) {
  const { media } = useProductMedia(product.asin)
  const link = amazonLinkFor({
    asin: product.asin,
    query: `${product.brand} ${product.name}`,
  })

  // Amazon's own price wins when we have it; ours is only ever an estimate.
  const livePrice = media?.price ?? null

  return (
    <article
      className={cx(
        'group relative flex flex-col border border-ink/10 bg-surface',
        'transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_22px_50px_-32px_rgba(23,18,15,0.5)]',
      )}
    >
      <ProductImage product={product} className="h-[190px]" />

      {product.flagshipId && (
        <span className="absolute left-4 top-4 rounded-full bg-stage px-2.5 py-1 label text-linen">
          3D teardown
        </span>
      )}

      <div className="flex flex-1 flex-col gap-4 border-t border-ink/10 p-5">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow truncate">{product.brand}</p>
            <p className="shrink-0 numeric text-[0.8rem] text-ink">
              {formatPrice(livePrice ?? product.price)}
            </p>
          </div>
          <h3 className="mt-1.5 text-[1.08rem] leading-[1.15]">
            {product.flagshipId ? (
              <Link
                to={`/machines/${product.flagshipId}`}
                className="after:absolute after:inset-0 after:content-['']"
              >
                {product.name}
              </Link>
            ) : (
              product.name
            )}
          </h3>
          <p className="mt-2 text-[0.86rem] leading-[1.55] text-ash">{product.summary}</p>
        </div>

        <dl className="space-y-1">
          {product.specs.slice(0, 3).map((spec) => (
            <div key={spec.label} className="flex justify-between gap-3">
              <dt className="label text-mist">
                {spec.label}
              </dt>
              <dd className="truncate numeric text-[0.72rem] text-stone">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <a
            href={link.url}
            target="_blank"
            rel={linkRel(link.sponsored)}
            className="relative z-10 inline-flex items-center gap-1.5 label text-copper transition-colors hover:text-copper-deep"
          >
            View on Amazon
            <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3">
              <path
                d="M5 11 11 5M11 5H6.2M11 5v4.8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sr-only">
              {HAS_AFFILIATE_LINKS ? ', affiliate link' : ''}, opens in a new tab
            </span>
          </a>

          {product.flagshipId && (
            <ArrowGlyph className="text-stone group-hover:translate-x-1 group-hover:text-copper" />
          )}
        </div>
      </div>
    </article>
  )
}
