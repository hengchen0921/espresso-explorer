import { Surface } from './Surface'
import { Part } from './Part'
import type { Vec3 } from '../types'

interface BeanHopperProps {
  position: Vec3
  height: number
  topRadius: number
  bottomRadius: number
  /** Grind adjustment collar sitting under the hopper. */
  collar?: boolean
}

/** Deterministic bean scatter — a seeded look without a random call that would
 *  reshuffle on every re-render. */
const BEAN_OFFSETS: Array<[number, number, number]> = [
  [0.2, 0.62, -0.1], [-0.35, 0.5, 0.24], [0.42, 0.38, 0.3], [-0.12, 0.34, -0.4],
  [0.05, 0.55, 0.42], [-0.48, 0.28, -0.16], [0.3, 0.22, -0.34], [-0.2, 0.44, 0.05],
  [0.46, 0.5, -0.28], [-0.4, 0.6, -0.36], [0.14, 0.28, 0.16], [-0.06, 0.18, -0.06],
]

export function BeanHopper({
  position,
  height,
  topRadius,
  bottomRadius,
  collar = true,
}: BeanHopperProps) {
  return (
    <Part id="grinder" position={position}>
      {/* Hopper cone */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[topRadius, bottomRadius, height, 32, 1, true]} />
        <Surface finish="water" color="#d8d2c6" opacity={0.28} side="double" />
      </mesh>

      {/* Beans */}
      {BEAN_OFFSETS.map(([x, y, z], i) => (
        <mesh
          key={i}
          position={[x * topRadius, height * (0.18 + y * 0.6), z * topRadius]}
          rotation={[x * 3, y * 4, z * 2]}
          scale={[1, 0.72, 0.86]}
        >
          <sphereGeometry args={[0.0042, 10, 8]} />
          <Surface finish="darkPlastic" color="#4a2c17" roughness={0.72} />
        </mesh>
      ))}

      {/* Lid */}
      <mesh position={[0, height + 0.004, 0]}>
        <cylinderGeometry args={[topRadius * 1.05, topRadius * 1.02, 0.009, 32]} />
        <Surface finish="black" />
      </mesh>

      {collar && (
        <>
          {/* Grind size adjustment collar */}
          <mesh position={[0, -0.008, 0]}>
            <cylinderGeometry args={[bottomRadius * 1.5, bottomRadius * 1.5, 0.016, 32]} />
            <Surface finish="brushedSteel" />
          </mesh>
          {/* Index mark */}
          <mesh position={[0, -0.008, bottomRadius * 1.5]}>
            <boxGeometry args={[0.0035, 0.009, 0.002]} />
            <Surface finish="copper" />
          </mesh>
          {/* Burr housing */}
          <mesh position={[0, -0.024, 0]}>
            <cylinderGeometry args={[bottomRadius * 1.25, bottomRadius * 1.05, 0.018, 28]} />
            <Surface finish="black" />
          </mesh>
        </>
      )}
    </Part>
  )
}
