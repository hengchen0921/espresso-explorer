import type { CatalogCategory } from './types'
import { cx } from '@/lib/format'

/**
 * The fallback picture, drawn per category.
 *
 * Every card needs something in the image slot on first paint, whether or not
 * an ASIN exists and whether or not live data ever arrives. A line glyph at the
 * right size keeps the grid from reflowing and reads as deliberate rather than
 * broken.
 */
const PATHS: Record<CatalogCategory, string> = {
  'Espresso Machines':
    'M14 18h36v22H14zM20 40v10h24V40M30 44h4v6h-4zM22 54h20M46 24h4M20 24h6M46 40c0 4-2 6-4 8',
  Grinders:
    'M24 12h16l-3 8H27zM22 20h20v14a10 10 0 0 1-10 10 10 10 0 0 1-10-10zM26 48h12v8H26zM32 30v6',
  'Coffee Beans':
    'M20 32a12 12 0 0 1 24 0 12 12 0 0 1-24 0zM32 20c-4 6-4 18 0 24M18 46c8 6 20 6 28 0',
  'Cold Brew':
    'M22 14h20l-2 34a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6zM24 26h16M28 34h8M42 20h6a4 4 0 0 1 0 8h-6',
  'Pour-Over & Drip':
    'M16 16h32l-10 18H26zM26 34h12v6H26zM24 46h16v10H24zM20 20h-4M48 20h4',
  'French Press':
    'M22 16h20v38H22zM32 6v10M26 12h12M22 30h20M26 54h12v6H26z',
}

export function CategoryGlyph({
  category,
  className,
}: {
  category: CatalogCategory
  className?: string
}) {
  return (
    <div className={cx('grid h-full w-full place-items-center', className)}>
      <svg viewBox="0 0 64 64" className="h-1/2 w-1/2 text-ink/18" aria-hidden>
        <path
          d={PATHS[category]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
