import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { GLOSSARY_MATCHERS, type GlossaryEntry } from '@/data/glossary'
import { cx } from '@/lib/format'

/**
 * A jargon word with its definition one hover or tap away.
 *
 * Hover alone would leave the definitions unreachable on a phone, which is
 * where most of this will be read, so it opens on click too and closes on
 * Escape or an outside tap.
 */
export function Term({ entry, children }: { entry: GlossaryEntry; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const wrap = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span ref={wrap} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        className="cursor-help border-b border-dashed border-copper/55 text-left transition-colors duration-200 hover:border-copper hover:text-copper"
      >
        {children}
      </button>

      {open && (
        <span
          id={id}
          role="tooltip"
          className={cx(
            'animate-fade absolute bottom-[calc(100%+0.55rem)] left-1/2 z-50 w-[min(19rem,78vw)] -translate-x-1/2',
            'rounded-lg border border-ink/12 bg-surface p-3.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)]',
          )}
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-copper">
            {entry.term}
          </span>
          <span className="mt-2 block text-[0.83rem] leading-[1.6] text-ash">
            {entry.definition}
          </span>
        </span>
      )}
    </span>
  )
}

/**
 * Renders prose with the first mention of each glossary term made explainable.
 *
 * Only the first, and only once per block: underlining every "portafilter" on
 * a page turns the copy into a minefield of dotted lines. Matching is
 * whole-word and case-insensitive, and the original casing is preserved.
 */
export function Glossed({ text, className }: { text: string; className?: string }) {
  const used = new Set<string>()
  // Narrower than ReactNode: this only ever holds raw strings and <Term>s, and
  // ReactNode is too wide for flatMap to accept as a return type.
  let nodes: Array<string | ReactElement> = [text]

  for (const { match, entry } of GLOSSARY_MATCHERS) {
    if (used.has(entry.term)) continue
    let done = false
    nodes = nodes.flatMap((node) => {
      if (done || typeof node !== 'string') return [node]
      const pattern = new RegExp(`\\b${match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      const found = pattern.exec(node)
      if (!found) return [node]
      done = true
      used.add(entry.term)
      return [
        node.slice(0, found.index),
        <Term key={`${entry.term}-${found.index}`} entry={entry}>
          {found[0]}
        </Term>,
        node.slice(found.index + found[0].length),
      ]
    })
  }

  return <span className={className}>{nodes}</span>
}
