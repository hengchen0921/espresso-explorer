import { RoundedBox } from '@react-three/drei'
import { Surface, type FinishKey } from './Surface'
import { Part } from './Part'
import type { Vec3 } from '../types'

interface DripTrayProps {
  position: Vec3
  width: number
  depth: number
  height: number
  finish?: FinishKey
  /** Pop-up "empty me" indicator. */
  float?: boolean
  slats?: number
}

/** Removable tray with a slotted grate — and, on machines that have one, the
 *  float that rises through the grate when it is full. */
export function DripTray({
  position,
  width,
  depth,
  height,
  finish = 'polishedSteel',
  float = false,
  slats = 11,
}: DripTrayProps) {
  const grateY = height
  const slatWidth = (width * 0.9) / (slats * 1.7)

  return (
    <Part id="drip-tray" position={position}>
      {/* Tray body */}
      <RoundedBox
        args={[width, height, depth]}
        radius={Math.min(0.006, height / 2.4)}
        smoothness={3}
        position={[0, height / 2, 0]}
      >
        <Surface finish={finish} />
      </RoundedBox>

      {/* Recessed well, so the tray does not read as a solid block */}
      <mesh position={[0, height - 0.003, 0]}>
        <boxGeometry args={[width * 0.9, 0.004, depth * 0.86]} />
        <Surface finish="darkPlastic" />
      </mesh>

      {/* Raised front lip — the pressed edge every stainless tray has */}
      <mesh position={[0, height * 0.66, depth / 2 - 0.002]}>
        <boxGeometry args={[width, height * 0.36, 0.005]} />
        <Surface finish={finish} />
      </mesh>

      {/* Grate frame */}
      <mesh position={[0, grateY + 0.002, 0]}>
        <boxGeometry args={[width * 0.94, 0.004, depth * 0.9]} />
        <Surface finish="black" />
      </mesh>

      {/* Chromed grate surround, front and back */}
      {[depth * 0.44, -depth * 0.44].map((z) => (
        <mesh key={z} position={[0, grateY + 0.005, z]}>
          <boxGeometry args={[width * 0.94, 0.005, 0.006]} />
          <Surface finish={finish} roughness={0.3} />
        </mesh>
      ))}

      {/* Slats */}
      {Array.from({ length: slats }, (_, i) => {
        const x = (i / (slats - 1) - 0.5) * width * 0.86
        return (
          <mesh key={i} position={[x, grateY + 0.005, 0]}>
            <boxGeometry args={[slatWidth, 0.0035, depth * 0.84]} />
            <Surface finish={finish} roughness={0.5} />
          </mesh>
        )
      })}

      {float && (
        <mesh position={[0, grateY + 0.012, depth * 0.24]}>
          <cylinderGeometry args={[0.005, 0.005, 0.016, 14]} />
          <Surface finish="copper" />
        </mesh>
      )}
    </Part>
  )
}
