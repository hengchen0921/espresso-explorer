import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'
import { Surface, type FinishKey } from './Surface'
import type { Vec3 } from '../types'

/**
 * Small features that separate "a box" from "a product".
 *
 * None of these are load-bearing to the explanation — they exist because real
 * appliances are assemblies, and the eye reads shut lines, fasteners, trim and
 * a trailing cable as manufacturing long before it reads proportions.
 */

interface GrooveProps {
  position: Vec3
  length: number
  axis?: 'x' | 'y' | 'z'
  thickness?: number
  depth?: number
}

/** A panel shut line. Dark, thin, and always slightly proud so it z-fights nothing. */
export function Groove({ position, length, axis = 'x', thickness = 0.0018, depth = 0.0022 }: GrooveProps) {
  const size: Vec3 =
    axis === 'x'
      ? [length, thickness, depth]
      : axis === 'y'
        ? [thickness, length, depth]
        : [depth, thickness, length]

  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <Surface finish="darkPlastic" color="#0c0a0b" grain="none" />
    </mesh>
  )
}

interface FasciaProps {
  position: Vec3
  width: number
  height: number
  finish?: FinishKey
  /** How far the plate stands proud of the case. */
  relief?: number
  radius?: number
}

/** A recessed or proud front plate — the fascia most machines carry their
 *  controls on, and the fastest way to stop a front face reading as a slab. */
export function Fascia({ position, width, height, finish = 'graphite', relief = 0.003, radius = 0.004 }: FasciaProps) {
  return (
    <group position={position}>
      <RoundedBox
        args={[width, height, relief]}
        radius={Math.min(radius, relief / 2.2, height / 2.4)}
        smoothness={3}
      >
        <Surface finish={finish} />
      </RoundedBox>
      {/* Shadow gap around the plate */}
      <Groove position={[0, height / 2 + 0.001, relief / 2]} length={width} axis="x" />
      <Groove position={[0, -height / 2 - 0.001, relief / 2]} length={width} axis="x" />
    </group>
  )
}

interface VentsProps {
  position: Vec3
  count: number
  length: number
  spacing: number
  /** Slots run along this axis; they are distributed along the other. */
  axis?: 'x' | 'z'
}

export function Vents({ position, count, length, spacing, axis = 'x' }: VentsProps) {
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => {
        const offset = (i - (count - 1) / 2) * spacing
        return (
          <mesh key={i} position={axis === 'x' ? [0, 0, offset] : [offset, 0, 0]}>
            <boxGeometry
              args={axis === 'x' ? [length, 0.0025, 0.0035] : [0.0035, 0.0025, length]}
            />
            <Surface finish="darkPlastic" color="#0a0809" grain="none" />
          </mesh>
        )
      })}
    </group>
  )
}

interface BadgeProps {
  position: Vec3
  width: number
  height?: number
  finish?: FinishKey
}

/** Brand plate. Abstract rather than lettered — 3D text needs a font payload
 *  and reads worse than a well-placed rectangle at this scale. */
export function Badge({ position, width, height = 0.005, finish = 'polishedSteel' }: BadgeProps) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, height, 0.0012]} />
        <Surface finish={finish} roughness={0.28} grain="none" />
      </mesh>
      <mesh position={[0, -height * 1.9, 0]}>
        <boxGeometry args={[width * 0.58, height * 0.6, 0.001]} />
        <Surface finish={finish} roughness={0.42} grain="none" />
      </mesh>
    </group>
  )
}

interface TrimRingProps {
  position: Vec3
  radius: number
  thickness?: number
  finish?: FinishKey
  /** Rings on a vertical axis (around a group head) vs facing the viewer. */
  axis?: 'y' | 'z'
}

export function TrimRing({ position, radius, thickness = 0.0035, finish = 'chrome', axis = 'y' }: TrimRingProps) {
  return (
    <mesh position={position} rotation={axis === 'y' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
      <torusGeometry args={[radius, thickness, 12, 40]} />
      <Surface finish={finish} grain="none" />
    </mesh>
  )
}

interface CupRailProps {
  position: Vec3
  width: number
  depth: number
  bars?: number
  finish?: FinishKey
}

/** Raised rails on the lid that cups stand on. */
export function CupRail({ position, width, depth, bars = 3, finish = 'polishedSteel' }: CupRailProps) {
  return (
    <group position={position}>
      {Array.from({ length: bars }, (_, i) => {
        const x = (i - (bars - 1) / 2) * (width / bars)
        return (
          <mesh key={i} position={[x, 0.0025, 0]}>
            <boxGeometry args={[width / (bars * 2.6), 0.005, depth]} />
            <Surface finish={finish} />
          </mesh>
        )
      })}
      {/* Recessed well the rails sit in */}
      <mesh position={[0, -0.0004, 0]}>
        <boxGeometry args={[width * 1.12, 0.002, depth * 1.1]} />
        <Surface finish="darkPlastic" color="#171417" />
      </mesh>
    </group>
  )
}

interface PowerCordProps {
  /** Where the cord leaves the case. */
  from: Vec3
  /** Where it reaches the counter, usually behind and to one side. */
  to: Vec3
  radius?: number
}

export function PowerCord({ from, to, radius = 0.0035 }: PowerCordProps) {
  const curve = useMemo(() => {
    const start = new Vector3(...from)
    const end = new Vector3(...to)
    const mid = start.clone().lerp(end, 0.55)
    // Cables sag and kick outward rather than running straight.
    mid.y = Math.min(start.y, end.y) + 0.012
    mid.z -= 0.03
    return new CatmullRomCurve3([start, start.clone().add(new Vector3(0, -0.01, -0.02)), mid, end])
  }, [from, to])

  return (
    <mesh>
      <tubeGeometry args={[curve, 28, radius, 10, false]} />
      <Surface finish="darkPlastic" color="#131113" />
    </mesh>
  )
}

interface SpoutsProps {
  position: Vec3
  /** Basket radius, used to space the outlets. */
  radius: number
  finish?: FinishKey
}

/** Chromed twin spout body under a portafilter. */
export function Spouts({ position, radius, finish = 'chrome' }: SpoutsProps) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[radius * 0.62, radius * 0.42, 0.016, 20]} />
        <Surface finish={finish} grain="none" />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * radius * 0.34, -0.012, 0]}>
          <mesh>
            <cylinderGeometry args={[0.0042, 0.0032, 0.012, 12]} />
            <Surface finish={finish} grain="none" />
          </mesh>
          <mesh position={[0, -0.007, 0]}>
            <cylinderGeometry args={[0.0022, 0.0022, 0.004, 10]} />
            <Surface finish="darkPlastic" grain="none" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

interface ScrewProps {
  position: Vec3
  radius?: number
  axis?: 'y' | 'z'
}

export function Screw({ position, radius = 0.0022, axis = 'z' }: ScrewProps) {
  return (
    <group position={position} rotation={axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.0014, 12]} />
        <Surface finish="polishedSteel" roughness={0.35} grain="none" />
      </mesh>
      <mesh position={[0, 0.0009, 0]}>
        <boxGeometry args={[radius * 1.5, 0.0006, radius * 0.32]} />
        <Surface finish="darkPlastic" grain="none" />
      </mesh>
    </group>
  )
}
