import { FINDER_QUESTIONS, type FinderAnswers } from '@/data/finder'

/**
 * The seam for the intake model, shaped like `catalog/amazon.ts`: one env var
 * switches it on, and everything downstream is built to work without it.
 *
 * With no endpoint configured the finder falls back to asking its questions
 * directly, which is the whole product minus the shortcut — not a broken page.
 * That matters because the site deploys to GitHub Pages, where there is no
 * server at all.
 */
const ENDPOINT = import.meta.env.VITE_ADVISOR_API as string | undefined

export const IS_ADVISOR_ENABLED = Boolean(ENDPOINT)

export interface Interpretation {
  /** A paraphrase of what they said, shown back so they can correct it. */
  understood: string
  answers: Partial<FinderAnswers>
}

/** Values the scorer will accept, so a bad response cannot poison the ranking. */
const VALID = new Map(
  FINDER_QUESTIONS.map((q) => [q.id as string, new Set(q.options.map((o) => o.value))]),
)

export class AdvisorError extends Error {}

export async function interpret(text: string, signal?: AbortSignal): Promise<Interpretation> {
  if (!ENDPOINT) throw new AdvisorError('No advisor endpoint configured')

  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal,
      body: JSON.stringify({
        text,
        // Sent rather than duplicated server-side so `finder.ts` stays the one
        // place the question set is defined.
        questions: FINDER_QUESTIONS.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options.map((o) => ({
            value: o.value,
            label: o.label,
            detail: o.detail,
          })),
        })),
      }),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new AdvisorError('Could not reach the advisor')
  }

  if (!response.ok) {
    throw new AdvisorError(
      response.status === 429
        ? 'Busy right now — try again in a moment, or answer the questions instead.'
        : 'The advisor could not read that. Answer the questions instead.',
    )
  }

  const data = (await response.json()) as Partial<Interpretation>

  // Trust nothing: keep only fields the scorer actually knows about, with
  // values from its own option lists. An unrecognised value would otherwise
  // fall through the scorer's lookups and produce a confident wrong answer.
  const answers: Record<string, string> = {}
  for (const [key, value] of Object.entries(data.answers ?? {})) {
    if (typeof value === 'string' && VALID.get(key)?.has(value)) answers[key] = value
  }

  return {
    understood: typeof data.understood === 'string' ? data.understood : '',
    answers: answers as Partial<FinderAnswers>,
  }
}
