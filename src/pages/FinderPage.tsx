import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FINDER_QUESTIONS,
  findMachines,
  type FinderAnswers,
  type MachineMatch,
} from '@/data/finder'
import { cx, formatPrice } from '@/lib/format'
import { useUnits } from '@/hooks/useUnits'
import { BuyButton } from '@/components/BuyLinks'
import { MachinePortrait } from '@/components/MachinePortrait'
import { ArrowGlyph, Button, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

type Partial6 = Partial<FinderAnswers>

export function FinderPage() {
  const [answers, setAnswers] = useState<Partial6>({})
  const { units } = useUnits()
  const resultsRef = useRef<HTMLDivElement>(null)

  const answered = FINDER_QUESTIONS.filter((q) => answers[q.id]).length
  const complete = answered === FINDER_QUESTIONS.length

  const result = useMemo(
    () => (complete ? findMachines(answers as FinderAnswers, units) : null),
    [answers, complete, units],
  )

  const choose = (id: keyof FinderAnswers, value: string) => {
    setAnswers((current) => {
      const next = { ...current, [id]: value } as Partial6
      // Scroll to the answer the moment the last question lands.
      if (Object.keys(next).length === FINDER_QUESTIONS.length) {
        window.setTimeout(
          () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          120,
        )
      }
      return next
    })
  }

  return (
    <>
      <Container className="pt-8 md:pt-12">
        <div className="border-b border-ink/12 pb-8">
          <p className="eyebrow">Find yours</p>
          <h1 className="mt-6 max-w-[20ch] text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[0.96] tracking-[-0.03em]">
            Six questions, then an honest answer.
          </h1>
          <p className="mt-6 max-w-[62ch] text-[1.02rem] leading-[1.72] text-ash">
            Answer these and the guide will rank all {FINDER_QUESTIONS.length > 0 ? 'eight' : ''}{' '}
            machines against what you actually said — and show its working. Every recommendation
            lists why it fits and what you would be accepting; every machine it rules out says
            exactly what ruled it out.
          </p>
        </div>
      </Container>

      {/* ------------------------------------------------------------ Questions */}
      <Container className="mt-12">
        <ol className="space-y-14">
          {FINDER_QUESTIONS.map((question, index) => {
            const chosen = answers[question.id]
            return (
              <li key={question.id} className="hairline pt-6">
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-copper">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="mt-4 text-[clamp(1.3rem,2.2vw,1.75rem)] leading-[1.12]">
                      {question.question}
                    </h2>
                    <p className="mt-3 max-w-[42ch] text-[0.9rem] leading-[1.65] text-stone">
                      {question.hint}
                    </p>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 lg:col-span-7">
                    {question.options.map((option) => {
                      const active = chosen === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => choose(question.id, option.value)}
                          aria-pressed={active}
                          className={cx(
                            'border px-4 py-3.5 text-left transition-all duration-300',
                            active
                              ? 'border-copper bg-copper-tint/45'
                              : 'border-ink/12 hover:border-ink/30 hover:bg-crema/40',
                          )}
                        >
                          <span
                            className={cx(
                              'block text-[0.97rem]',
                              active ? 'text-copper-deep' : 'text-ink',
                            )}
                          >
                            {option.label}
                          </span>
                          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-mist">
                            {option.detail}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </Container>

      {/* -------------------------------------------------------------- Results */}
      <div ref={resultsRef} className="scroll-mt-24">
        {!complete && (
          <Container className="mt-20">
            <div className="hairline flex flex-wrap items-center justify-between gap-4 pt-6">
              <p className="eyebrow">
                {answered} of {FINDER_QUESTIONS.length} answered
              </p>
              <div className="h-[3px] w-full max-w-sm bg-ink/8">
                <div
                  className="h-full bg-copper transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: `${(answered / FINDER_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
          </Container>
        )}

        {result && <FinderResults result={result} onReset={() => setAnswers({})} />}
      </div>
    </>
  )
}

function FinderResults({
  result,
  onReset,
}: {
  result: ReturnType<typeof findMachines>
  onReset: () => void
}) {
  const [best, ...rest] = result.matches
  const runnersUp = rest.slice(0, 2)

  return (
    <>
      <Container className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-ink/12 pt-6">
          <div>
            <p className="eyebrow">The answer</p>
            <h2 className="mt-5 max-w-[22ch] text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.08]">
              {best ? 'This is the one to buy.' : 'Nothing here fits all of that.'}
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            Start over
          </Button>
        </div>
      </Container>

      {best ? (
        <Container className="mt-10">
          <article className="grid overflow-hidden border border-ink/12 lg:grid-cols-12">
            <div className="grid place-items-center bg-[radial-gradient(120%_100%_at_50%_0%,#fffdf9_0%,#f2ece1_100%)] px-8 py-10 lg:col-span-5">
              <MachinePortrait machine={best.machine} className="h-[260px]" />
            </div>

            <div className="flex flex-col gap-7 border-t border-ink/12 p-7 lg:col-span-7 lg:border-l lg:border-t-0 lg:p-10">
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="eyebrow">{best.machine.brand}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-copper">
                    {Math.round(best.score * 100)}% match
                  </p>
                </div>
                <h3 className="mt-2.5 text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.02]">
                  {best.machine.name}
                </h3>
                <p className="mt-3 font-mono text-[0.85rem] text-stone">
                  {formatPrice(best.machine.price)}
                  {best.totalCost !== best.machine.price && (
                    <> · {formatPrice(best.totalCost)} all in with a grinder</>
                  )}
                </p>
              </div>

              <MatchReasons match={best} />

              <div className="flex flex-wrap items-end gap-4">
                <BuyButton machine={best.machine} className="md:items-start" />
                <ButtonLink to={`/machines/${best.machine.id}`} variant="outline" className="group">
                  Take it apart in 3D
                  <ArrowGlyph className="group-hover:translate-x-1" />
                </ButtonLink>
              </div>
            </div>
          </article>
        </Container>
      ) : (
        <Container className="mt-10">
          <div className="border border-dashed border-ink/20 px-8 py-12">
            <p className="max-w-[60ch] text-[1rem] leading-[1.72] text-ash">
              Every machine in the guide failed at least one of your requirements. The closest ones
              are below with the specific thing that ruled them out — usually budget once a grinder
              is counted, or width. Loosening one answer will usually produce a real recommendation.
            </p>
          </div>
        </Container>
      )}

      {runnersUp.length > 0 && (
        <Container className="mt-16">
          <p className="eyebrow border-t border-ink/12 pt-6">Also worth considering</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {runnersUp.map((match) => (
              <article key={match.machine.id} className="flex flex-col gap-6 border border-ink/12 bg-linen p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">{match.machine.brand}</p>
                    <h3 className="mt-1.5 text-[1.3rem] leading-[1.1]">{match.machine.name}</h3>
                    <p className="mt-2 font-mono text-[0.78rem] text-stone">
                      {formatPrice(match.totalCost)} all in
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-copper">
                    {Math.round(match.score * 100)}%
                  </p>
                </div>
                <MatchReasons match={match} compact />
                <Link
                  to={`/machines/${match.machine.id}`}
                  className="link-underline mt-auto self-start font-mono text-[10px] uppercase tracking-[0.14em] text-stone hover:text-copper"
                >
                  Open in 3D
                </Link>
              </article>
            ))}
          </div>
        </Container>
      )}

      {result.ruledOut.length > 0 && (
        <Container className="mt-16">
          <p className="eyebrow border-t border-ink/12 pt-6">Ruled out, and why</p>
          <ul className="mt-6 divide-y divide-ink/8">
            {result.ruledOut.map((match) => (
              <li key={match.machine.id} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
                <Link
                  to={`/machines/${match.machine.id}`}
                  className="link-underline self-start text-[0.95rem] text-ink"
                >
                  {match.machine.brand} {match.machine.name}
                </Link>
                <ul className="space-y-1">
                  {match.blockers.map((reason) => (
                    <li key={reason} className="text-[0.9rem] leading-[1.65] text-stone">
                      {reason}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Container>
      )}

      <Container className="mt-16">
        <p className="hairline max-w-[68ch] pt-6 text-[0.82rem] leading-[1.7] text-mist">
          This is a scoring model, not a language model — the site is static, and an LLM would mean
          shipping an API key to your browser. Every point above comes from a rule you can read in
          <code className="mx-1 font-mono text-[0.78rem] text-stone">src/data/finder.ts</code>, which
          is also why it can tell you what it weighed rather than just what it decided.
        </p>
      </Container>
    </>
  )
}

function MatchReasons({ match, compact = false }: { match: MachineMatch; compact?: boolean }) {
  const reasons = compact ? match.reasons.slice(0, 2) : match.reasons
  const caveats = compact ? match.caveats.slice(0, 1) : match.caveats

  return (
    <div className="space-y-5">
      {reasons.length > 0 && (
        <div>
          <h4 className="eyebrow text-copper-deep">Why this one</h4>
          <ul className="mt-3 space-y-2.5">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-3 text-[0.93rem] leading-[1.65] text-ash">
                <span className="mt-2.5 h-px w-4 shrink-0 bg-copper" aria-hidden />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {caveats.length > 0 && (
        <div>
          <h4 className="eyebrow">What you are accepting</h4>
          <ul className="mt-3 space-y-2.5">
            {caveats.map((caveat) => (
              <li key={caveat} className="flex gap-3 text-[0.93rem] leading-[1.65] text-stone">
                <span className="mt-2.5 h-px w-4 shrink-0 bg-ink/25" aria-hidden />
                {caveat}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
