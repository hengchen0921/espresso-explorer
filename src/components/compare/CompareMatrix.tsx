import { SPEC_GROUPS, SPEC_ROWS, winnersFor } from '@/data/specSchema'
import type { Machine } from '@/data/types'
import { cx } from '@/lib/format'
import { useUnits } from '@/hooks/useUnits'

/**
 * The specification matrix. Rows that have a defensible "better" direction mark
 * a winner; rows that do not — steam wand type, basket type — are left
 * deliberately unmarked rather than inventing a ranking.
 */
export function CompareMatrix({ machines }: { machines: Machine[] }) {
  const { units } = useUnits()
  const columns = `minmax(190px, 1.4fr) repeat(${machines.length}, minmax(140px, 1fr))`

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div
          className="sticky top-16 z-20 grid items-end gap-x-6 border-b border-ink/20 bg-paper/95 py-4 backdrop-blur-xl md:top-[74px]"
          style={{ gridTemplateColumns: columns }}
        >
          <span className="eyebrow">Specification</span>
          {machines.map((machine) => (
            <div key={machine.id}>
              <p className="eyebrow">{machine.brand}</p>
              <p className="mt-1.5 font-display text-[1.05rem] leading-tight text-ink">
                {machine.name}
              </p>
            </div>
          ))}
        </div>

        {SPEC_GROUPS.map((group) => {
          const rows = SPEC_ROWS.filter((row) => row.group === group)
          if (rows.length === 0) return null

          return (
            <section key={group}>
              <div
                className="grid gap-x-6 border-b border-ink/10 pt-10 pb-3"
                style={{ gridTemplateColumns: columns }}
              >
                <h3 className="eyebrow text-copper-deep">{group}</h3>
              </div>

              {rows.map((row) => {
                const winners = winnersFor(row, machines)
                return (
                  <div
                    key={row.key}
                    className="grid items-baseline gap-x-6 border-b border-ink/8 py-4"
                    style={{ gridTemplateColumns: columns }}
                  >
                    <div>
                      <p className="text-[0.92rem] text-ash">{row.label}</p>
                      {row.hint && (
                        <p className="mt-1.5 max-w-[40ch] text-[0.78rem] leading-[1.55] text-mist">
                          {row.hint}
                        </p>
                      )}
                    </div>

                    {machines.map((machine) => {
                      const isWinner = winners.has(machine.id)
                      return (
                        <p
                          key={machine.id}
                          className={cx(
                            'flex items-baseline gap-2 font-mono text-[0.8rem] leading-[1.5]',
                            isWinner ? 'text-copper-deep' : 'text-ink',
                          )}
                        >
                          {isWinner && (
                            <span
                              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper"
                              aria-label="Strongest in this row"
                            />
                          )}
                          {row.value(machine, units)}
                        </p>
                      )
                    })}
                  </div>
                )
              })}
            </section>
          )
        })}
      </div>
    </div>
  )
}
