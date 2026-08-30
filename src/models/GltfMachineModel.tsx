import { useCallback, useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { Color, Mesh, MeshStandardMaterial, type Object3D } from 'three'
import type { PartId } from '@/data/types'
import { usePartInteraction } from './PartContext'
import type { ModelSource } from './types'

type GltfSource = Extract<ModelSource, { kind: 'gltf' }>

const ACCENT = new Color('#c15a2b')
const DIM_TARGET = new Color('#2a221d')

interface OriginalMaterialState {
  color: Color
  emissive: Color
  emissiveIntensity: number
  opacity: number
  transparent: boolean
}

/**
 * Renders a real `.glb` with the same selection, dimming and x-ray behaviour
 * the primitive models get from `<Part>` and `<Surface>`.
 *
 * Because a loaded scene graph cannot be wrapped in React components, part
 * state is applied by mutating the cloned materials directly. The mapping from
 * node name to part id lives in the registry entry, so a new asset is a data
 * change rather than a code change.
 */
export function GltfMachineModel({ source }: { source: GltfSource }) {
  const { scene } = useGLTF(source.url)
  const { activePart, hoveredPart, setHoveredPart, selectPart, xray, interactive } =
    usePartInteraction()

  // Clone the scene and its materials so several instances (the comparison
  // view renders three at once) never fight over the same material objects.
  const model = useMemo(() => {
    const copy = scene.clone(true)
    copy.traverse((node) => {
      if (node instanceof Mesh && node.material instanceof MeshStandardMaterial) {
        node.material = node.material.clone()
      }
    })
    return copy
  }, [scene])

  const originals = useMemo(() => {
    const map = new Map<string, OriginalMaterialState>()
    model.traverse((node) => {
      if (node instanceof Mesh && node.material instanceof MeshStandardMaterial) {
        map.set(node.uuid, {
          color: node.material.color.clone(),
          emissive: node.material.emissive.clone(),
          emissiveIntensity: node.material.emissiveIntensity,
          opacity: node.material.opacity,
          transparent: node.material.transparent,
        })
      }
    })
    return map
  }, [model])

  const partOf = useCallback(
    (object: Object3D | null): PartId | null => {
      let node: Object3D | null = object
      while (node) {
        const match = source.partNodes[node.name]
        if (match) return match
        node = node.parent
      }
      return null
    },
    [source.partNodes],
  )

  useEffect(() => {
    model.traverse((node) => {
      if (!(node instanceof Mesh) || !(node.material instanceof MeshStandardMaterial)) return
      const base = originals.get(node.uuid)
      if (!base) return

      const partId = partOf(node)
      const material = node.material

      material.color.copy(base.color)
      material.emissive.copy(base.emissive)
      material.emissiveIntensity = base.emissiveIntensity
      material.opacity = base.opacity
      material.transparent = base.transparent
      material.depthWrite = true

      if (!partId) {
        // Structural geometry: dim with the rest, turn to glass under x-ray.
        if (xray) {
          material.transparent = true
          material.opacity = 0.11
          material.depthWrite = false
        } else if (activePart) {
          material.color.lerp(DIM_TARGET, 0.58)
        }
        return
      }

      if (activePart === partId) {
        material.emissive.copy(ACCENT)
        material.emissiveIntensity = 0.38
      } else if (activePart) {
        material.color.lerp(DIM_TARGET, 0.58)
        material.emissiveIntensity = base.emissiveIntensity * 0.2
      } else if (hoveredPart === partId) {
        material.emissive.copy(ACCENT)
        material.emissiveIntensity = 0.15
      }
    })
  }, [model, originals, partOf, activePart, hoveredPart, xray])

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive) return
    const partId = partOf(event.object)
    if (!partId) return
    event.stopPropagation()
    setHoveredPart(partId)
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!interactive) return
    const partId = partOf(event.object)
    if (!partId) return
    event.stopPropagation()
    selectPart(activePart === partId ? null : partId)
  }

  return (
    <primitive
      object={model}
      scale={source.scale ?? 1}
      position={source.position ?? [0, 0, 0]}
      rotation={source.rotation ?? [0, 0, 0]}
      onPointerOver={handleOver}
      onPointerOut={() => interactive && setHoveredPart(null)}
      onClick={handleClick}
    />
  )
}
