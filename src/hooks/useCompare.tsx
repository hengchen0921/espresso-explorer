import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'espresso-explorer:compare'
export const MAX_COMPARE = 3

interface CompareValue {
  ids: string[]
  toggle: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  replace: (ids: string[]) => void
  isSelected: (id: string) => boolean
  isFull: boolean
}

const CompareContext = createContext<CompareValue | null>(null)

function readStored(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

/**
 * The comparison shortlist. Lives in session storage so the selection survives
 * a page reload, but the comparison page itself reads its machines from the
 * URL — that keeps a comparison shareable.
 */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(readStored)

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // Private mode and similar — the shortlist just won't persist.
    }
  }, [ids])

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      if (current.includes(id)) return current.filter((v) => v !== id)
      if (current.length >= MAX_COMPARE) return [...current.slice(1), id]
      return [...current, id]
    })
  }, [])

  const value = useMemo<CompareValue>(
    () => ({
      ids,
      toggle,
      remove: (id) => setIds((current) => current.filter((v) => v !== id)),
      clear: () => setIds([]),
      replace: (next) => setIds(next.slice(0, MAX_COMPARE)),
      isSelected: (id) => ids.includes(id),
      isFull: ids.length >= MAX_COMPARE,
    }),
    [ids, toggle],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare(): CompareValue {
  const value = useContext(CompareContext)
  if (!value) throw new Error('useCompare must be used inside <CompareProvider>')
  return value
}
