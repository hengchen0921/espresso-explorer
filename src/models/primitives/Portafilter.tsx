import { Surface, type FinishKey } from './Surface'
import { Spouts } from './Details'
import { Part } from './Part'
import type { Vec3 } from '../types'

interface PortafilterProps {
  position: Vec3
  /** Basket radius in metres — 58 mm ≈ 0.029. */
  radius: number
  handleLength: number
  finish?: FinishKey
  handleFinish?: FinishKey
  /** Bottomless portafilters have none; most ship with two. */
  spouts?: 0 | 1 | 2
  /** Downward tilt of the handle, radians. */
  handleTilt?: number
}

/** Basket, ears, spouts and handle, locked into the group head. */
export function Portafilter({
  position,
  radius,
  handleLength,
  finish = 'chrome',
  handleFinish = 'darkPlastic',
  spouts = 2,
  handleTilt = 0.13,
}: PortafilterProps) {
  const bodyHeight = radius * 1.05
  const handleRadius = 0.0097

  return (
    <Part id="portafilter" position={position}>
      {/* Locking collar */}
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[radius * 1.14, radius * 1.14, 0.011, 32]} />
        <Surface finish={finish} />
      </mesh>

      {/* Basket housing */}
      <mesh position={[0, -0.005 - bodyHeight / 2, 0]}>
        <cylinderGeometry args={[radius * 1.06, radius * 0.9, bodyHeight, 32]} />
        <Surface finish={finish} />
      </mesh>

      {/* Coffee bed, visible through the top of the basket */}
      <mesh position={[0, -0.008, 0]}>
        <cylinderGeometry args={[radius * 0.92, radius * 0.92, 0.004, 28]} />
        <Surface finish="darkPlastic" color="#3a251a" roughness={0.95} />
      </mesh>

      {/* Ears that engage the group flange */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * radius * 1.2, -0.005, 0]}>
          <boxGeometry args={[radius * 0.22, 0.011, radius * 0.5]} />
          <Surface finish={finish} />
        </mesh>
      ))}

      {spouts > 0 && (
        <Spouts position={[0, -0.005 - bodyHeight - 0.006, 0]} radius={radius} finish={finish} />
      )}

      {/* Handle */}
      <group rotation={[handleTilt, 0, 0]}>
        <mesh
          position={[0, -0.012, radius * 1.1 + handleLength / 2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[handleRadius * 0.82, handleRadius, handleLength, 20]} />
          <Surface finish={handleFinish} />
        </mesh>
        {/* Ferrule where handle meets basket */}
        <mesh position={[0, -0.01, radius * 1.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[handleRadius * 1.25, handleRadius * 1.25, 0.014, 20]} />
          <Surface finish={finish} />
        </mesh>
        {/* End cap */}
        <mesh position={[0, -0.0135, radius * 1.1 + handleLength]}>
          <sphereGeometry args={[handleRadius * 0.86, 20, 16]} />
          <Surface finish={handleFinish} />
        </mesh>
      </group>
    </Part>
  )
}
