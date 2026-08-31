import { Suspense, lazy, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMachines, machines } from '@/data'
import { getModelDefinition } from '@/models/registry'
import { MAX_COMPARE, useCompare } from '@/hooks/useCompare'
import { cx, formatPrice } from '@/lib/format'
import { BuyButton } from '@/components/BuyLinks'
import { CompareMatrix } from '@/components/compare/CompareMatrix'
import { MachineElevation } from '@/components/MachineElevation'
import { ArrowGlyph, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

const CompareStage = lazy(() => import('@/components/compare/CompareStage'))

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { ids: trayIds, replace } = useCompare()

  const idsParam = searchParams.get('ids') ?? ''

  const ids = useMemo(
    () =>
      idsParam
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, MAX_COMPARE),
    [idsParam],
  )

  // Landing here from the header rather than the tray: adopt the shortlist.
  useEffect(() => {
    if (!idsParam && trayIds.length > 0) {
      setSearchParams({ ids: trayIds.join(',') }, { replace: true })
    }
    // Intentionally mount-only: after this the URL is authoritative.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the tray mirroring the URL so the shortlist survives navigation.
  useEffect(() => {
    replace(ids)
    // `replace` is recreated whenever the shortlist changes; depending on it
    // would loop. The URL is the only real input here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam])

  const selected = getMachines(ids)

  const entries = useMemo(
    () =>
      selected.flatMap((machine) => {
        const definition = getModelDefinition(machine.id)
        return definition ? [{ machine, definition }] : []
      }),
    [selected],
  )

  const toggle = (id: string) => {
    const next = ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]
    const trimmed = next.slice(-MAX_COMPARE)
    setSearchParams(trimmed.length > 0 ? { ids: trimmed.join(',') } : {})
  }

  return (
    <>
      <Container className="pt-8 md:pt-12">
        <div className="border-b border-ink/12 pb-8">
          <p className="eyebrow">Side by side</p>
          <h1 className="mt-6 max-w-[16ch] text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[0.96] tracking-[-0.03em]">
            Two or three, at true scale.
          </h1>
          <p className="mt-6 max-w-[58ch] text-[1.02rem] leading-[1.72] text-ash">
            The models below are drawn at the same scale as each other, because footprint is the
            spec people misjudge most and the one a photograph never tells you honestly.
          </p>
        </div>
      </Container>

      {/* --------------------------------------------------------------- Picker */}
      <Container wide className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">
            Choose up to {MAX_COMPARE} — {selected.length} selected
          </span>
          {machines.map((machine) => {
            const active = ids.includes(machine.id)
            return (
              <button
                key={machine.id}
                type="button"
                onClick={() => toggle(machine.id)}
                aria-pressed={active}
                className={cx(
                  'rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-300',
                  active
                    ? 'border-copper bg-copper text-linen'
                    : 'border-ink/15 text-stone hover:border-copper hover:text-copper',
                )}
              >
                {machine.name}
              </button>
            )
          })}
          {ids.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="ml-1 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-mist transition-colors hover:text-copper"
            >
              Clear
            </button>
          )}
        </div>
      </Container>

      {/* ---------------------------------------------------------------- Stage */}
      <Container className="mt-8">
        {entries.length === 0 ? (
          <div className="grid place-items-center border border-dashed border-ink/20 px-6 py-24 text-center">
            <div>
              <p className="eyebrow">Nothing selected</p>
              <p className="mx-auto mt-5 max-w-[34ch] font-display text-[clamp(1.3rem,2.4vw,1.9rem)] leading-[1.16]">
                Pick two machines above and they will appear here at the same scale.
              </p>
              <ButtonLink to="/" variant="outline" className="group mt-8">
                Browse the machines
                <ArrowGlyph className="group-hover:translate-x-1" />
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="relative h-[52vh] min-h-[360px] overflow-hidden border border-ink/12 lg:h-[min(66vh,660px)]">
            <div className="absolute inset-0 stage-vignette" aria-hidden />
            <Suspense fallback={null}>
              <CompareStage entries={entries} />
            </Suspense>
            <p className="pointer-events-none absolute bottom-5 left-6 font-mono text-[10px] uppercase tracking-[0.16em] text-crema/40">
              One camera · true relative scale · drag to rotate
            </p>
          </div>
        )}
      </Container>

      {entries.length > 0 && (
        <>
          {/* ------------------------------------------------------- Elevations */}
          <Container className="mt-10">
            <div
              className="grid gap-px bg-ink/12"
              style={{ gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))` }}
            >
              {selected.map((machine) => (
                <div
                  key={machine.id}
                  className="product-well px-5 py-8"
                >
                  <MachineElevation machine={machine} className="mx-auto max-h-[220px]" />
                </div>
              ))}
            </div>
          </Container>

          {/* ----------------------------------------------------------- Matrix */}
          <Container className="mt-24">
            <div className="border-t border-ink/12 pt-6">
              <p className="eyebrow">The numbers</p>
              <h2 className="mt-5 max-w-[22ch] text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.08]">
                Where they genuinely differ.
              </h2>
              <p className="mt-5 max-w-[56ch] text-[0.95rem] leading-[1.7] text-ash">
                A copper dot marks the strongest machine in rows where "better" actually means
                something. Rows without one are differences of kind, not of quality.
              </p>
            </div>
            <div className="mt-10">
              <CompareMatrix machines={selected} />
            </div>
          </Container>

          {/* --------------------------------------------------------- Verdicts */}
          <Container className="mt-24">
            <div className="border-t border-ink/12 pt-6">
              <p className="eyebrow">In a sentence</p>
            </div>
            <div
              className="mt-10 grid gap-px bg-ink/12"
              style={{ gridTemplateColumns: `repeat(${Math.min(entries.length, 3)}, minmax(0, 1fr))` }}
            >
              {selected.map((machine) => (
                <article key={machine.id} className="flex flex-col gap-6 bg-paper px-6 py-8">
                  <div>
                    <p className="eyebrow">{machine.brand}</p>
                    <h3 className="mt-2 text-[1.35rem] leading-[1.1]">{machine.name}</h3>
                    <p className="mt-2 font-mono text-[0.82rem] text-copper">
                      {formatPrice(machine.price)}
                    </p>
                  </div>
                  <p className="flex-1 text-[0.92rem] leading-[1.72] text-ash">{machine.verdict}</p>
                  <div className="flex flex-col items-start gap-3">
                    <BuyButton machine={machine} className="md:items-start" />
                    <ButtonLink
                      to={`/machines/${machine.id}`}
                      variant="outline"
                      size="sm"
                      className="group self-start"
                    >
                      Open in 3D
                      <ArrowGlyph className="group-hover:translate-x-1" />
                    </ButtonLink>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </>
      )}
    </>
  )
}
