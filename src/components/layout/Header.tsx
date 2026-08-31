import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCompare } from '@/hooks/useCompare'
import { useTheme } from '@/hooks/useTheme'
import { useUnits } from '@/hooks/useUnits'
import { cx } from '@/lib/format'
import { Logo } from './Logo'

/**
 * Four items, not five, and none of them synonyms.
 *
 * "Machines", "Catalogue", "Lineup" and "Compare" all read as "a list of
 * espresso machines" to someone who has not used the site before. Lineup is now
 * reached from the homepage, where it belongs — it is a view of the machines,
 * not a separate destination. `hint` shows in the mobile sheet, where there is
 * room to say what a link actually leads to.
 */
const NAV = [
  { to: '/', label: 'Machines', hint: 'The eight we take apart', end: true },
  {
    to: '/finder',
    label: 'Help me choose',
    hint: 'Six questions, then a straight answer',
    end: false,
  },
  { to: '/catalog', label: 'All gear', hint: 'Grinders, beans and brewers', end: false },
  { to: '/compare', label: 'Compare', hint: 'Up to three, side by side', end: false },
]

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4">
      <line
        x1="3"
        y1={open ? '10' : '6.5'}
        x2="17"
        y2={open ? '10' : '6.5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="origin-center transition-transform duration-300"
        style={{ transform: open ? 'rotate(45deg)' : 'none' }}
      />
      <line
        x1="3"
        y1={open ? '10' : '13.5'}
        x2="17"
        y2={open ? '10' : '13.5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="origin-center transition-transform duration-300"
        style={{ transform: open ? 'rotate(-45deg)' : 'none' }}
      />
    </svg>
  )
}

function ThemeButton({ compact }: { compact?: boolean }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === 'light'}
      className={cx(
        'grid place-items-center rounded-full border border-ink/12 text-stone transition-colors duration-300 hover:border-copper hover:text-copper',
        compact ? 'h-9 w-9' : 'h-7 w-7',
      )}
    >
      <span className="sr-only">
        {theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'}
      </span>
      {theme === 'dark' ? (
        <svg viewBox="0 0 20 20" aria-hidden className="h-[15px] w-[15px]">
          <circle cx="10" cy="10" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="10"
              y1="1.9"
              x2="10"
              y2="4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${deg} 10 10)`}
            />
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" aria-hidden className="h-[15px] w-[15px]">
          <path
            d="M16.2 12.4A6.8 6.8 0 0 1 7.6 3.8a6.8 6.8 0 1 0 8.6 8.6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

function UnitsToggle({ compact }: { compact?: boolean }) {
  const { units, setUnits } = useUnits()
  return (
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
            'rounded-full font-mono uppercase tracking-[0.14em] transition-colors duration-300',
            compact ? 'px-3.5 py-1.5 text-[11px]' : 'px-2.5 py-1 text-[10px]',
            units === system ? 'bg-ink text-inverse' : 'text-stone hover:text-copper',
          )}
        >
          {label}
          <span className="sr-only">
            {system === 'metric' ? ' — centimetres and kilograms' : ' — inches and pounds'}
          </span>
        </button>
      ))}
    </div>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { ids } = useCompare()
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The sheet closes from the events that close it — a link tap, the toggle,
  // Escape — rather than from an effect watching the pathname, which would
  // start a second render on every navigation.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const active = (to: string, end: boolean) =>
    end ? pathname === to || pathname.startsWith('/machines') : pathname.startsWith(to)

  return (
    <header
      className={cx(
        'sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500',
        scrolled || open
          ? 'border-b border-ink/10 bg-paper/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center justify-between gap-6 px-5 md:h-[74px] md:px-8 lg:px-12">
        <Link to="/" className="group flex items-center gap-3" aria-label="Espresso Explorer, home">
          <Logo className="h-5 w-5 text-copper transition-transform duration-500 group-hover:rotate-[-14deg]" />
          <span className="font-display text-[1.02rem] font-medium tracking-[-0.02em] text-ink">
            Espresso Explorer
          </span>
        </Link>

        {/* ------------------------------------------------------------ Desktop */}
        <div className="hidden items-center gap-5 md:flex">
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={cx(
                  'rounded-full px-3 py-2 text-[0.875rem] transition-colors duration-300',
                  active(item.to, item.end) ? 'text-ink' : 'text-ash hover:text-copper',
                )}
              >
                {item.label}
                {item.to === '/compare' && ids.length > 0 && (
                  <span className="ml-1.5 inline-block rounded-full bg-copper px-1.5 py-px font-mono text-[9px] text-linen">
                    {ids.length}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <span className="h-4 w-px bg-ink/12" aria-hidden />
          <UnitsToggle />
          <ThemeButton />
        </div>

        {/* ------------------------------------------------------------- Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {ids.length > 0 && (
            <Link
              to="/compare"
              className="rounded-full bg-copper px-2.5 py-1 font-mono text-[10px] text-linen"
            >
              {ids.length}
              <span className="sr-only"> machines in your comparison</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/12 text-ink"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <MenuGlyph open={open} />
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="animate-fade fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-ink/10 bg-paper px-5 pt-4 pb-10 md:hidden"
        >
          <nav className="flex flex-col">
            {[...NAV, { to: '/lineup', label: 'Lineup', hint: 'All eight at true scale, on one counter', end: false }].map(
              (item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={cx(
                    'flex items-baseline justify-between gap-4 border-b border-ink/10 py-5',
                    active(item.to, item.end) ? 'text-ink' : 'text-ink/90',
                  )}
                >
                  <span>
                    <span className="font-display text-[1.45rem] tracking-[-0.02em]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-[0.85rem] leading-snug text-ash">
                      {item.hint}
                    </span>
                  </span>
                  {item.to === '/compare' && ids.length > 0 && (
                    <span className="shrink-0 rounded-full bg-copper px-2 py-0.5 font-mono text-[10px] text-linen">
                      {ids.length}
                    </span>
                  )}
                </NavLink>
              ),
            )}
          </nav>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-[0.85rem] text-ash">Measurements</span>
            <UnitsToggle compact />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[0.85rem] text-ash">Appearance</span>
            <ThemeButton compact />
          </div>
        </div>
      )}
    </header>
  )
}
