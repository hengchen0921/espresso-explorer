import { Surface, type FinishKey } from './Surface'
import { Part } from './Part'
import type { Vec3 } from '../types'

export type WandVariant = 'swivel' | 'commercial' | 'articulating' | 'panarello'

interface SteamWandProps {
  /** Position of the joint where the wand leaves the case. */
  position: Vec3
  length: number
  variant: WandVariant
  finish?: FinishKey
  /** Tilt away from vertical, radians. Larger swings the tip further forward. */
  tilt?: number
  /** Splay away from the machine's centreline, radians. */
  yaw?: number
}

/**
 * Steam arm. The variants are not cosmetic — a panarello's air-intake sleeve
 * and a bare commercial tip make measurably different milk, which is the whole
 * point of the hotspot copy for this part.
 */
export function SteamWand({
  position,
  length,
  variant,
  finish = 'chrome',
  tilt = 0.42,
  yaw = 0.12,
}: SteamWandProps) {
  const tubeRadius = variant === 'panarello' ? 0.0045 : 0.005
  const jointRadius = variant === 'articulating' ? 0.0105 : 0.0085

  return (
    <Part id="steam-wand" position={position}>
      {/* Collar where the arm passes through the case */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[jointRadius * 1.3, jointRadius * 1.3, 0.01, 20]} />
        <Surface finish={finish} />
      </mesh>

      {/* Ball joint */}
      <mesh>
        <sphereGeometry args={[jointRadius, 22, 18]} />
        <Surface finish={finish} />
      </mesh>

      <group rotation={[-tilt, yaw, 0]}>
        {/* Tube */}
        <mesh position={[0, -length / 2, 0]}>
          <cylinderGeometry args={[tubeRadius, tubeRadius, length, 18]} />
          <Surface finish={finish} />
        </mesh>

        {/* Insulating grip on machines that expect you to hold it */}
        {(variant === 'commercial' || variant === 'articulating') && (
          <mesh position={[0, -length * 0.34, 0]}>
            <cylinderGeometry args={[tubeRadius * 1.9, tubeRadius * 1.9, length * 0.3, 18]} />
            <Surface finish="darkPlastic" />
          </mesh>
        )}

        {/* Panarello sleeve, with its air intake hole */}
        {variant === 'panarello' && (
          <>
            <mesh position={[0, -length * 0.72, 0]}>
              <cylinderGeometry args={[0.0125, 0.0105, length * 0.5, 22]} />
              <Surface finish="darkPlastic" />
            </mesh>
            <mesh position={[0, -length * 0.52, 0.0105]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.0022, 0.0022, 0.006, 10]} />
              <Surface finish="black" />
            </mesh>
          </>
        )}

        {/* Tip */}
        <mesh position={[0, -length - 0.006, 0]}>
          <cylinderGeometry args={[tubeRadius * 1.5, tubeRadius * 1.1, 0.013, 16]} />
          <Surface finish={finish} />
        </mesh>
      </group>
    </Part>
  )
}
