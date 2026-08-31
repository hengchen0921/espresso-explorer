import type { ReactNode } from 'react'
import { cx } from '@/lib/format'

/**
 * The measured column. Wider and less padded than a typical article container
 * because the old 1440/px-16 combination left visible dead margins on any
 * screen above ~1600px — the content read as a strip floating in space.
 */
export function Container({
  children,
  className,
  wide,
}: {
  children: ReactNode
  className?: string
  /** Drop the max-width entirely; padding still holds content off the edge. */
  wide?: boolean
}) {
  return (
    <div
      className={cx(
        'mx-auto w-full px-5 md:px-8 lg:px-12',
        wide ? 'max-w-none' : 'max-w-[1680px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Truly edge to edge — no padding, no cap. For stages and full-width bands. */
export function Bleed({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('w-full', className)}>{children}</div>
}

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  /** Small mono counter shown at the far right of the rule, e.g. "05". */
  index?: string
  className?: string
}

export function SectionHeading({ eyebrow, title, lede, index, className }: SectionHeadingProps) {
  return (
    <header className={cx('hairline pt-6', className)}>
      <div className="flex items-baseline justify-between gap-6">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {index && <span className="eyebrow text-mist">{index}</span>}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <h2 className="text-[clamp(1.9rem,3.6vw,3.1rem)] leading-[1.02] lg:col-span-7">{title}</h2>
        {lede && (
          <div className="max-w-prose text-[0.975rem] leading-[1.7] text-ash lg:col-span-5 lg:pt-2">
            {lede}
          </div>
        )}
      </div>
    </header>
  )
}
