import { useLocation, useNavigate } from 'react-router-dom'
import { getMachines } from '@/data'
import { MAX_COMPARE, useCompare } from '@/hooks/useCompare'
import { cx } from '@/lib/format'

/** Floating shortlist. Hidden on the comparison page itself, where the same
 *  selection is expressed by the picker at the top of the page. */
export function CompareTray() {
  const { ids, remove, clear } = useCompare()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const selected = getMachines(ids)
  const visible = selected.length > 0 && pathname !== '/compare'

  return (
    <div
      className={cx(
        'pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-5',
        'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
      )}
    >
      <div
        className={cx(
          'pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-crema/12 bg-surface/95 p-1.5 pl-4',
          'shadow-[0_24px_60px_-24px_rgba(23,18,15,0.8)] backdrop-blur-xl',
        )}
        role="region"
        aria-label="Comparison shortlist"
      >
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-mist/70 sm:block">
          {selected.length}/{MAX_COMPARE}
        </span>

        <ul className="flex items-center gap-1.5 overflow-x-auto">
          {selected.map((machine) => (
            <li key={machine.id}>
              <button
                type="button"
                onClick={() => remove(machine.id)}
                className="group flex items-center gap-2 whitespace-nowrap rounded-full bg-espresso px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-crema/85 transition-colors hover:bg-bark"
              >
                {machine.name}
                <span className="text-mist/60 transition-colors group-hover:text-copper" aria-hidden>
                  ✕
                </span>
                <span className="sr-only">Remove {machine.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={clear}
          className="hidden px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-mist/60 transition-colors hover:text-copper sm:block"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={() => navigate(`/compare?ids=${ids.join(',')}`)}
          className="rounded-full bg-copper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-linen transition-colors hover:bg-copper-deep"
        >
          Compare
        </button>
      </div>
    </div>
  )
}
