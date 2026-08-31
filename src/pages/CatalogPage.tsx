import { useMemo, useState } from 'react'
import {
  brandsFor,
  catalog,
  CATALOG_CATEGORIES,
  DEFAULT_FILTERS,
  filterCatalog,
  type CatalogCategory,
  type CatalogFilters,
  type CatalogSort,
} from '@/catalog'
import { IS_LIVE_PRODUCT_DATA } from '@/catalog/amazon'
import { AMAZON_REQUIRED_DISCLOSURE, HAS_AFFILIATE_LINKS } from '@/data/retailers'
import { cx, formatPrice } from '@/lib/format'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

const PRICE_STEPS = [50, 150, 400, 1000] as const

const SORTS: Array<{ id: CatalogSort; label: string }> = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price ↑' },
  { id: 'price-desc', label: 'Price ↓' },
  { id: 'name', label: 'A–Z' },
]

export function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS)

  const brands = useMemo(() => brandsFor(filters.category), [filters.category])
  const results = useMemo(() => filterCatalog(catalog, filters), [filters])

  const update = (patch: Partial<CatalogFilters>) =>
    setFilters((current) => {
      const next = { ...current, ...patch }
      // A brand that does not exist in the new category would strand the grid.
      if (patch.category && next.brand !== 'All' && !brandsFor(next.category).includes(next.brand)) {
        next.brand = 'All'
      }
      return next
    })

  const isFiltered =
    filters.category !== 'All' || filters.brand !== 'All' || filters.maxPrice !== null

  return (
    <>
      <Container className="pt-8 md:pt-12">
        <div className="border-b border-ink/12 pb-8">
          <p className="eyebrow">The catalogue</p>
          <h1 className="mt-6 max-w-[20ch] text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[0.96] tracking-[-0.03em]">
            Everything else you need.
          </h1>
          <p className="mt-6 max-w-[64ch] text-[1.02rem] leading-[1.72] text-ash">
            {catalog.length} products across six categories — machines, grinders, beans and every
            brewer that is not an espresso machine. The eight flagship machines carry a full 3D
            teardown; everything else is here as a straight recommendation.
          </p>
        </div>
      </Container>

      {/* --------------------------------------------------------------- Filters */}
      <Container className="mt-10">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            {(['All', ...CATALOG_CATEGORIES] as const).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => update({ category: category as CatalogCategory | 'All' })}
                aria-pressed={filters.category === category}
                className={cx(
                  'rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-300',
                  filters.category === category
                    ? 'border-ink bg-stage text-linen'
                    : 'border-ink/15 text-stone hover:border-copper hover:text-copper',
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <label className="flex items-center gap-2.5">
              <span className="eyebrow">Brand</span>
              <select
                value={filters.brand}
                onChange={(event) => update({ brand: event.target.value })}
                className="rounded-full border border-ink/15 bg-transparent px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-copper focus-visible:border-copper"
              >
                <option value="All">All brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="eyebrow mr-1">Under</span>
              {PRICE_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() =>
                    update({ maxPrice: filters.maxPrice === step ? null : step })
                  }
                  aria-pressed={filters.maxPrice === step}
                  className={cx(
                    'rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] transition-all duration-300',
                    filters.maxPrice === step
                      ? 'border-copper bg-copper text-linen'
                      : 'border-ink/15 text-stone hover:border-copper hover:text-copper',
                  )}
                >
                  ${step}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="eyebrow mr-1">Sort</span>
              {SORTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => update({ sort: option.id })}
                  aria-pressed={filters.sort === option.id}
                  className={cx(
                    'rounded-full px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300',
                    filters.sort === option.id
                      ? 'text-ink underline decoration-copper underline-offset-4'
                      : 'text-stone hover:text-copper',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hairline flex flex-wrap items-center justify-between gap-4 pt-4">
            <p className="eyebrow">
              {results.length} of {catalog.length} products
              {filters.maxPrice !== null && ` · under ${formatPrice(filters.maxPrice)}`}
            </p>
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </Container>

      {/* ---------------------------------------------------------------- Results */}
      <Container wide className="mt-8">
        {results.length === 0 ? (
          <div className="grid place-items-center border border-dashed border-ink/20 px-6 py-24 text-center">
            <div>
              <p className="eyebrow">Nothing matches</p>
              <p className="mx-auto mt-5 max-w-[36ch] font-display text-[clamp(1.2rem,2.2vw,1.7rem)] leading-[1.16]">
                No product fits all three filters. Try widening the price or clearing the brand.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>

      {/* ------------------------------------------------------------ Disclosure */}
      <Container className="mt-16">
        <p className="hairline max-w-[74ch] pt-6 text-[0.82rem] leading-[1.7] text-mist">
          {HAS_AFFILIATE_LINKS
            ? `${AMAZON_REQUIRED_DISCLOSURE} Product links here are affiliate links and may earn a commission at no extra cost to you. What appears in this catalogue and how it is ordered is decided independently of that.`
            : 'Product links here go to a retailer search. No affiliate tags are configured, so nothing on this page earns a commission.'}{' '}
          {IS_LIVE_PRODUCT_DATA
            ? 'Prices and images are pulled live from Amazon and refreshed at least daily.'
            : 'Prices shown are indicative street prices, not live Amazon prices, and images are generated rather than photographed.'}
        </p>
      </Container>
    </>
  )
}
