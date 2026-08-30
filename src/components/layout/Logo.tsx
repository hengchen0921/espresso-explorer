import { cx } from '@/lib/format'

/** Portafilter seen from above: basket, ears, handle. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cx('h-6 w-6', className)}>
      <circle cx="14" cy="16" r="8.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="14" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
      <path d="M22.4 16H29" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M5.6 12.4 3.4 11M5.6 19.6 3.4 21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
