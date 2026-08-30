import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMachine, machines, resolveParts } from '@/data'
import type { Machine, PartId } from '@/data/types'
import { getModelDefinition } from '@/models/registry'
import type { MachineModelDefinition } from '@/models/types'
import { useCompare } from '@/hooks/useCompare'
import { useIsCompact } from '@/hooks/useMediaQuery'
import { cx, formatDuration, formatPrice } from '@/lib/format'
import { formatPortafilter, formatVolume, formatWeight } from '@/lib/units'
import { useUnits } from '@/hooks/useUnits'
import { MachineViewer } from '@/components/viewer/MachineViewer'
import { PartIndex } from '@/components/viewer/PartIndex'
import { PartPanel } from '@/components/viewer/PartPanel'
import { BuyButton, BuyLinks } from '@/components/BuyLinks'
import { SpecTable } from '@/components/SpecTable'
import { MachineElevation } from '@/components/MachineElevation'
import { ArrowGlyph, ButtonLink } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Section'
import { NotFoundPage } from './NotFoundPage'

export function MachinePage() {
  const { id } = useParams<{ id: string }>()
  const machine = getMachine(id)
  const definition = id ? getModelDefinition(id) : undefined

  if (!machine || !definition) return <NotFoundPage />
  return <MachineDetail key={machine.id} machine={machine} definition={definition} />
}

