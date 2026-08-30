import { RoundedBox } from '@react-three/drei'
import { Surface } from './Surface'
import { Part } from './Part'
import type { Vec3 } from '../types'

interface WaterTankProps {
  position: Vec3
  width: number
  height: number
  depth: number
  /**
   * Rear tanks are a visible module hanging off the back; top tanks sit under a
   * lifting lid; front tanks slide out through the face, which is the reason a
   * machine can live against a wall.
   */
  variant: 'rear' | 'top' | 'front'
  /** Fill level, 0–1. */
  level?: number
}

/** Translucent reservoir with a visible waterline and a lid or grab handle. */
export function WaterTank({
  position,
  width,
  height,
  depth,
  variant,
  level = 0.62,
}: WaterTankProps) {
  const waterHeight = height * level

  return (
    <Part id="water-reservoir" position={position}>
      <RoundedBox
        args={[width, height, depth]}
        radius={Math.min(0.008, depth / 2.4, height / 2.4)}
        smoothness={3}
        position={[0, height / 2, 0]}
      >
        <Surface finish="water" side="double" />
      </RoundedBox>

      {/* Water */}
      <mesh position={[0, waterHeight / 2, 0]}>
        <boxGeometry args={[width * 0.93, waterHeight, depth * 0.88]} />
        <Surface finish="water" color="#8fb6c4" opacity={0.52} />
      </mesh>

      {variant === 'front' && (
        <>
          {/* Grab recess moulded into the face you pull it out by */}
          <mesh position={[0, height * 0.55, depth / 2 + 0.002]}>
            <boxGeometry args={[width * 0.32, height * 0.16, 0.006]} />
            <Surface finish="black" />
          </mesh>
          <mesh position={[0, height + 0.004, 0]}>
            <boxGeometry args={[width * 0.99, 0.008, depth * 0.99]} />
            <Surface finish="black" />
          </mesh>
        </>
      )}

      {variant === 'rear' ? (
        <>
          {/* Lid */}
          <RoundedBox
            args={[width * 1.01, 0.012, depth * 1.02]}
            radius={0.004}
            smoothness={3}
            position={[0, height + 0.005, 0]}
          >
            <Surface finish="black" />
          </RoundedBox>
          {/* Grab tab */}
          <mesh position={[0, height + 0.016, -depth * 0.18]}>
            <boxGeometry args={[width * 0.3, 0.012, 0.008]} />
            <Surface finish="black" />
          </mesh>
        </>
      ) : variant === 'top' ? (
        /* Top-loading tanks show a folding handle instead of a lid */
        <mesh position={[0, height + 0.008, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[width * 0.26, 0.0032, 10, 28, Math.PI]} />
          <Surface finish="black" />
        </mesh>
      ) : null}
    </Part>
  )
}
