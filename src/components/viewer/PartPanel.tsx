import type { Machine, ResolvedPart } from '@/data/types'
import { Glossed } from '@/components/ui/Term'
import { cx } from '@/lib/format'
import { ArrowGlyph } from '@/components/ui/Button'

interface PartPanelProps {
  part: ResolvedPart
  machine: Machine
  index: number
  total: number
  internal?: boolean
  onClose: () => void
  onStep: (delta: number) => void
  className?: string
}

/**
 * Component detail.
 *
 * The order is deliberate: the specific part fitted to *this* machine comes
 * first — what it is, its numbers, what it can and cannot do — and the generic
 * explanation of the component class sits underneath it. Someone comparing two
 * machines wants the difference before the lesson.
 */
export function PartPanel({
  part,
  machine,
  index,
  total,
  internal,
  onClose,
  onStep,
  className,
}: PartPanelProps) {
  return (
    <div className={cx('flex h-full flex-col bg-surface', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 py-5 md:px-8">
        <div>
          <p className="eyebrow">
            {part.system} · {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </p>
          <h2 className="mt-2.5 text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.06]">{part.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/12 text-stone transition-colors duration-300 hover:border-copper hover:text-copper"
          aria-label="Close component panel"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
            <path
              d="m4 4 8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="animate-panel flex-1 overflow-y-auto px-6 py-7 md:px-8">
        {/* The part as actually fitted to this machine */}
        <section className="border-l-2 border-copper pl-5">
          <p className="eyebrow text-copper-deep">Fitted to the {machine.name}</p>
          <p className="mt-3 font-display text-[1.14rem] leading-[1.34] tracking-display text-ink">
            {part.component}
          </p>
        </section>

        {internal && (
          <p className="mt-5 inline-flex rounded-full border border-ink/12 px-3 py-1.5 label text-stone">
            Inside the case — the shell is showing you through
          </p>
        )}

        <section className="mt-8">
          <h3 className="eyebrow border-b border-ink/12 pb-3">The numbers on this one</h3>
          <dl>
            {part.figures.map((figure) => (
              <div
                key={figure.label}
                className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 border-b border-ink/8 py-3"
              >
                <dt className="text-[0.86rem] text-stone">{figure.label}</dt>
                <dd className="text-right numeric text-[0.8rem] leading-[1.5] text-ink">
                  {figure.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8">
          <h3 className="eyebrow">What this one can do</h3>
          <p className="mt-3.5 text-[0.97rem] leading-[1.72] text-ash"><Glossed text={part.capability} /></p>
        </section>

        <section className="mt-8">
          <h3 className="eyebrow">How the component works</h3>
          <p className="mt-3.5 text-[0.97rem] leading-[1.72] text-ash"><Glossed text={part.fn} /></p>
        </section>

        <section className="mt-8">
          <h3 className="eyebrow">Why it matters when you're choosing</h3>
          <p className="mt-3.5 text-[0.97rem] leading-[1.72] text-ash"><Glossed text={part.whyItMatters} /></p>
        </section>

        <section className="mt-8 border-l-2 border-copper bg-copper-tint/35 py-5 pl-5 pr-4">
          <h3 className="eyebrow text-copper-deep">The trade-off on the {machine.name}</h3>
          <p className="mt-3 text-[0.97rem] leading-[1.72] text-bark"><Glossed text={part.note} /></p>
        </section>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-6 py-4 md:px-8">
        <button
          type="button"
          onClick={() => onStep(-1)}
          className="group flex items-center gap-2 label text-stone transition-colors hover:text-copper"
        >
          <ArrowGlyph className="rotate-180 group-hover:-translate-x-1" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          className="group flex items-center gap-2 label text-stone transition-colors hover:text-copper"
        >
          Next component
          <ArrowGlyph className="group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}
