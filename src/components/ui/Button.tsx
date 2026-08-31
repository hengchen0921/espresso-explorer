import { Link } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'
import { cx } from '@/lib/format'

type Variant = 'solid' | 'outline' | 'ghost' | 'inverse'
type Size = 'sm' | 'md'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-mono uppercase tracking-[0.14em] ' +
  'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-40 disabled:pointer-events-none'

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-ink text-inverse hover:bg-copper hover:text-linen',
  outline: 'border border-ink/20 text-ink hover:border-copper hover:text-copper',
  ghost: 'text-stone hover:text-copper',
  inverse: 'border border-crema/25 text-crema hover:border-copper hover:text-copper',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-[10px]',
  md: 'px-5 py-2.5 text-[11px]',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'solid',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<'button'>, 'children' | 'className'>) {
  return (
    <button className={cx(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'solid',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, 'children' | 'className'>) {
  return (
    <Link className={cx(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </Link>
  )
}

/** Trailing arrow that slides on hover — used on every "keep reading" affordance. */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={cx('h-3 w-3 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]', className)}
    >
      <path
        d="M2 8h11M9 4l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
