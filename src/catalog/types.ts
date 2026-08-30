/**
 * The general catalogue.
 *
 * Deliberately separate from `src/data/` — that directory holds the flagship
 * machines, their per-component teardown copy and their 3D models, and it is
 * shaped for depth. This is shaped for breadth: many products, few fields, and
 * nothing that a new entry cannot supply on its own. Adding a product here must
 * never require touching a component.
 */

export const CATALOG_CATEGORIES = [
  'Espresso Machines',
  'Grinders',
  'Coffee Beans',
  'Cold Brew',
  'Pour-Over & Drip',
  'French Press',
] as const

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number]

export interface CatalogSpec {
  label: string
  value: string
}

export interface CatalogProduct {
  id: string
  name: string
  brand: string
  category: CatalogCategory
  subcategory: string
  /** Indicative US street price in dollars. Not an Amazon price — see amazon.ts. */
  price: number
  /** One line on what it is for. */
  summary: string
  specs: CatalogSpec[]
  /**
   * Amazon Standard Identification Number, once verified.
   *
   * `null` is the honest default and the code must handle it everywhere: a
   * guessed ASIN does not 404, it silently sends the reader to a different
   * product. Entries without one fall back to a model search, which resolves
   * correctly and never misleads.
   */
  asin: string | null
  /**
   * Set when this product is one of the flagship machines that has a full 3D
   * teardown. The catalogue links those to their model page instead of
   * treating them as a plain card.
   */
  flagshipId?: string
}
