import { SPEC_GROUPS, SPEC_ROWS } from '@/data/specSchema'
import type { Machine } from '@/data/types'
import { cx } from '@/lib/format'
import { useUnits } from '@/hooks/useUnits'

/** Full specification for a single machine, grouped by system. */
export function SpecTable({ machine, className }: { machine: Machine; className?: string }) {
  const { units } = useUnits()

  return (
    <div className={cx('grid gap-x-10 gap-y-12 md:grid-cols-2', className)}>
      {SPEC_GROUPS.map((group) => {
        const rows = SPEC_ROWS.filter((row) => row.group === group)
        if (rows.length === 0) return null

        return (
          <section key={group}>
            <h3 className="eyebrow border-b border-ink/12 pb-3">{group}</h3>
            <dl>
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 border-b border-ink/8 py-4"
                >
                  <dt className="text-[0.92rem] text-ash">{row.label}</dt>
                  <dd className="text-right numeric text-[0.8rem] text-ink">
                    {row.value(machine, units)}
                  </dd>
                  {row.hint && (
                    <p className="col-span-2 mt-2 max-w-[52ch] text-[0.8rem] leading-[1.6] text-mist">
                      {row.hint}
                    </p>
                  )}
                </div>
              ))}
            </dl>
          </section>
        )
      })}
    </div>
  )
}
