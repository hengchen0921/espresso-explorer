import {
  Badge,
  Boiler,
  DripTray,
  Groove,
  GroupHead,
  LcdPanel,
  Part,
  Portafilter,
  PowerCord,
  PressureGauge,
  RoundButton,
  Shell,
  SteamKnob,
  SteamWand,
  Surface,
  Vents,
  WaterTank,
} from '../primitives'
import { frame, normal } from '../framing'
import type { MachineModelDefinition, PartAnchor } from '../types'

/**
 * Breville Dual Boiler — the largest machine here and the only one with two
 * boilers. Instrumented across the whole front, and unusual in taking its water
 * tank out through the face rather than the back. 38 × 38 × 41 cm.
 */
const W = 0.38
const D = 0.38
const H = 0.41
const ALCOVE_H = 0.175
const ALCOVE_D = 0.13
const FRONT = D / 2
const PANEL = FRONT + 0.002

const GROUP_Z = 0.12
const GROUP_Y = ALCOVE_H - 0.04

export function BrevilleDualBoilerModel() {
  return (
    <group>
      <Shell
        width={W}
        depth={D}
        height={H}
        alcoveHeight={ALCOVE_H}
        alcoveDepth={ALCOVE_D}
        finish="brushedSteel"
        radius={0.016}
        cheekWidth={0.015}
      />

      <Part id="chassis">
        {/* Cup-warming tray across the lid */}
        <mesh position={[0, H - 0.0015, -0.02]}>
          <boxGeometry args={[W * 0.72, 0.004, D * 0.6]} />
          <Surface finish="darkPlastic" color="#1b1719" />
        </mesh>

        <Groove position={[0, ALCOVE_H + 0.007, PANEL - 0.0015]} length={W * 0.96} axis="x" />
        {[-1, 1].map((side) => (
          <Groove
            key={side}
            position={[side * (W / 2 - 0.011), (H + ALCOVE_H) / 2, PANEL - 0.0015]}
            length={H - ALCOVE_H - 0.04}
            axis="y"
          />
        ))}

        <group position={[0, 0.3, -D / 2 + 0.0015]} rotation={[Math.PI / 2, 0, 0]}>
          <Vents position={[0, 0, 0]} count={9} length={0.15} spacing={0.01} />
        </group>

        <Badge position={[-0.16, 0.3, PANEL - 0.001]} width={0.046} />
        <PowerCord from={[-0.09, 0.03, -D / 2 + 0.004]} to={[-0.22, 0.004, -D / 2 - 0.1]} />
      </Part>

      {/* Two boilers, which is the entire proposition of the machine */}
      <Boiler position={[-0.06, 0.245, 0.03]} variant="aluminium" size={0.095} radius={0.032} />
      <Boiler position={[0.065, 0.265, -0.035]} variant="aluminium" size={0.105} radius={0.036} />

      <WaterTank
        position={[0, ALCOVE_H + 0.012, 0.03]}
        width={0.29}
        height={0.115}
        depth={0.155}
        variant="front"
        level={0.7}
      />

      <GroupHead position={[0, GROUP_Y, GROUP_Z]} radius={0.042} drop={0.04} commercial />

      <Portafilter
        position={[0, GROUP_Y, GROUP_Z]}
        radius={0.029}
        handleLength={0.125}
        handleFinish="black"
      />

      <SteamWand
        position={[0.145, 0.235, PANEL - 0.006]}
        length={0.135}
        variant="articulating"
        tilt={0.28}
        yaw={0.24}
      />
      <Part id="steam-wand">
        <mesh position={[0.152, 0.3, PANEL - 0.003]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.021, 0.021, 0.003, 28]} />
          <Surface finish="polishedSteel" roughness={0.3} />
        </mesh>
        <SteamKnob position={[0.152, 0.3, PANEL]} radius={0.016} />
      </Part>

      <DripTray position={[0, 0, 0.115]} width={0.348} depth={0.14} height={0.05} float slats={15} />

      <Part id="control-panel">
        <PressureGauge position={[-0.105, 0.262, PANEL]} radius={0.036} reading={0.62} />
        <LcdPanel position={[0.005, 0.315, PANEL]} width={0.078} height={0.044} />
        <RoundButton position={[0.075, 0.262, PANEL]} radius={0.011} />
        <RoundButton position={[0.075, 0.222, PANEL]} radius={0.011} lit />
        <RoundButton position={[-0.162, 0.222, PANEL]} radius={0.009} finish="black" />
        {/* Hot-water tap on the left, mirroring the steam valve */}
        <mesh position={[-0.152, 0.3, PANEL - 0.003]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.021, 0.021, 0.003, 28]} />
          <Surface finish="polishedSteel" roughness={0.3} />
        </mesh>
        <SteamKnob position={[-0.152, 0.3, PANEL]} radius={0.016} />
      </Part>
    </group>
  )
}

const anchors: PartAnchor[] = [
  {
    partId: 'boiler',
    position: [0, 0.268, 0.04],
    normal: normal(0),
    camera: frame([0, 0.255, -0.01], 26, 10, 0.68),
    internal: true,
  },
  {
    partId: 'group-head',
    position: [0, GROUP_Y + 0.02, GROUP_Z + 0.046],
    normal: normal(4, 4),
    camera: frame([0, 0.15, 0.08], 18, 8, 0.46),
  },
  {
    partId: 'portafilter',
    position: [0, GROUP_Y - 0.034, GROUP_Z + 0.11],
    normal: normal(4, 22),
    camera: frame([0, 0.11, 0.12], 24, 14, 0.5),
  },
  {
    partId: 'steam-wand',
    position: [0.172, 0.155, 0.215],
    normal: normal(52, 6),
    camera: frame([0.14, 0.21, 0.11], 54, 8, 0.56),
  },
  {
    partId: 'water-reservoir',
    position: [0, 0.25, 0.11],
    normal: normal(0),
    camera: frame([0, 0.24, 0.06], 20, 10, 0.6),
    internal: true,
  },
  {
    partId: 'drip-tray',
    position: [0, 0.058, 0.176],
    normal: normal(4, 42),
    camera: frame([0, 0.075, 0.09], 16, 22, 0.52),
  },
  {
    partId: 'control-panel',
    position: [-0.105, 0.262, PANEL + 0.01],
    normal: normal(-8),
    camera: frame([-0.02, 0.28, 0.09], 8, 6, 0.56),
  },
]

export const brevilleDualBoiler: MachineModelDefinition = {
  machineId: 'breville-dual-boiler',
  source: { kind: 'primitive', Component: BrevilleDualBoilerModel },
  size: { width: W, height: H, depth: D },
  home: frame([0, 0.2, 0], 32, 14, 0.95),
  anchors,
}
