import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FINDER_QUESTIONS,
  findMachines,
  type FinderAnswers,
  type FinderQuestionId,
  type MachineMatch,
} from '@/data/finder'
import { machines } from '@/data'
import { AdvisorError, IS_ADVISOR_ENABLED, interpret } from '@/lib/advisor'
import { formatPrice, spellOut } from '@/lib/format'
import { useUnits } from '@/hooks/useUnits'
import { BuyButton } from '@/components/BuyLinks'
import { MachinePortrait } from '@/components/MachinePortrait'
import { ArrowGlyph, Button, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

/** Shown under the box so the first-time visitor knows what "tell me" means. */
const EXAMPLES = [
  'Two flat whites every morning, tiny kitchen, about $600 all in. I want good coffee, not a hobby.',
  "Just me, black espresso. I already have a decent grinder and I'd happily tinker.",
  'Family of four, everyone wants a latte at once, and I can leave it switched on.',
]

/**
 * The finder asks one question at a time, and asks as few as it can.
 *
 * The previous version put all six on one page as a flat form, which asked a
 * nervous first-time buyer to already know their counter depth in centimetres
 * before it told them anything. Now the opening move is a text box: the model
 * behind `interpret` turns "two lattes, tiny kitchen, £600" into whichever
 * fields that actually settles, and only what is genuinely still unknown gets
 * asked. Someone who writes a full sentence often answers four of six.
 *
 * The ranking is untouched — `findMachines` still decides, still deterministic,
 * still showing its working. The model only ever fills in the form.
 */
export function FinderPage() {
  const { units } = useUnits()
  const [answers, setAnswers] = useState<Partial<FinderAnswers>>({})
  const [understood, setUnderstood] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // With no endpoint configured there is nothing to send the text to, so the
  // page opens on the questions instead. Same finder, one fewer shortcut.
  const [asking, setAsking] = useState(!IS_ADVISOR_ENABLED)
  const resultsRef = useRef<HTMLDivElement>(null)

  const remaining = FINDER_QUESTIONS.filter((q) => !answers[q.id])
  const current = remaining[0]
  const complete = remaining.length === 0
  const answeredCount = FINDER_QUESTIONS.length - remaining.length

  const result = useMemo(
    () => (complete ? findMachines(answers as FinderAnswers, units) : null),
    [answers, complete, units],
  )

  const scrollToResults = () =>
    window.setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      120,
    )

  const choose = (id: FinderQuestionId, value: string) => {
    setAnswers((current) => {
      const next = { ...current, [id]: value } as Partial<FinderAnswers>
      if (Object.keys(next).length === FINDER_QUESTIONS.length) scrollToResults()
      return next
    })
  }

  const reopen = (id: FinderQuestionId) =>
    setAnswers(({ [id]: _dropped, ...rest }) => rest as Partial<FinderAnswers>)

  const reset = () => {
    setAnswers({})
    setUnderstood('')
    setText('')
    setError('')
    setAsking(!IS_ADVISOR_ENABLED)
  }

  const submitText = async () => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError('')
    try {
      const reading = await interpret(trimmed)
      setAnswers(reading.answers)
      setUnderstood(reading.understood)
      setAsking(true)
      if (Object.keys(reading.answers).length === FINDER_QUESTIONS.length) scrollToResults()
    } catch (failure) {
      // A failed read is not a dead end — it just means asking everything.
      setError(
        failure instanceof AdvisorError
          ? failure.message
          : 'Something went wrong. Answer the questions instead.',
      )
      setAsking(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Container className="pt-16 md:pt-24">
        <p className="eyebrow">Find yours</p>
        <h1 className="mt-6 max-w-[16ch] text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] tracking-display-lg">
          {asking ? 'A few things about your mornings.' : 'Tell me about your mornings.'}
        </h1>
        <p className="mt-7 max-w-[54ch] text-[1.02rem] leading-[1.7] text-ash">
          {asking
            ? `Everything you answer narrows it. When there is enough to go on, the guide ranks all ${spellOut(machines.length)} machines against what you actually said — and shows its working, including every machine it ruled out and why.`
            : 'Write it however you would say it out loud. Whatever you cover gets filled in for you; whatever you leave out becomes a question. Nothing here is a sales funnel — the ranking is a scoring model you can read.'}
        </p>
      </Container>

      {/* ------------------------------------------------------------- Intake */}
      {!asking && (
        <Container className="mt-12">
          <div className="max-w-[46rem]">
            <label htmlFor="advisor-text" className="sr-only">
              Describe your coffee habits and kitchen
            </label>
            <textarea
              id="advisor-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) void submitText()
              }}
              rows={4}
              maxLength={1200}
              placeholder="Two flat whites every morning, tiny kitchen, about $600 all in…"
              className="w-full resize-none border border-ink/15 bg-surface p-5 text-[1.02rem] leading-[1.65] text-ink transition-colors duration-300 placeholder:text-stone focus-visible:border-copper focus-visible:outline-none"
            />

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button onClick={() => void submitText()} disabled={busy || !text.trim()}>
                {busy ? 'Reading…' : 'Find my machine'}
                {!busy && <ArrowGlyph />}
              </Button>
              <button
                type="button"
                onClick={() => setAsking(true)}
                className="link-underline label text-stone transition-colors hover:text-copper"
              >
                Or just answer the questions
              </button>
            </div>

            {error && <p className="mt-5 text-[0.9rem] text-copper">{error}</p>}

            <div className="mt-12 border-t border-ink/12 pt-6">
              <p className="eyebrow">For example</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {EXAMPLES.map((example) => (
                  <li key={example}>
                    <button
                      type="button"
                      onClick={() => setText(example)}
                      className="text-left text-[0.92rem] leading-[1.6] text-stone transition-colors duration-200 hover:text-copper"
                    >
                      “{example}”
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      )}

      {/* ---------------------------------------------------------- Questions */}
      {asking && !complete && current && (
        <Container className="mt-14">
          {understood && (
            <div className="mb-10 max-w-[46rem] border-l-2 border-copper pl-5">
              <p className="eyebrow">What I took from that</p>
              <p className="mt-3 text-[1.02rem] leading-[1.65] text-ink">{understood}</p>
              <p className="mt-2.5 text-[0.85rem] text-stone">
                {answeredCount} of {FINDER_QUESTIONS.length} filled in.{' '}
                <button
                  type="button"
                  onClick={reset}
                  className="link-underline text-stone transition-colors hover:text-copper"
                >
                  Not right? Start again
                </button>
              </p>
            </div>
          )}

          <AnsweredChips answers={answers} onReopen={reopen} />

          <div className="mt-8 border-t border-ink/12 pt-8">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="numeric text-[10px] text-copper">
                  {String(answeredCount + 1).padStart(2, '0')} / {FINDER_QUESTIONS.length}
                </p>
                <h2 className="mt-4 text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.12]">
                  {current.question}
                </h2>
                <p className="mt-4 max-w-[40ch] text-[0.95rem] leading-[1.65] text-stone">
                  {current.hint}
                </p>
              </div>

              <div className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-7">
                {current.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => choose(current.id, option.value)}
                    className="border border-ink/12 bg-surface px-5 py-4 text-left transition-all duration-300 hover:border-copper hover:bg-raised"
                  >
                    <span className="block text-[0.97rem] text-ink">{option.label}</span>
                    <span className="mt-1 block text-[0.85rem] leading-[1.5] text-stone">
                      {option.detail}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Container>
      )}

      {/* ------------------------------------------------------------ Results */}
      <div ref={resultsRef} className="scroll-mt-24">
        {result && <FinderResults result={result} onReset={reset} />}
      </div>
    </>
  )
}

/**
 * Everything already settled, always visible and always reversible. The model
 * fills some of these in without being asked, so they have to be correctable —
 * an answer someone cannot see is an answer they cannot disagree with.
 */
function AnsweredChips({
  answers,
  onReopen,
}: {
  answers: Partial<FinderAnswers>
  onReopen: (id: FinderQuestionId) => void
}) {
  const settled = FINDER_QUESTIONS.filter((q) => answers[q.id])
  if (settled.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {settled.map((question) => {
        const chosen = question.options.find((o) => o.value === answers[question.id])
        return (
          <button
            key={question.id}
            type="button"
            onClick={() => onReopen(question.id)}
            title={question.question}
            className="group flex items-center gap-2 rounded-full border border-ink/15 px-3.5 py-1.5 transition-colors duration-300 hover:border-copper"
          >
            <span className="label text-stone">{chosen?.label}</span>
            <span className="text-stone transition-colors group-hover:text-copper">×</span>
          </button>
        )
      })}
    </div>
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
            <div className="grid place-items-center product-well px-8 py-10 lg:col-span-5">
              <MachinePortrait machine={best.machine} className="h-[260px]" />
            </div>

            <div className="flex flex-col gap-7 border-t border-ink/12 p-7 lg:col-span-7 lg:border-l lg:border-t-0 lg:p-10">
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="eyebrow">{best.machine.brand}</p>
                  <p className="label text-copper">
                    {Math.round(best.score * 100)}% match
                  </p>
                </div>
                <h3 className="mt-2.5 text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.02]">
                  {best.machine.name}
                </h3>
                <p className="mt-3 numeric text-[0.8rem] text-stone">
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
              <article key={match.machine.id} className="flex flex-col gap-6 border border-ink/12 bg-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">{match.machine.brand}</p>
                    <h3 className="mt-1.5 text-[1.3rem] leading-[1.1]">{match.machine.name}</h3>
                    <p className="mt-2 numeric text-[0.8rem] text-stone">
                      {formatPrice(match.totalCost)} all in
                    </p>
                  </div>
                  <p className="shrink-0 label text-copper">
                    {Math.round(match.score * 100)}%
                  </p>
                </div>
                <MatchReasons match={match} compact />
                <Link
                  to={`/machines/${match.machine.id}`}
                  className="link-underline mt-auto self-start label text-stone hover:text-copper"
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
          <code className="mx-1 numeric text-[0.8rem] text-stone">src/data/finder.ts</code>, which
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
