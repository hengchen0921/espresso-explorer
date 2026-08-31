import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

/**
 * POST /api/advise  { text, questions } -> { understood, answers }
 *
 * The one job this endpoint has is *understanding*, not deciding. It reads a
 * sentence or two of plain English about someone's mornings and maps it onto
 * the finder's existing answer fields. Ranking stays in `src/data/finder.ts`,
 * on the client, where it is deterministic, free, offline-capable and — the
 * part that actually matters for a buying guide — able to show its working.
 * A model that picked the winner would throw all of that away in exchange for
 * fluency nobody asked for.
 *
 * The question set is sent by the client rather than duplicated here, so
 * `finder.ts` stays the single source of truth and this function cannot drift
 * out of sync with it. Anything arriving over the wire is still validated
 * below before it reaches a schema.
 */

const MAX_TEXT = 1200
const MAX_QUESTIONS = 12
const MAX_OPTIONS = 8
const ID = /^[a-z][a-z-]{0,31}$/

const client = new Anthropic()

/**
 * The client is trusted to be our own build, but this is a public endpoint:
 * an unbounded question set would let anyone use it as a general-purpose
 * relay to the API on our key. Shape, size and character class are all
 * checked before any of it becomes a schema or a prompt.
 */
function validateQuestions(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_QUESTIONS) return null

  const clean = []
  for (const q of raw) {
    if (!q || typeof q.id !== 'string' || !ID.test(q.id)) return null
    if (typeof q.question !== 'string' || q.question.length > 200) return null
    if (!Array.isArray(q.options) || q.options.length === 0 || q.options.length > MAX_OPTIONS) {
      return null
    }

    const options = []
    for (const o of q.options) {
      if (!o || typeof o.value !== 'string' || !ID.test(o.value)) return null
      if (typeof o.label !== 'string' || o.label.length > 120) return null
      const detail = typeof o.detail === 'string' ? o.detail.slice(0, 160) : ''
      options.push({ value: o.value, label: o.label, detail })
    }
    clean.push({ id: q.id, question: q.question, options })
  }
  return clean
}

function buildSchema(questions) {
  const shape = {}
  for (const q of questions) {
    const legend = q.options.map((o) => `${o.value} = ${o.label}${o.detail ? ` (${o.detail})` : ''}`)
    shape[q.id] = z
      .enum(q.options.map((o) => o.value))
      .nullable()
      .describe(`${q.question} One of: ${legend.join('; ')}. null if they did not say.`)
  }
  return z.object({
    understood: z
      .string()
      .describe(
        'One short sentence, second person, paraphrasing what they told you. ' +
          'Only what they actually said. No advice, no machine names.',
      ),
    answers: z.object(shape),
  })
}

const SYSTEM = `You read a short description of someone's coffee habits and kitchen, and map it onto a fixed set of buying-guide fields.

Rules:
- Only fill a field the text actually supports. If someone does not mention counter space, that field is null. Guessing is worse than leaving it open, because anything you leave null gets asked as a real question instead.
- Reasonable inference from what they did say is fine. "Two flat whites every morning" tells you the milk field. "My kitchen is tiny" tells you the space field. "I just want good coffee without a project" tells you the learning field.
- A budget figure is the TOTAL they have to spend, machine and grinder together. If they name a number, pick the band that contains it.
- Do not recommend anything. Do not name a machine. Something else does the choosing.
- "understood" is a paraphrase, not a summary of your reasoning. It gets shown straight back to them so they can correct it.`

export default async function handler(request, response) {
  response.setHeader('access-control-allow-origin', process.env.ALLOWED_ORIGIN ?? '*')
  response.setHeader('access-control-allow-headers', 'content-type')
  response.setHeader('content-type', 'application/json; charset=utf-8')

  if (request.method === 'OPTIONS') {
    response.setHeader('access-control-allow-methods', 'POST, OPTIONS')
    response.statusCode = 204
    return response.end()
  }
  if (request.method !== 'POST') {
    response.statusCode = 405
    return response.end(JSON.stringify({ error: 'method_not_allowed' }))
  }

  const body = typeof request.body === 'string' ? safeParse(request.body) : request.body
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, MAX_TEXT) : ''
  const questions = validateQuestions(body?.questions)

  if (!text || !questions) {
    response.statusCode = 400
    return response.end(JSON.stringify({ error: 'text_and_questions_required' }))
  }

  try {
    const result = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 8192,
      // Extraction against a fixed schema — low effort is the right setting,
      // and this sits in front of a person waiting on a form.
      output_config: { effort: 'low', format: zodOutputFormat(buildSchema(questions)) },
      system: SYSTEM,
      messages: [{ role: 'user', content: text }],
    })

    // parsed_output is null when the model could not satisfy the schema.
    if (!result.parsed_output) {
      response.statusCode = 502
      return response.end(JSON.stringify({ error: 'could_not_parse' }))
    }

    // Drop nulls so the client sees "absent" and "answered" as the same shape
    // it would get from someone clicking through the questions by hand.
    const answers = {}
    for (const [key, value] of Object.entries(result.parsed_output.answers ?? {})) {
      if (value !== null && value !== undefined) answers[key] = value
    }

    response.statusCode = 200
    return response.end(
      JSON.stringify({ understood: result.parsed_output.understood, answers }),
    )
  } catch (error) {
    // Most specific first: a rate limit is worth retrying, a bad request is not.
    if (error instanceof Anthropic.RateLimitError) {
      response.statusCode = 429
      return response.end(JSON.stringify({ error: 'rate_limited' }))
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('advisor: bad credentials')
      response.statusCode = 500
      return response.end(JSON.stringify({ error: 'misconfigured' }))
    }
    if (error instanceof Anthropic.APIError) {
      console.error('advisor: api error', error.status, error.message)
      response.statusCode = 502
      return response.end(JSON.stringify({ error: 'upstream' }))
    }
    console.error('advisor: unexpected', error)
    response.statusCode = 500
    return response.end(JSON.stringify({ error: 'unexpected' }))
  }
}

function safeParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
