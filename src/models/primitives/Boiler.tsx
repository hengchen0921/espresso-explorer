import { RoundedBox } from '@react-three/drei'
import { Surface } from './Surface'
import { Part } from './Part'
import type { Vec3 } from '../types'

export type BoilerVariant = 'brass' | 'aluminium' | 'thermocoil' | 'thermojet' | 'thermoblock'

interface BoilerProps {
  position: Vec3
  variant: BoilerVariant
  /** Long axis of a tank boiler, or overall height of a flow heater. */
  size?: number
  radius?: number
}

/**
 * Lives inside the case and is only visible once selected, when the shell
 * turns to glass. The variants are deliberately distinguishable at a glance:
 * a brass tank reads as mass, a coil reads as flow-through.
 */
export function Boiler({ position, variant, size = 0.13, radius = 0.032 }: BoilerProps) {
  const isTank = variant === 'brass' || variant === 'aluminium'
  const finish = variant === 'brass' ? 'brass' : variant === 'aluminium' ? 'brushedSteel' : 'polishedSteel'

  return (
    <Part id="boiler" position={position}>
      {isTank && (
        <>
          {/* Horizontal tank, axis across the machine */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[radius, radius, size, 28]} />
            <Surface finish={finish} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[(side * size) / 2, 0, 0]} scale={[0.5, 1, 1]}>
              <sphereGeometry args={[radius, 24, 18]} />
              <Surface finish={finish} />
            </mesh>
          ))}
          {/* Inlet and outlet plumbing */}
          <mesh position={[size * 0.18, radius + 0.014, 0]}>
            <cylinderGeometry args={[0.0042, 0.0042, 0.03, 12]} />
            <Surface finish="polishedSteel" />
          </mesh>
          <mesh position={[-size * 0.22, -radius - 0.012, 0.01]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.0042, 0.0042, 0.026, 12]} />
            <Surface finish="polishedSteel" />
          </mesh>
          {/* Heating element boss */}
          <mesh position={[0, 0, radius * 0.92]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.012, 20]} />
            <Surface finish="black" />
          </mesh>
        </>
      )}

      {variant === 'thermocoil' && (
        <>
          <mesh>
            <cylinderGeometry args={[radius * 0.6, radius * 0.6, size, 24]} />
            <Surface finish="brushedSteel" />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[0, -size / 2 + 0.012 + i * (size / 6.6), 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius * 0.86, 0.0042, 10, 30]} />
              <Surface finish="copper" />
            </mesh>
          ))}
        </>
      )}

      {variant === 'thermojet' && (
        <>
          <RoundedBox args={[radius * 2.6, 0.016, radius * 1.4]} radius={0.004} smoothness={3} position={[0, size / 2, 0]}>
            <Surface finish="brushedSteel" />
          </RoundedBox>
          {[-1, 0, 1].map((slot) => (
            <mesh key={slot} position={[slot * radius * 0.86, 0, 0]}>
              <cylinderGeometry args={[radius * 0.34, radius * 0.34, size, 20]} />
              <Surface finish="polishedSteel" />
            </mesh>
          ))}
          <RoundedBox args={[radius * 2.6, 0.014, radius * 1.4]} radius={0.004} smoothness={3} position={[0, -size / 2, 0]}>
            <Surface finish="black" />
          </RoundedBox>
        </>
      )}

      {variant === 'thermoblock' && (
        <>
          <RoundedBox args={[radius * 1.5, size, radius * 1.5]} radius={0.005} smoothness={3}>
            <Surface finish="brushedSteel" />
          </RoundedBox>
          {Array.from({ length: 4 }, (_, i) => (
            <mesh
              key={i}
              position={[0, -size / 2 + 0.014 + i * (size / 4.6), radius * 0.78]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <torusGeometry args={[radius * 0.32, 0.0035, 8, 22, Math.PI]} />
              <Surface finish="copper" />
            </mesh>
          ))}
        </>
      )}
    </Part>
  )
}
