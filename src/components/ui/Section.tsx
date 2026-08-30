import type { ReactNode } from 'react'
import { cx } from '@/lib/format'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16', className)}>{children}</div>
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
