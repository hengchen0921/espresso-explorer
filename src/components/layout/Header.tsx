import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCompare } from '@/hooks/useCompare'
import { useUnits } from '@/hooks/useUnits'
import { cx } from '@/lib/format'
import { Logo } from './Logo'

const NAV = [
  { to: '/', label: 'Machines', end: true },
  { to: '/catalog', label: 'Catalogue', end: false },
  { to: '/finder', label: 'Find yours', end: false },
  { to: '/lineup', label: 'Lineup', end: false },
  { to: '/compare', label: 'Compare', end: false },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { ids } = useCompare()
  const { units, setUnits } = useUnits()
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cx(
        'sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500',
        scrolled
          ? 'border-b border-ink/10 bg-paper/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-6 px-6 md:h-[74px] md:px-10 lg:px-16">
        <Link to="/" className="group flex items-center gap-3" aria-label="Espresso Explorer, home">
          <Logo className="h-5 w-5 text-copper transition-transform duration-500 group-hover:rotate-[-14deg]" />
          <span className="font-display text-[1.02rem] font-medium tracking-[-0.02em] text-ink">
            Espresso Explorer
          </span>
        </Link>

        <div className="flex items-center gap-3 md:gap-5">
          <div
            className="flex items-center rounded-full border border-ink/12 p-0.5"
            role="group"
            aria-label="Units"
          >
            {(
              [
                ['metric', 'cm'],
                ['imperial', 'in'],
              ] as const
            ).map(([system, label]) => (
              <button
                key={system}
                type="button"
                onClick={() => setUnits(system)}
                aria-pressed={units === system}
                className={cx(
                  'rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-300',
                  units === system ? 'bg-ink text-linen' : 'text-stone hover:text-copper',
                )}
              >
                {label}
                <span className="sr-only">
                  {system === 'metric' ? ' — centimetres and kilograms' : ' — inches and pounds'}
                </span>
              </button>
            ))}
          </div>

        <nav className="flex items-center gap-1 md:gap-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(
                  'rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300',
                  isActive || (item.to === '/' && pathname.startsWith('/machines'))
                    ? 'text-ink'
                    : 'text-stone hover:text-copper',
                )
              }
            >
              {item.label}
              {item.to === '/compare' && ids.length > 0 && (
                <span className="ml-1.5 inline-block rounded-full bg-copper px-1.5 py-px text-[9px] text-linen">
                  {ids.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        </div>
      </div>
    </header>
  )
}
