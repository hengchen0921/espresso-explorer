import type { ReactNode } from 'react'
import type { CatalogCategory } from './types'
import { cx } from '@/lib/format'

/**
 * The drawn picture for a product with no photograph.
 *
 * Every card needs something in the image slot on first paint, whether or not
 * an identifier exists and whether or not live data ever arrives. This is not
 * a placeholder waiting to be replaced — for most of the catalogue it is the
 * normal state, so it has to read as a deliberate drawing rather than as a
 * missing asset.
 *
 * An earlier version drew a single hairline path at 18% opacity, which on the
 * dark ground was invisible enough that the cards looked broken. Two things
 * fix that and are worth keeping: the strokes carry real contrast, and each
 * category has one copper accent, the same trick the machine portraits use to
 * stop a grey outline reading as a wireframe.
 */

/** Structural strokes. */
const INK = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
/** The one warm element per drawing. */
const ACCENT = { fill: 'none', stroke: 'var(--color-copper)', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const DRAWINGS: Record<CatalogCategory, ReactNode> = {
  'Espresso Machines': (
    <>
      <path {...INK} d="M13 14h38v20H13z" />
      <path {...INK} d="M19 34v13h26V34" />
      <path {...INK} d="M22 53h20" />
      <path {...INK} d="M32 34v5m-5 0h10" />
      <path {...INK} d="M28 43h8v4h-8z" />
      <circle {...ACCENT} cx="44" cy="22" r="2.4" />
    </>
  ),
  Grinders: (
    <>
      <path {...INK} d="M23 11h18l-3.5 8h-11z" />
      <path {...INK} d="M21.5 19h21v15a10.5 10.5 0 0 1-21 0z" />
      <path {...INK} d="M32 34v6" />
      <path {...INK} d="M25 46h14v9H25z" />
      <path {...ACCENT} d="M27 26h10" />
    </>
  ),
  'Coffee Beans': (
    <>
      <path {...INK} d="M19 22h26v32H19z" />
      <path {...INK} d="M19 22l4-8h18l4 8" />
      <path {...INK} d="M25 14h14" />
      <ellipse {...INK} cx="32" cy="38" rx="7" ry="9" />
      <path {...ACCENT} d="M32 30c-3 5-3 11 0 16" />
    </>
  ),
  'Cold Brew': (
    <>
      <path {...INK} d="M22 15h20l-2 35a6 6 0 0 1-6 5h-4a6 6 0 0 1-6-5z" />
      <path {...INK} d="M23 11h18" />
      <path {...INK} d="M42 21h5a4.5 4.5 0 0 1 0 9h-4" />
      <path {...ACCENT} d="M24 33h16" />
    </>
  ),
  'Pour-Over & Drip': (
    <>
      <path {...INK} d="M15 15h34L36 34H28z" />
      <path {...INK} d="M20 15h24" />
      <path {...INK} d="M24 42h16v13H24z" />
      <path {...INK} d="M24 42a8 8 0 0 1 16 0" />
      <path {...ACCENT} d="M32 34v5" />
    </>
  ),
  'French Press': (
    <>
      <path {...INK} d="M21 18h22v37H21z" />
      <path {...INK} d="M18 18h28" />
      <path {...INK} d="M32 6v12" />
      <path {...INK} d="M27 6h10" />
      <path {...ACCENT} d="M23 31h18" />
    </>
  ),
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
      <svg
        viewBox="0 0 64 64"
        // Was h-1/2 at ink/18 — too small and far too pale to register as a
        // drawing. The copper accent inside carries its own colour.
        className="h-[58%] w-[58%] text-ink/40"
        aria-hidden
      >
        {DRAWINGS[category]}
      </svg>
    </div>
  )
}
