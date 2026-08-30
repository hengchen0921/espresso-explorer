import { RoundedBox } from '@react-three/drei'
import { Surface, type FinishKey } from './Surface'
import { Part } from './Part'

interface ShellProps {
  /** Overall case dimensions in metres. */
  width: number
  depth: number
  height: number
  /** The brewing recess cut out of the front bottom, where the cup goes. */
  alcoveHeight: number
  alcoveDepth: number
  /**
   * Depth of the upper body. Leave short of `depth` on machines whose water
   * tank is a visible module hanging off the back.
   */
  bodyDepth?: number
  finish: FinishKey
  /** Machines with a contrasting top panel (Silvia's black cap, Breville's lid). */
  topFinish?: FinishKey
  topPanelHeight?: number
  radius?: number
  /**
   * Width of the side panels that continue down past the brew recess. Real
   * machines are not undercut across their whole width — the recess is a notch
   * in the front, and the flanks run to the counter. Set to 0 for a machine
   * whose lower front really is all drip tray.
   */
  cheekWidth?: number
}

/**
 * The case: upper body, the plinth beneath the brew recess, feet, and an
 * optional contrasting top panel. Always `chassis`, so it dims when a
 * component is selected and turns to glass when an internal one is.
 */
export function Shell({
  width,
  depth,
  height,
  alcoveHeight,
  alcoveDepth,
  bodyDepth,
  finish,
  topFinish,
  topPanelHeight = 0.012,
  radius = 0.012,
  cheekWidth = 0.011,
}: ShellProps) {
  const upperDepth = bodyDepth ?? depth
  const frontZ = depth / 2
  const upperHeight = height - alcoveHeight
  const upperY = alcoveHeight + upperHeight / 2
  const upperZ = frontZ - upperDepth / 2

  const cheek = Math.min(cheekWidth, width / 6)
  const baseWidth = width - cheek * 2
  const baseDepth = depth - alcoveDepth
  const baseZ = -alcoveDepth / 2

  const safeRadius = Math.min(radius, upperHeight / 2.2, width / 2.2, upperDepth / 2.2)
  const footInset = 0.026

  return (
    <Part id="chassis">
      {/* Main body */}
      <RoundedBox
        args={[width, upperHeight, upperDepth]}
        radius={safeRadius}
        smoothness={4}
        creaseAngle={0.5}
        position={[0, upperY, upperZ]}
      >
        <Surface finish={finish} />
      </RoundedBox>

      {/* Plinth behind the brew recess */}
      <RoundedBox
        args={[baseWidth, alcoveHeight, baseDepth]}
        radius={Math.min(safeRadius, alcoveHeight / 2.2)}
        smoothness={4}
        creaseAngle={0.5}
        position={[0, alcoveHeight / 2, baseZ]}
      >
        <Surface finish={finish} />
      </RoundedBox>

      {/* Side panels carrying the case down to the counter on either side of
          the recess, so the body does not appear to float above its base. */}
      {cheek > 0 &&
        [-1, 1].map((side) => (
          <RoundedBox
            key={side}
            args={[cheek, alcoveHeight, upperDepth]}
            radius={Math.min(safeRadius, cheek / 2.4, alcoveHeight / 2.4)}
            smoothness={4}
            creaseAngle={0.5}
            position={[side * (width / 2 - cheek / 2), alcoveHeight / 2, upperZ]}
          >
            <Surface finish={finish} />
          </RoundedBox>
        ))}

      {/* Recessed back wall of the alcove, always a shade darker than the case */}
      <mesh position={[0, alcoveHeight / 2 + 0.001, frontZ - alcoveDepth + 0.002]}>
        <planeGeometry args={[baseWidth * 0.99, alcoveHeight * 0.96]} />
        <Surface finish="darkPlastic" />
      </mesh>

      {topFinish && (
        <RoundedBox
          args={[width * 0.995, topPanelHeight, upperDepth * 0.99]}
          radius={topPanelHeight / 2.4}
          smoothness={4}
          position={[0, height - topPanelHeight / 2 + 0.0005, upperZ]}
        >
          <Surface finish={topFinish} />
        </RoundedBox>
      )}

      {/* Feet. Sit below the case, which is why the model group is lifted. */}
      {[
        [-width / 2 + footInset, -depth / 2 + footInset],
        [width / 2 - footInset, -depth / 2 + footInset],
        [-width / 2 + footInset, depth / 2 - footInset - 0.01],
        [width / 2 - footInset, depth / 2 - footInset - 0.01],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.005, z]}>
          <cylinderGeometry args={[0.011, 0.013, 0.01, 16]} />
          <Surface finish="rubber" />
        </mesh>
      ))}
    </Part>
  )
}
