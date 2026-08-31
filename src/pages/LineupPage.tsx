import { Suspense, lazy, useMemo } from 'react'
import { machines } from '@/data'
import { getModelDefinition } from '@/models/registry'
import { formatPrice } from '@/lib/format'
import { LineupDashboard } from '@/components/lineup/LineupDashboard'
import { ArrowGlyph, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

const LineupStage = lazy(() => import('@/components/lineup/LineupStage'))

export function LineupPage() {
  const entries = useMemo(
    () =>
      machines.flatMap((machine) => {
        const definition = getModelDefinition(machine.id)
        return definition ? [{ machine, definition }] : []
      }),
    [],
  )

  const cheapest = machines.reduce((a, b) => (a.price < b.price ? a : b))
  const dearest = machines.reduce((a, b) => (a.price > b.price ? a : b))

  return (
    <>
      <Container className="pt-8 md:pt-12">
        <div className="border-b border-ink/12 pb-8">
          <p className="eyebrow">The whole field</p>
          <h1 className="mt-6 max-w-[18ch] text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[0.96] tracking-display-lg">
            All {machines.length}, on one counter.
          </h1>
          <p className="mt-6 max-w-[62ch] text-[1.02rem] leading-[1.72] text-ash">
            The comparison page holds three machines and explains them. This one holds every machine
            in the guide and only ranks them — the same ground plane, the same camera, the same
            scale, from {formatPrice(cheapest.price)} to {formatPrice(dearest.price)}.
          </p>
        </div>
      </Container>

      {/* --------------------------------------------------------- Family shot */}
      <Container wide className="mt-8">
        <div className="relative h-[54vh] min-h-[380px] overflow-hidden border border-ink/12 lg:h-[min(64vh,640px)]">
          <div className="absolute inset-0 stage-vignette" aria-hidden />
          <Suspense fallback={null}>
            <LineupStage entries={entries} />
          </Suspense>
          <p className="pointer-events-none absolute bottom-5 left-6 label text-crema/40">
            Two ranks · true relative scale · drag to rotate
          </p>
        </div>

        <p className="mt-4 max-w-[70ch] text-[0.85rem] leading-[1.7] text-mist">
          There is no product photography anywhere in this guide. The machines above are geometry
          rendered live in your browser; the pictures below are drawn from the same dimensions and
          the same palette. That is why they can be trusted against each other in a way a set of
          press photographs — shot at different focal lengths, in different finishes, under
          different lights — cannot.
        </p>
      </Container>

      {/* ----------------------------------------------------------- Dashboard */}
      <Container className="mt-24">
        <div className="border-t border-ink/12 pt-6">
          <p className="eyebrow">At a glance</p>
          <h2 className="mt-5 max-w-[22ch] text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.08]">
            Money, counter, and waiting.
          </h2>
          <p className="mt-5 max-w-[56ch] text-[0.95rem] leading-[1.7] text-ash">
            Three measures drawn to a common scale across the whole catalogue. Longer bars mean
            more of the thing — more money, more counter, more waiting — so short is not always
            better, but it is always cheaper, smaller or faster.
          </p>
        </div>

        <div className="mt-12">
          <LineupDashboard machines={machines} />
        </div>
      </Container>

      <Container className="mt-24">
        <div className="hairline flex flex-col items-start justify-between gap-8 pt-10 md:flex-row md:items-end">
          <h2 className="max-w-[18ch] text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.05]">
            Narrowed it down? Put two or three side by side.
          </h2>
          <ButtonLink to="/compare" className="group shrink-0">
            Open the comparison
            <ArrowGlyph className="group-hover:translate-x-1" />
          </ButtonLink>
        </div>
      </Container>
    </>
  )
}