function MachineDetail({
  machine,
  definition,
}: {
  machine: Machine
  definition: MachineModelDefinition
}) {
  const [activePart, setActivePart] = useState<PartId | null>(null)
  const [hoveredPart, setHoveredPart] = useState<PartId | null>(null)
  const compact = useIsCompact()
  const { units } = useUnits()
  const { isSelected, toggle } = useCompare()

  const parts = useMemo(() => resolveParts(machine), [machine])
  const activeIndex = parts.findIndex((p) => p.id === activePart)
  const active = activeIndex >= 0 ? parts[activeIndex] : null
  const activeAnchor = definition.anchors.find((a) => a.partId === activePart)

  const step = useCallback(
    (delta: number) => {
      if (parts.length === 0) return
      const from = activeIndex >= 0 ? activeIndex : -1
      const next = (from + delta + parts.length) % parts.length
      setActivePart(parts[next].id)
    },
    [activeIndex, parts],
  )

  // Keyboard: escape closes, arrows walk the component list.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePart(null)
      if (!activePart) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activePart, step])

  const others = machines.filter((m) => m.id !== machine.id)
  const compared = isSelected(machine.id)

  const panel = active ? (
    <PartPanel
      part={active}
      machine={machine}
      index={activeIndex}
      total={parts.length}
      internal={activeAnchor?.internal}
      onClose={() => setActivePart(null)}
      onStep={step}
    />
  ) : (
    <PartIndex
      parts={parts}
      hoveredPart={hoveredPart}
      onSelect={setActivePart}
      onHover={setHoveredPart}
    />
  )

  return (
    <>
      <Container className="pt-8 md:pt-10">
        <div className="flex flex-col gap-7 border-b border-ink/12 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              to="/"
              className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-copper"
            >
              <ArrowGlyph className="rotate-180" />
              All machines
            </Link>

            <p className="eyebrow mt-7">
              {machine.brand} · {machine.modelCode} · in production since {machine.releaseYear}
            </p>
            <h1 className="mt-3 text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[0.96] tracking-[-0.03em]">
              {machine.name}
            </h1>
            <p className="mt-4 max-w-[46ch] font-display text-[clamp(1.05rem,1.7vw,1.35rem)] italic leading-[1.4] text-ash">
              {machine.tagline}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-4 md:items-end">
            <p className="font-mono text-[1.55rem] tracking-[-0.01em] text-ink">
              {formatPrice(machine.price)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{machine.category}</Badge>
              <Badge tone={machine.specs.grinder ? 'accent' : 'outline'}>
                {machine.specs.grinder ? 'Grinder included' : 'Grinder extra'}
              </Badge>
            </div>
            <BuyButton machine={machine} />

            <button
              type="button"
              onClick={() => toggle(machine.id)}
              aria-pressed={compared}
              className={cx(
                'rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-300',
                compared
                  ? 'border-copper bg-copper text-linen'
                  : 'border-ink/20 text-ink hover:border-copper hover:text-copper',
              )}
            >
              {compared ? 'In comparison ✓' : 'Add to comparison'}
            </button>
          </div>
        </div>
      </Container>

      {/* ---------------------------------------------------------- The viewer */}
      <Container className="mt-8">
        <div className="grid overflow-hidden border border-ink/12 lg:grid-cols-12">
          <MachineViewer
            definition={definition}
            parts={parts}
            activePart={activePart}
            onSelectPart={setActivePart}
            hoveredPart={hoveredPart}
            onHoverPart={setHoveredPart}
            className="h-[58vh] min-h-[380px] lg:col-span-8 lg:h-[min(78vh,780px)]"
          />

          {/* Height is pinned to the viewer's so the panel scrolls inside the
              rail instead of stretching the row and pushing the model up. */}
          <div className="hidden border-ink/12 lg:col-span-4 lg:block lg:h-[min(78vh,780px)] lg:overflow-hidden lg:border-l">
            {panel}
          </div>

          {/* On narrow screens the index sits below the model and the detail
              arrives as a sheet, so the model never gets pushed off screen. */}
          <div className="border-t border-ink/12 lg:hidden">
            <PartIndex
              parts={parts}
              hoveredPart={hoveredPart}
              onSelect={setActivePart}
              onHover={setHoveredPart}
            />
          </div>
        </div>
      </Container>

      {compact && active && (
        <>
          <button
            type="button"
            aria-label="Close component panel"
            onClick={() => setActivePart(null)}
            className="animate-fade fixed inset-0 z-40 bg-ink/45 backdrop-blur-[2px] lg:hidden"
          />
          <div className="animate-sheet fixed inset-x-0 bottom-0 z-50 max-h-[76dvh] overflow-hidden rounded-t-2xl border-t border-ink/15 shadow-[0_-24px_60px_-24px_rgba(23,18,15,0.6)] lg:hidden">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-ink/15" aria-hidden />
            <div className="max-h-[calc(76dvh-1rem)] overflow-hidden">{panel}</div>
          </div>
        </>
      )}

      {/* -------------------------------------------------------------- Verdict */}
      <Container className="mt-24">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.08]">
              What you are actually buying
            </h2>
            <p className="mt-7 text-[1.05rem] leading-[1.75] text-ash">{machine.summary}</p>

            <div className="mt-10 border-l-2 border-copper pl-6">
              <p className="eyebrow text-copper-deep">The verdict</p>
              <p className="mt-3.5 text-[1.02rem] leading-[1.72] text-bark">{machine.verdict}</p>
            </div>

            <p className="mt-10 text-[0.92rem] leading-[1.7] text-stone">
              <span className="eyebrow mr-2">Best for</span>
              {machine.bestFor}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-ink/12 bg-ink/12">
              {[
                ['Ready in', formatDuration(machine.specs.heatUpSeconds)],
                ['Portafilter', formatPortafilter(machine.specs.portafilterMm)],
                ['Reservoir', formatVolume(machine.specs.tankLitres, units)],
                ['Weight', formatWeight(machine.specs.weightKg, units)],
              ].map(([label, value]) => (
                <div key={label} className="bg-linen px-5 py-6">
                  <p className="eyebrow">{label}</p>
                  <p className="mt-2.5 font-display text-[1.5rem] tracking-[-0.01em]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 border border-ink/12 bg-[radial-gradient(120%_100%_at_50%_0%,#fffdf9_0%,#f2ece1_100%)] px-8 py-8">
              <MachineElevation machine={machine} className="mx-auto max-h-[260px]" />
            </div>

            <BuyLinks machine={machine} className="mt-5" />
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {(
            [
              ['What it does well', machine.pros, 'text-copper-deep'],
              ['What you give up', machine.cons, 'text-stone'],
            ] as const
          ).map(([title, items, tone]) => (
            <section key={title} className="border-t border-ink/12 pt-6">
              <h3 className={cx('eyebrow', tone)}>{title}</h3>
              <ul className="mt-5 space-y-4">
                {items.map((item) => (
                  <li key={item} className="flex gap-4 text-[0.95rem] leading-[1.7] text-ash">
                    <span className="mt-2.5 h-px w-5 shrink-0 bg-ink/25" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>

      {/* ---------------------------------------------------------------- Specs */}
      <Container className="mt-24">
        <div className="border-t border-ink/12 pt-6">
          <p className="eyebrow">Full specification</p>
          <h2 className="mt-5 max-w-[20ch] text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.08]">
            Every number, and what it means for you.
          </h2>
        </div>
        <SpecTable machine={machine} className="mt-12" />
      </Container>

      {/* -------------------------------------------------------------- Compare */}
      <Container className="mt-24">
        <div className="border-t border-ink/12 pt-6">
          <p className="eyebrow">Cross-shop</p>
          <h2 className="mt-5 text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.08]">
            Put it up against something else.
          </h2>
        </div>

        <div className="mt-10 grid gap-px bg-ink/12 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((other) => (
            <Link
              key={other.id}
              to={`/compare?ids=${machine.id},${other.id}`}
              className="group flex flex-col justify-between gap-8 bg-paper px-6 py-7 transition-colors duration-300 hover:bg-linen"
            >
              <div>
                <p className="eyebrow">{other.brand}</p>
                <p className="mt-2 font-display text-[1.2rem] leading-[1.15] text-ink">
                  {other.name}
                </p>
              </div>
              <div className="flex items-end justify-between gap-3">
                <span className="font-mono text-[0.8rem] text-stone">{formatPrice(other.price)}</span>
                <ArrowGlyph className="text-stone group-hover:translate-x-1 group-hover:text-copper" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <ButtonLink to="/compare" variant="outline" className="group">
            Open the full comparison
            <ArrowGlyph className="group-hover:translate-x-1" />
          </ButtonLink>
        </div>
      </Container>
    </>
  )
}
