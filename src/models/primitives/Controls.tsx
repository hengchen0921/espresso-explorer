import { RoundedBox } from '@react-three/drei'
import { Surface, type FinishKey } from './Surface'
import type { Vec3 } from '../types'

/**
 * Front-panel building blocks. Unlike the other primitives these are not
 * wrapped in a `<Part>` — machines group them under whichever component they
 * belong to, because a grind dial is part of the grinder and a brew switch is
 * part of the controls.
 */

interface PressureGaugeProps {
  position: Vec3
  radius: number
  /** Needle deflection, 0 (rest) to 1 (full scale). */
  reading?: number
}

export function PressureGauge({ position, radius, reading = 0.68 }: PressureGaugeProps) {
  const sweep = Math.PI * 1.35
  const angle = Math.PI * 0.68 - reading * sweep

  return (
    <group position={position}>
      {/* Bezel */}
      <mesh>
        <torusGeometry args={[radius, radius * 0.13, 12, 40]} />
        <Surface finish="polishedSteel" />
      </mesh>
      {/* Face */}
      <mesh position={[0, 0, -0.001]}>
        <circleGeometry args={[radius * 0.96, 40]} />
        <Surface finish="gaugeFace" />
      </mesh>
      {/* Optimum-extraction band */}
      <mesh position={[0, 0, 0.0005]} rotation={[0, 0, Math.PI * 0.28]}>
        <ringGeometry args={[radius * 0.66, radius * 0.86, 32, 1, 0, Math.PI * 0.42]} />
        <Surface finish="copper" metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Ticks */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI * 0.68 - (i / 8) * sweep
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * radius * 0.76, Math.sin(a) * radius * 0.76, 0.0012]}
            rotation={[0, 0, a]}
          >
            <boxGeometry args={[radius * 0.16, radius * 0.045, 0.0008]} />
            <Surface finish="black" metalness={0} roughness={0.9} />
          </mesh>
        )
      })}
      {/* Needle */}
      <group rotation={[0, 0, angle]}>
        <mesh position={[radius * 0.35, 0, 0.0022]}>
          <boxGeometry args={[radius * 0.78, radius * 0.055, 0.0012]} />
          <Surface finish="copper" metalness={0.15} roughness={0.55} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.003]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.1, radius * 0.1, 0.003, 14]} />
        <Surface finish="black" />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.004]}>
        <circleGeometry args={[radius * 0.94, 40]} />
        <Surface finish="water" opacity={0.16} />
      </mesh>
    </group>
  )
}

interface LcdPanelProps {
  position: Vec3
  width: number
  height: number
}

export function LcdPanel({ position, width, height }: LcdPanelProps) {
  return (
    <group position={position}>
      <RoundedBox args={[width, height, 0.008]} radius={0.003} smoothness={3}>
        <Surface finish="black" />
      </RoundedBox>
      <mesh position={[0, 0, 0.0046]}>
        <planeGeometry args={[width * 0.86, height * 0.74]} />
        <Surface finish="screen" />
      </mesh>
      {/* Readout rules, so the panel scans as a display rather than a colour swatch */}
      {[0.16, 0].map((y, i) => (
        <mesh key={y} position={[-width * 0.16, height * y, 0.0049]}>
          <planeGeometry args={[width * (i === 0 ? 0.4 : 0.26), height * 0.06]} />
          <Surface finish="screen" color="#0d3427" />
        </mesh>
      ))}
      {/* Shot-timer bars */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * width * 0.2, -height * 0.2, 0.005]}>
          <planeGeometry args={[width * 0.12, height * 0.07]} />
          <Surface finish="led" />
        </mesh>
      ))}
    </group>
  )
}

interface RockerSwitchProps {
  position: Vec3
  width?: number
  height?: number
  lit?: boolean
}

export function RockerSwitch({ position, width = 0.02, height = 0.026, lit = false }: RockerSwitchProps) {
  return (
    <group position={position}>
      <RoundedBox args={[width * 1.24, height * 1.16, 0.006]} radius={0.0015} smoothness={3}>
        <Surface finish="black" />
      </RoundedBox>
      <RoundedBox
        args={[width, height, 0.007]}
        radius={0.0015}
        smoothness={3}
        position={[0, 0, 0.003]}
        rotation={[0.16, 0, 0]}
      >
        <Surface finish="plastic" />
      </RoundedBox>
      {/* Illuminated switches show a lens, not a glowing cap */}
      {lit && (
        <mesh position={[0, -height * 0.22, 0.0075]}>
          <planeGeometry args={[width * 0.56, height * 0.2]} />
          <Surface finish="led" />
        </mesh>
      )}
    </group>
  )
}

interface RoundButtonProps {
  position: Vec3
  radius?: number
  lit?: boolean
  finish?: FinishKey
}

export function RoundButton({ position, radius = 0.009, lit = false, finish = 'polishedSteel' }: RoundButtonProps) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 1.24, radius * 1.24, 0.004, 24]} />
        <Surface finish="black" />
      </mesh>
      <mesh position={[0, 0, 0.003]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, 0.005, 24]} />
        <Surface finish={finish} />
      </mesh>
      {lit && (
        <mesh position={[0, 0, 0.0058]}>
          <circleGeometry args={[radius * 0.52, 20]} />
          <Surface finish="led" />
        </mesh>
      )}
    </group>
  )
}

interface SteamKnobProps {
  position: Vec3
  radius?: number
  /** Knobs on the side of the case point along X instead of Z. */
  axis?: 'z' | 'x'
}

export function SteamKnob({ position, radius = 0.014, axis = 'z' }: SteamKnobProps) {
  const rotation: Vec3 = axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2]

  return (
    <group position={position}>
      <mesh rotation={rotation}>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.014, 16]} />
        <Surface finish="polishedSteel" />
      </mesh>
      <mesh rotation={rotation} position={axis === 'z' ? [0, 0, 0.009] : [0.009, 0, 0]}>
        <cylinderGeometry args={[radius, radius * 0.86, 0.011, 6]} />
        <Surface finish="black" />
      </mesh>
    </group>
  )
}

interface PanelPlateProps {
  position: Vec3
  width: number
  height: number
  finish?: FinishKey
  depth?: number
}

/** Slightly proud plate used to group switches into a real control cluster. */
export function PanelPlate({ position, width, height, finish = 'graphite', depth = 0.005 }: PanelPlateProps) {
  return (
    <RoundedBox args={[width, height, depth]} radius={0.0025} smoothness={3} position={position}>
      <Surface finish={finish} />
    </RoundedBox>
  )
}

interface GrindDialProps {
  position: Vec3
  radius?: number
}

/** Side-mounted grind size collar on the Breville machines. */
export function GrindDial({ position, radius = 0.026 }: GrindDialProps) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.012, 30]} />
        <Surface finish="brushedSteel" />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * radius, 0.007, Math.sin(a) * radius]}>
            <boxGeometry args={[0.0022, 0.002, 0.0055]} />
            <Surface finish="black" />
          </mesh>
        )
      })}
      <mesh position={[0, 0.007, 0]}>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.004, 20]} />
        <Surface finish="black" />
      </mesh>
    </group>
  )
}
