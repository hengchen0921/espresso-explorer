# Advisor API

The intake model behind `/finder`. It reads a sentence or two of plain English
about someone's mornings and fills in the finder's answer fields; it does not
choose a machine.

## Why it is split this way

`src/data/finder.ts` still does the ranking, and it stays a deterministic
scoring model. That is not caution about LLMs — it is that a buying guide's one
real asset is being able to show its working. The scorer can say *why* a machine
won and exactly what ruled every other one out. A model producing the verdict
would trade that for fluency.

So the division is: **the model understands, the scorer decides.** The hard part
for a first-time buyer was never the ranking, it was being asked their counter
depth in centimetres before they had been told anything.

## Contract

```
POST /api/advise
{
  "text": "Two flat whites every morning, tiny kitchen, about $600 all in.",
  "questions": [ { "id": "milk", "question": "…", "options": [ { "value": "one-two", "label": "…", "detail": "…" } ] } ]
}

200 {
  "understood": "You make two milk drinks a morning, you're tight on counter space, and $600 covers everything.",
  "answers": { "milk": "one-two", "space": "tiny", "budget": "under-700" }
}
```

Fields the text does not support are simply absent — the client asks those as
real questions. **Absent is the correct answer, not a failure.** The prompt is
explicit that guessing is worse than leaving a field open, because anything left
open gets asked properly a moment later.

The question set is supplied by the client rather than duplicated here, so
`finder.ts` stays the only place it is defined and this function cannot drift
out of sync with it. Everything arriving over the wire is bounded before it
reaches a schema or a prompt: at most 12 questions of 8 options, ids and values
matched against `/^[a-z][a-z-]{0,31}$/`, text truncated to 1200 characters. That
is what stops the endpoint being used as a general relay to the API on our key.

Errors are typed rather than string-matched: 429 for a rate limit (worth
retrying), 502 for an upstream failure, 500 for bad credentials. The client
treats every one of them the same way — fall back to asking all six questions.

## Deploying

```bash
# Vercel: move index.js to api/advise.js in a project, then
vercel env add ANTHROPIC_API_KEY
vercel env add ALLOWED_ORIGIN        # e.g. https://hengchen0921.github.io
vercel deploy --prod
```

Then build the site with the endpoint configured:

```bash
VITE_ADVISOR_API=https://your-function.vercel.app/api/advise npm run build
```

That single variable is the whole switch. Without it `IS_ADVISOR_ENABLED` is
false, the text box never renders, and `/finder` opens on the questions —
the same finder, one fewer shortcut. Nothing 404s and nothing throws.

## Cost

One `claude-opus-5` call per submission at `effort: "low"`, on a prompt of a few
hundred tokens with a small structured response. This is extraction against a
fixed schema, which is what low effort is for. Rate limiting is **not**
implemented here — add it at the edge (Vercel's WAF, Cloudflare) before pointing
real traffic at it, or a single script can run up the bill.
