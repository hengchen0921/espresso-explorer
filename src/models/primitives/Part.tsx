import { useMemo, type ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { PartInteractionContext, SurfaceContext, usePartInteraction } from '../PartContext'
import type { SurfaceKey, Vec3 } from '../types'
import type { SurfaceState } from '../PartContext'

interface PartProps {
  /** `chassis` marks structural geometry: dimmable, x-rayable, never clickable. */
  id: SurfaceKey
  children: ReactNode
  position?: Vec3
  rotation?: Vec3
  scale?: Vec3 | number
}

/**
 * Wraps a cluster of meshes into one addressable component. Handles hover and
 * selection, and publishes the resulting visual state downward so every
 * `<Surface>` inside reacts without being told about it individually.
 */
export function Part({ id, children, position, rotation, scale }: PartProps) {
  const { activePart, hoveredPart, setHoveredPart, selectPart, xray, interactive } =
    usePartInteraction()

  const isComponent = id !== 'chassis'
  const clickable = interactive && isComponent

  const state: SurfaceState = useMemo(() => {
    if (!isComponent) return activePart ? 'dim' : 'idle'
    if (activePart === id) return 'active'
    if (activePart) return 'dim'
    if (hoveredPart === id) return 'hover'
    return 'idle'
  }, [activePart, hoveredPart, id, isComponent])

  const surface = useMemo(() => ({ key: id, state, xray }), [id, state, xray])

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    if (!clickable) return
    event.stopPropagation()
    setHoveredPart(id as Exclude<SurfaceKey, 'chassis'>)
  }

  const handleOut = (event: ThreeEvent<PointerEvent>) => {
    if (!clickable) return
    event.stopPropagation()
    setHoveredPart(null)
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!clickable) return
    event.stopPropagation()
    selectPart(activePart === id ? null : (id as Exclude<SurfaceKey, 'chassis'>))
  }

  return (
    <SurfaceContext.Provider value={surface}>
      <group
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        {children}
      </group>
    </SurfaceContext.Provider>
  )
}

export { PartInteractionContext }
