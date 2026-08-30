import { createContext, useContext } from 'react'
import type { PartId } from '@/data/types'
import type { SurfaceKey } from './types'

export type SurfaceState = 'idle' | 'hover' | 'active' | 'dim'

interface PartInteraction {
  activePart: PartId | null
  hoveredPart: PartId | null
  setHoveredPart: (id: PartId | null) => void
  selectPart: (id: PartId | null) => void
  /** True while an internal component is selected: the shell turns to glass. */
  xray: boolean
  /** Comparison view renders several machines at once and suppresses hotspots. */
  interactive: boolean
}

export const PartInteractionContext = createContext<PartInteraction>({
  activePart: null,
  hoveredPart: null,
  setHoveredPart: () => {},
  selectPart: () => {},
  xray: false,
  interactive: true,
})

export function usePartInteraction() {
  return useContext(PartInteractionContext)
}

interface SurfaceContextValue {
  key: SurfaceKey
  state: SurfaceState
  xray: boolean
}

export const SurfaceContext = createContext<SurfaceContextValue>({
  key: 'chassis',
  state: 'idle',
  xray: false,
})

export function useSurfaceContext() {
  return useContext(SurfaceContext)
}
