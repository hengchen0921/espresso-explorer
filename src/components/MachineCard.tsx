import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Machine } from '@/data/types'
import { useCompare } from '@/hooks/useCompare'
import { cx, formatPrice } from '@/lib/format'
import { formatPortafilter } from '@/lib/units'
import { ArrowGlyph } from '@/components/ui/Button'
import { MachinePortrait } from './MachinePortrait'

interface MachineCardProps {
  machine: Machine
  index: number
  /** Wide tiles get a two-column interior; used to break the grid's rhythm. */
  wide?: boolean
}

export function MachineCard({ machine, index, wide = false }: MachineCardProps) {
  const [hovered, setHovered] = useState(false)
  const { isSelected, toggle } = useCompare()
  const selected = isSelected(machine.id)

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cx(
        'group relative flex flex-col border border-ink/10 bg-surface',
        'transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_26px_60px_-34px_rgba(23,18,15,0.55)]',
        wide && 'lg:flex-row',
      )}
    >
      <div
        className={cx(
          'relative grid place-items-center overflow-hidden product-well px-8 pt-10 pb-6',
          wide ? 'lg:w-[46%] lg:px-10 lg:py-12' : '',
        )}
      >
        <span className="absolute left-5 top-5 font-mono text-[10px] tracking-[0.16em] text-mist">
          {String(index + 1).padStart(2, '0')}
        </span>
        <MachinePortrait
          machine={machine}
          highlight={hovered}
          className={wide ? 'h-[280px]' : 'h-[230px]'}
        />
      </div>

      <div
        className={cx(
          'flex flex-1 flex-col justify-between gap-8 border-t border-ink/10 p-7 lg:p-8',
          wide && 'lg:border-l lg:border-t-0',
        )}
      >
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">{machine.brand}</p>
            <p className="font-mono text-[0.78rem] tracking-[0.06em] text-ink">
              {formatPrice(machine.price)}
            </p>
          </div>

          <h3 className="mt-2.5 text-[clamp(1.45rem,2.1vw,1.85rem)] leading-[1.08]">
            <Link
              to={`/machines/${machine.id}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {machine.name}
            </Link>
          </h3>

          <p className="mt-3.5 max-w-[46ch] text-[0.92rem] leading-[1.65] text-ash">
            {machine.tagline}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-stone">
              {machine.category}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
              {formatPortafilter(machine.specs.portafilterMm)} · {machine.specs.grinder ? 'grinder' : 'no grinder'} ·{' '}
              {machine.specs.pid ? 'PID' : 'no PID'}
            </p>
          </div>

          <span className="relative z-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggle(machine.id)}
              aria-pressed={selected}
              className={cx(
                'grid h-8 w-8 place-items-center rounded-full border transition-all duration-300',
                selected
                  ? 'border-copper bg-copper text-linen'
                  : 'border-ink/15 text-stone hover:border-copper hover:text-copper',
              )}
              title={selected ? 'Remove from comparison' : 'Add to comparison'}
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                {selected ? (
                  <path
                    d="M3.5 8.4 6.4 11.3 12.5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M8 3.4v9.2M3.4 8h9.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <span className="sr-only">
                {selected ? 'Remove' : 'Add'} {machine.name} {selected ? 'from' : 'to'} comparison
              </span>
            </button>

            <ArrowGlyph className="text-stone group-hover:translate-x-1 group-hover:text-copper" />
          </span>
        </div>
      </div>
    </article>
  )
}
