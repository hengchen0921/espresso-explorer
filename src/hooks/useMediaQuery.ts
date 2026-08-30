import { useSyncExternalStore } from 'react'

const listeners = new Map<string, MediaQueryList>()

function getQuery(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null
  let mql = listeners.get(query)
  if (!mql) {
    mql = window.matchMedia(query)
    listeners.set(query, mql)
  }
  return mql
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = getQuery(query)
      mql?.addEventListener('change', onChange)
      return () => mql?.removeEventListener('change', onChange)
    },
    () => getQuery(query)?.matches ?? false,
    () => false,
  )
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Below this the part panel becomes a bottom sheet instead of a side rail.
 *
 * This MUST stay in step with Tailwind's `lg` breakpoint (1024px), which is
 * where `MachinePage` switches the rail on. A narrower value leaves a band of
 * widths with the rail hidden and no sheet — selecting a part would show
 * nothing at all.
 */
export function useIsCompact(): boolean {
  return useMediaQuery('(max-width: 1023.98px)')
}
