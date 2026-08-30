import { Surface, type FinishKey } from './Surface'
import { TrimRing } from './Details'
import { Part } from './Part'
import type { Vec3 } from '../types'

interface GroupHeadProps {
  position: Vec3
  /** Outer radius of the group body in metres. */
  radius: number
  /** How far the group hangs below the body it is mounted to. */
  drop: number
  finish?: FinishKey
  /** Commercial groups carry visible mounting bolts and a heavier flange. */
  commercial?: boolean
}

/** The fixed brewing chamber: body, locking flange, dispersion screen. */
export function GroupHead({
  position,
  radius,
  drop,
  finish = 'chrome',
  commercial = false,
}: GroupHeadProps) {
  const bolts = commercial ? 6 : 0

  return (
    <Part id="group-head" position={position}>
      {/* Body */}
      <mesh position={[0, drop / 2, 0]}>
        <cylinderGeometry args={[radius * 0.97, radius * 0.99, drop, 32]} />
        <Surface finish={finish} />
      </mesh>

      {/* Locking flange the portafilter twists into */}
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[radius * 1.06, radius * 1.06, 0.009, 32]} />
        <Surface finish={finish} />
      </mesh>

      {/* Dispersion screen, recessed inside the flange */}
      <mesh position={[0, 0.0022, 0]}>
        <cylinderGeometry args={[radius * 0.78, radius * 0.78, 0.002, 28]} />
        <Surface finish="polishedSteel" roughness={0.55} grain="none" />
      </mesh>

      {/* Chromed trim ring: the catch light that reads as a machined part */}
      <TrimRing position={[0, 0.0085, 0]} radius={radius * 1.06} thickness={0.0026} />

      {/* Commercial groups carry a squat mounting boss, not a wider cap —
          keeping it inside the body radius avoids a mushroom silhouette. */}
      {commercial && (
        <mesh position={[0, drop + 0.006, 0]}>
          <cylinderGeometry args={[radius * 0.98, radius * 1.02, 0.013, 32]} />
          <Surface finish={finish} />
        </mesh>
      )}

      {Array.from({ length: bolts }, (_, i) => {
        const angle = (i / bolts) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius * 0.8, drop + 0.013, Math.sin(angle) * radius * 0.8]}
          >
            <cylinderGeometry args={[0.0038, 0.0038, 0.006, 8]} />
            <Surface finish="polishedSteel" />
          </mesh>
        )
      })}
    </Part>
  )
}
