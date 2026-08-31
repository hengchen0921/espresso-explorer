import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/** Route → the word that runs down the left gutter. */
function railLabel(pathname: string): string {
  const path = pathname.replace(import.meta.env.BASE_URL, '/').replace(/\/+/g, '/')
  if (path.startsWith('/machines/')) return 'Teardown'
  if (path.startsWith('/catalog')) return 'The catalogue'
  if (path.startsWith('/finder')) return 'Find yours'
  if (path.startsWith('/compare')) return 'Side by side'
  if (path.startsWith('/lineup')) return 'The lineup'
  return 'Espresso Explorer'
}

/**
 * Fixed furniture in the page margins.
 *
 * The layout previously put every page in one centred column, which left wide
 * screens with two empty gutters and made the content read as a strip floating
 * in space. These fill the gutters with something that belongs there — the
 * section name on the left, read position on the right — rather than padding
 * the content out to widths where the prose stops being readable.
 *
 * Only above `xl`, because below that the margin is content padding, not spare
 * space, and the rails would sit on top of the page.
 */
export function PageRails() {
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-y-0 z-30 hidden w-full xl:block">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl]">
        <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-stone/70">
          {railLabel(pathname)}
        </span>
      </div>

      <div className="absolute right-5 top-1/2 flex h-40 -translate-y-1/2 flex-col items-center gap-3">
        <span className="font-mono text-[9px] tracking-[0.2em] text-stone/60 [writing-mode:vertical-rl]">
          {String(Math.round(progress * 100)).padStart(2, '0')}
        </span>
        <span className="relative w-px flex-1 bg-ink/12">
          <span
            className="absolute inset-x-0 top-0 origin-top bg-copper transition-transform duration-150 ease-out"
            style={{ height: '100%', transform: `scaleY(${progress})` }}
          />
        </span>
      </div>
    </div>
  )
}
