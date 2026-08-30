import type { ReactNode } from 'react'
import { cx } from '@/lib/format'

type Tone = 'neutral' | 'accent' | 'dark' | 'outline'

const TONES: Record<Tone, string> = {
  neutral: 'bg-crema text-ash',
  accent: 'bg-copper-tint text-copper-deep',
  dark: 'bg-ink text-crema',
  outline: 'border border-current text-stone',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
