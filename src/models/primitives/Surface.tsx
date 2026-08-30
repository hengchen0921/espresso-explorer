import { useMemo } from 'react'
import { BackSide, Color, DoubleSide, FrontSide } from 'three'
import { useSurfaceContext } from '../PartContext'
import { surfaceMaps, type SurfaceMapKind } from './textures'

interface FinishSpec {
  color: string
  metalness: number
  roughness: number
  opacity?: number
  emissive?: string
  emissiveIntensity?: number
  env?: number
  /** Procedural grain applied as roughness + normal maps. */
  grain?: SurfaceMapKind
}

/**
 * The whole material vocabulary of the app. Every mesh in every machine picks
 * one of these, which is what keeps five independently-modelled machines
 * looking like they were photographed on the same set.
 */
const FINISH_TABLE = {
  brushedSteel: { color: '#c8ccce', metalness: 0.76, roughness: 0.38, env: 1.4, grain: 'brushed' },
  polishedSteel: { color: '#dadee0', metalness: 0.82, roughness: 0.22, env: 1.5, grain: 'brushed' },
  chrome: { color: '#e4e8ea', metalness: 0.88, roughness: 0.16, env: 1.7 },
  graphite: { color: '#2d2b2f', metalness: 0.62, roughness: 0.4, env: 0.9, grain: 'grain' },
  black: { color: '#1a181a', metalness: 0.35, roughness: 0.52, env: 0.8, grain: 'grain' },
  plastic: { color: '#242123', metalness: 0.04, roughness: 0.76, env: 0.5, grain: 'grain' },
  darkPlastic: { color: '#131113', metalness: 0.04, roughness: 0.86, env: 0.4, grain: 'grain' },
  brass: { color: '#b08c56', metalness: 0.86, roughness: 0.3, env: 1.35, grain: 'brushed' },
  copper: { color: '#c15a2b', metalness: 0.7, roughness: 0.34, env: 1 },
  rubber: { color: '#0f0e0f', metalness: 0, roughness: 0.95, env: 0.3 },
  water: { color: '#cfe1e5', metalness: 0.05, roughness: 0.08, opacity: 0.3, env: 1.4 },
  gaugeFace: { color: '#f0ebe1', metalness: 0, roughness: 0.68, env: 0.6 },
  screen: {
    color: '#08120f',
    metalness: 0.25,
    roughness: 0.12,
    emissive: '#17453a',
    emissiveIntensity: 0.5,
    env: 0.8,
  },
  led: {
    color: '#c15a2b',
    metalness: 0,
    roughness: 0.4,
    emissive: '#c15a2b',
    emissiveIntensity: 1.1,
    env: 0.4,
  },
} satisfies Record<string, FinishSpec>

export type FinishKey = keyof typeof FINISH_TABLE

/** Dimmed parts fall toward the stage colour rather than fading out — no
 *  transparency means no sorting artefacts on a scene this reflective. */
const DIM_TARGET = new Color('#2a221d')
const ACCENT = new Color('#c15a2b')

interface SurfaceProps {
  finish: FinishKey
  /** Per-mesh override, e.g. one panel in a different shade of the same metal. */
  color?: string
  roughness?: number
  metalness?: number
  opacity?: number
  /** Render the inside of the shell too, so x-ray views read as hollow. */
  side?: 'front' | 'double' | 'back'
  /** Opt a mesh out of the finish's default grain (small parts, thin trim). */
  grain?: SurfaceMapKind | 'none'
}

export function Surface({ finish, color, roughness, metalness, opacity, side, grain }: SurfaceProps) {
  const { state, xray, key } = useSurfaceContext()
  const isShell = key === 'chassis'

  const material = useMemo(() => {
    const base: FinishSpec = FINISH_TABLE[finish]
    const tint = new Color(color ?? base.color)
    const emissive = new Color(base.emissive ?? '#000000')

    let emissiveIntensity = base.emissive ? (base.emissiveIntensity ?? 1) : 0
    let rough = roughness ?? base.roughness
    let metal = metalness ?? base.metalness
    let env = base.env ?? 1
    let alpha = opacity ?? base.opacity ?? 1

    switch (state) {
      case 'dim':
        tint.lerp(DIM_TARGET, 0.58)
        rough = Math.min(1, rough + 0.16)
        metal = Math.max(0, metal - 0.22)
        env *= 0.45
        emissiveIntensity *= 0.2
        break
      case 'active':
        tint.lerp(ACCENT, 0.1)
        emissive.copy(ACCENT)
        emissiveIntensity = 0.38
        env *= 1.15
        break
      case 'hover':
        emissive.copy(ACCENT)
        emissiveIntensity = 0.15
        break
      case 'idle':
        break
    }

    // Cutaway: only the outer shell turns to glass, so the internals it hides
    // stay fully lit and legible.
    if (xray && isShell) {
      alpha = 0.11
      rough = 0.08
      metal = 0.1
      env = 1.6
    }

    return { tint, emissive, emissiveIntensity, rough, metal, env, alpha }
  }, [finish, color, roughness, metalness, opacity, state, xray, isShell])

  // Texture instances are shared singletons; only the reference changes here.
  const base: FinishSpec = FINISH_TABLE[finish]
  const grainKind = grain === 'none' ? undefined : (grain ?? base.grain)
  const maps = grainKind ? surfaceMaps(grainKind) : undefined

  const transparent = material.alpha < 1
  const resolvedSide =
    side === 'double' || (xray && isShell) ? DoubleSide : side === 'back' ? BackSide : FrontSide

  return (
    <meshStandardMaterial
      color={material.tint}
      emissive={material.emissive}
      emissiveIntensity={material.emissiveIntensity}
      metalness={material.metal}
      roughness={material.rough}
      envMapIntensity={material.env}
      roughnessMap={maps?.roughnessMap}
      normalMap={maps?.normalMap}
      normalScale={maps?.normalScale}
      transparent={transparent}
      opacity={material.alpha}
      depthWrite={!transparent}
      side={resolvedSide}
    />
  )
}
