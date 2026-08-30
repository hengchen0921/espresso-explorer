import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import type { Machine } from '@/data/types'
import { cx, formatDuration, formatPrice } from '@/lib/format'
import { MachinePortrait } from '@/components/MachinePortrait'
import { ArrowGlyph } from '@/components/ui/Button'

/**
 * Every machine at once, with the three numbers that actually vary drawn to a
 * common scale. The comparison page holds three machines and explains them; this
 * holds all of them and only ranks them.
 */
interface Bar {
  label: string
  value: string
  /** 0–1 of the widest machine in the catalogue on this measure. */
  fill: number
}

function useRanges(machines: Machine[]) {
  return useMemo(() => {
    const footprint = (m: Machine) => m.specs.widthCm * m.specs.depthCm
    return {
      maxPrice: Math.max(...machines.map((m) => m.price)),
      maxFootprint: Math.max(...machines.map(footprint)),
      // Heat-up spans 3 seconds to 20 minutes; a linear bar would render every
      // fast machine as an invisible sliver.
      maxReady: Math.log(Math.max(...machines.map((m) => m.specs.heatUpSeconds)) + 1),
      footprint,
    }
  }, [machines])
}

export function LineupDashboard({ machines }: { machines: Machine[] }) {
  const ranges = useRanges(machines)

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {machines.map((machine, index) => {
        const bars: Bar[] = [
          {
            label: 'Price',
            value: formatPrice(machine.price),
            fill: machine.price / ranges.maxPrice,
          },
          {
            label: 'Counter space',
            value: `${machine.specs.widthCm} × ${machine.specs.depthCm} cm`,
            fill: ranges.footprint(machine) / ranges.maxFootprint,
          },
          {
            label: 'Ready in',
            value: formatDuration(machine.specs.heatUpSeconds),
            fill: Math.log(machine.specs.heatUpSeconds + 1) / ranges.maxReady,
          },
        ]

        return (
          <article
            key={machine.id}
            className={cx(
              'group relative flex flex-col border border-ink/10 bg-linen',
              'transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              'hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_22px_50px_-32px_rgba(23,18,15,0.5)]',
            )}
          >
            <div className="relative grid place-items-center bg-[radial-gradient(120%_100%_at_50%_0%,#fffdf9_0%,#f2ece1_100%)] px-6 pt-8 pb-4">
              <span className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.16em] text-mist">
                {String(index + 1).padStart(2, '0')}
              </span>
              <MachinePortrait machine={machine} className="h-[150px]" />
            </div>

            <div className="flex flex-1 flex-col gap-5 border-t border-ink/10 p-5">
              <div>
                <p className="eyebrow">{machine.brand}</p>
                <h3 className="mt-1.5 text-[1.15rem] leading-[1.1]">
                  <Link
                    to={`/machines/${machine.id}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {machine.name}
                  </Link>
                </h3>
              </div>

              <dl className="space-y-3">
                {bars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone">
                        {bar.label}
                      </dt>
                      <dd className="font-mono text-[0.72rem] text-ink">{bar.value}</dd>
                    </div>
                    <div className="mt-1.5 h-[3px] w-full bg-ink/8">
                      <div
                        className="h-full bg-copper transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ width: `${Math.max(4, bar.fill * 100).toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-auto flex items-end justify-between gap-3">
                <p className="font-mono text-[9px] uppercase leading-[1.6] tracking-[0.12em] text-mist">
                  {machine.specs.portafilterMm} mm
                  <br />
                  {machine.specs.pid ? 'PID' : 'No PID'} ·{' '}
                  {machine.specs.grinder ? 'Grinder' : 'No grinder'}
                </p>
                <ArrowGlyph className="text-stone group-hover:translate-x-1 group-hover:text-copper" />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
