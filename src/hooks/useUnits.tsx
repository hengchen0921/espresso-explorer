import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UnitSystem } from '@/lib/units'

const STORAGE_KEY = 'espresso-explorer:units'

interface UnitsValue {
  units: UnitSystem
  setUnits: (next: UnitSystem) => void
  toggle: () => void
}

const UnitsContext = createContext<UnitsValue | null>(null)

function readStored(): UnitSystem {
  if (typeof window === 'undefined') return 'metric'
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'metric' || saved === 'imperial') return saved
    // Nobody in the US expects a machine's footprint in centimetres.
    return navigator.language === 'en-US' ? 'imperial' : 'metric'
  } catch {
    return 'metric'
  }
}

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<UnitSystem>(readStored)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, units)
    } catch {
      // Private mode; the choice just won't persist.
    }
  }, [units])

  const toggle = useCallback(() => {
    setUnits((current) => (current === 'metric' ? 'imperial' : 'metric'))
  }, [])

  const value = useMemo(() => ({ units, setUnits, toggle }), [units, toggle])

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>
}

export function useUnits(): UnitsValue {
  const value = useContext(UnitsContext)
  if (!value) throw new Error('useUnits must be used inside <UnitsProvider>')
  return value
}
