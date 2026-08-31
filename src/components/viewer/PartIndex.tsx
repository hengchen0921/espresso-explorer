import type { PartId, ResolvedPart } from '@/data/types'
import { cx } from '@/lib/format'

interface PartIndexProps {
  parts: ResolvedPart[]
  hoveredPart: PartId | null
  onSelect: (id: PartId) => void
  onHover: (id: PartId | null) => void
  className?: string
}

/**
 * The component list beside the viewer. Hovering a row lights the matching
 * geometry, which is what turns a list of names into a legend for the model.
 */
export function PartIndex({ parts, hoveredPart, onSelect, onHover, className }: PartIndexProps) {
  return (
    <div className={cx('flex h-full flex-col bg-surface', className)}>
      <div className="border-b border-ink/10 px-6 py-5 md:px-8">
        <p className="eyebrow">Components</p>
        <h2 className="mt-2.5 text-[clamp(1.4rem,2.2vw,1.85rem)] leading-[1.08]">
          {parts.length} parts worth understanding
        </h2>
        <p className="mt-3 text-[0.9rem] leading-[1.65] text-stone">
          Pick one on the model or from the list. The case turns to glass for anything hidden
          inside it.
        </p>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {parts.map((part, i) => (
          <li key={part.id}>
            <button
              type="button"
              onClick={() => onSelect(part.id)}
              onMouseEnter={() => onHover(part.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(part.id)}
              onBlur={() => onHover(null)}
              className={cx(
                'group flex w-full items-start gap-4 border-b border-ink/8 px-6 py-4 text-left transition-colors duration-300 md:px-8',
                hoveredPart === part.id ? 'bg-copper-tint/40' : 'hover:bg-ink/6',
              )}
            >
              <span
                className={cx(
                  'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full numeric text-[10px] transition-colors duration-300',
                  hoveredPart === part.id
                    ? 'bg-copper text-linen'
                    : 'bg-ink/10 text-stone group-hover:bg-copper group-hover:text-linen',
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-[1.02rem] tracking-display text-ink">
                    {part.name}
                  </span>
                  <span className="eyebrow shrink-0 text-mist">{part.system}</span>
                </span>
                <span className="mt-1.5 block truncate label text-stone">
                  {part.spec}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
