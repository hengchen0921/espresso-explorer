import { getMachine } from '@/data'
import { MachinePortrait } from '@/components/MachinePortrait'
import { cx } from '@/lib/format'
import { useProductMedia } from './amazon'
import { CategoryGlyph } from './CategoryGlyph'
import type { CatalogProduct } from './types'

/**
 * A product's picture, in strict order of preference:
 *
 *   1. Amazon's own image, once a live provider and a verified ASIN exist.
 *   2. The generated 3D-derived portrait, for the flagship machines.
 *   3. A category glyph.
 *
 * The fallbacks are not an error path — with no ASINs and no backend they are
 * the normal case, so the component is built so the layout is identical either
 * way and nothing shifts when live data does arrive.
 */
export function ProductImage({
  product,
  className,
}: {
  product: CatalogProduct
  className?: string
}) {
  const { media, state } = useProductMedia(product.asin)
  const flagship = product.flagshipId ? getMachine(product.flagshipId) : undefined

  return (
    <div
      className={cx(
        'relative w-full overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,#fffdf9_0%,#f2ece1_100%)]',
        className,
      )}
    >
      {media?.imageUrl ? (
        <img
          src={media.imageUrl}
          alt={`${product.brand} ${product.name}`}
          loading="lazy"
          className="animate-fade absolute inset-0 h-full w-full object-contain p-5"
        />
      ) : flagship ? (
        <div className="absolute inset-0 p-4">
          <MachinePortrait machine={flagship} className="h-full" />
        </div>
      ) : (
        <div
          className={cx(
            'absolute inset-0 transition-opacity duration-500',
            state === 'loading' ? 'opacity-40' : 'opacity-100',
          )}
        >
          <CategoryGlyph category={product.category} />
        </div>
      )}
    </div>
  )
}
