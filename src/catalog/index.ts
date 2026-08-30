import { machines } from '@/data'
import productsJson from './products.json'
import { CATALOG_CATEGORIES, type CatalogCategory, type CatalogProduct } from './types'

/**
 * The catalogue is the union of two sources that never mix in the codebase:
 *
 *   • `products.json` — breadth. Adding an entry here is the whole job.
 *   • the flagship machines in `src/data/` — depth. Projected into catalogue
 *     shape here and nowhere else, so the teardown data keeps its own schema and
 *     neither side can break the other.
 */
const listed = productsJson as CatalogProduct[]

/** Flagship machines, flattened into catalogue cards that link to their 3D page. */
function flagshipAsCatalog(): CatalogProduct[] {
  return machines.map((machine) => ({
    id: `flagship-${machine.id}`,
    name: machine.name,
    brand: machine.brand,
    category: 'Espresso Machines' as const,
    subcategory: machine.category,
    price: machine.price,
    summary: machine.tagline,
    specs: [
      { label: 'Portafilter', value: `${machine.specs.portafilterMm} mm` },
      { label: 'Heating', value: machine.specs.heating },
      { label: 'Grinder', value: machine.specs.grinder ? 'Built in' : 'Separate' },
    ],
    asin: null,
    flagshipId: machine.id,
  }))
}

export const catalog: CatalogProduct[] = [...flagshipAsCatalog(), ...listed]

export const catalogBrands: string[] = [...new Set(catalog.map((p) => p.brand))].sort((a, b) =>
  a.localeCompare(b),
)

export const catalogPriceBounds = {
  min: Math.min(...catalog.map((p) => p.price)),
  max: Math.max(...catalog.map((p) => p.price)),
}

export function categoryCounts(): Record<CatalogCategory, number> {
  const counts = Object.fromEntries(CATALOG_CATEGORIES.map((c) => [c, 0])) as Record<
    CatalogCategory,
    number
  >
  for (const product of catalog) counts[product.category] += 1
  return counts
}

export type CatalogSort = 'featured' | 'price-asc' | 'price-desc' | 'name'

export interface CatalogFilters {
  category: CatalogCategory | 'All'
  brand: string | 'All'
  maxPrice: number | null
  sort: CatalogSort
}

export const DEFAULT_FILTERS: CatalogFilters = {
  category: 'All',
  brand: 'All',
  maxPrice: null,
  sort: 'featured',
}

/** Pure, so it can be exercised without rendering anything. */
export function filterCatalog(
  products: CatalogProduct[],
  filters: CatalogFilters,
): CatalogProduct[] {
  const matched = products.filter((product) => {
    if (filters.category !== 'All' && product.category !== filters.category) return false
    if (filters.brand !== 'All' && product.brand !== filters.brand) return false
    if (filters.maxPrice !== null && product.price > filters.maxPrice) return false
    return true
  })

  switch (filters.sort) {
    case 'price-asc':
      return [...matched].sort((a, b) => a.price - b.price)
    case 'price-desc':
      return [...matched].sort((a, b) => b.price - a.price)
    case 'name':
      return [...matched].sort((a, b) =>
        `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`),
      )
    default:
      // Flagship machines first, then catalogue order.
      return matched
  }
}

/** Brands present in the current category, so the brand list is never a dead end. */
export function brandsFor(category: CatalogCategory | 'All'): string[] {
  const scope = category === 'All' ? catalog : catalog.filter((p) => p.category === category)
  return [...new Set(scope.map((p) => p.brand))].sort((a, b) => a.localeCompare(b))
}

export { CATALOG_CATEGORIES }
export type { CatalogCategory, CatalogProduct }
