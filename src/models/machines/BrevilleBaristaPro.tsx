import {
  Badge,
  BeanHopper,
  Boiler,
  Groove,
  DripTray,
  GrindDial,
  GroupHead,
  LcdPanel,
  Part,
  Portafilter,
  PowerCord,
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
 * Breville Barista Pro — the Express silhouette in graphite, deeper front to
 * back, with an LCD where the gauge was and a three-element ThermoJet in place
 * of the coil. 35 × 40 × 41 cm.
 */
const W = 0.35
const D = 0.4
const CASE_H = 0.345
const HOPPER_H = 0.065
const TOTAL_H = CASE_H + HOPPER_H
const ALCOVE_H = 0.16
const ALCOVE_D = 0.12
const TANK_D = 0.07
const BODY_D = D - TANK_D
const FRONT = D / 2
const PANEL = FRONT + 0.002

const GROUP_X = 0.03
const GROUP_Z = 0.135
const GROUP_Y = ALCOVE_H - 0.036

export function BrevilleBaristaProModel() {
  return (
    <group>
      <Shell
        width={W}
        depth={D}
        height={CASE_H}
        alcoveHeight={ALCOVE_H}
        alcoveDepth={ALCOVE_D}
        bodyDepth={BODY_D}
        finish="graphite"
        radius={0.015}
      />

      <WaterTank
        position={[0, ALCOVE_H, -FRONT + TANK_D / 2]}
        width={0.29}
        height={0.16}
        depth={TANK_D - 0.004}
        variant="rear"
      />

      <Part id="chassis">
        {/* Recessed cup-warming well on the top right */}
        <mesh position={[0.08, CASE_H - 0.0015, 0.03]}>
          <boxGeometry args={[0.14, 0.004, 0.16]} />
          <Surface finish="darkPlastic" color="#1b1719" />
        </mesh>

        {/* Shut line between the control band and the brew area */}
        <Groove position={[0, ALCOVE_H + 0.006, PANEL - 0.0015]} length={W * 0.97} axis="x" />

        {/* Wrap seams down the front corners */}
        {[-1, 1].map((side) => (
          <Groove
            key={side}
            position={[side * (W / 2 - 0.009), (CASE_H + ALCOVE_H) / 2, PANEL - 0.0015]}
            length={CASE_H - ALCOVE_H - 0.03}
            axis="y"
          />
        ))}

        {/* Cooling louvres across the back panel */}
        <group position={[0, 0.265, -D / 2 + 0.0015]} rotation={[Math.PI / 2, 0, 0]}>
          <Vents position={[0, 0, 0]} count={8} length={0.12} spacing={0.009} />
        </group>

        <Badge position={[-0.142, 0.255, PANEL - 0.001]} width={0.042} />
        <PowerCord from={[-0.08, 0.028, -D / 2 + 0.004]} to={[-0.2, 0.004, -D / 2 - 0.09]} />
      </Part>

      <GroupHead position={[GROUP_X, GROUP_Y, GROUP_Z]} radius={0.034} drop={0.036} />

      <Portafilter
        position={[GROUP_X, GROUP_Y, GROUP_Z]}
        radius={0.027}
        handleLength={0.105}
        handleFinish="darkPlastic"
      />

      <SteamWand
        position={[0.142, 0.195, PANEL - 0.004]}
        length={0.108}
        variant="swivel"
        tilt={0.2}
        yaw={0.14}
      />

      <DripTray position={[0, 0, 0.132]} width={0.326} depth={0.134} height={0.046} float slats={14} />

      <Boiler position={[0.02, 0.245, 0.06]} variant="thermojet" size={0.11} radius={0.03} />

      <BeanHopper
        position={[-0.082, CASE_H, -0.03]}
        height={HOPPER_H}
        topRadius={0.044}
        bottomRadius={0.022}
      />
      <Part id="grinder">
        <GrindDial position={[-W / 2 - 0.004, 0.255, 0.05]} radius={0.027} />
        <mesh position={[-0.095, ALCOVE_H - 0.012, 0.13]}>
          <cylinderGeometry args={[0.014, 0.011, 0.026, 20]} />
          <Surface finish="black" />
        </mesh>
        <mesh position={[-0.095, 0.088, 0.085]}>
          <boxGeometry args={[0.082, 0.078, 0.004]} />
          <Surface finish="darkPlastic" color="#191617" />
        </mesh>
      </Part>

      <Part id="control-panel">
        <LcdPanel position={[-0.052, 0.222, PANEL]} width={0.082} height={0.05} />
        <RoundButton position={[0.066, 0.238, PANEL]} radius={0.0095} />
        <RoundButton position={[0.066, 0.2, PANEL]} radius={0.0095} lit />
        <RoundButton position={[-0.142, 0.2, PANEL]} radius={0.008} finish="black" />
        <SteamKnob position={[0.142, 0.272, PANEL]} radius={0.015} />
      </Part>
    </group>
  )
}

const anchors: PartAnchor[] = [
  {
    partId: 'boiler',
    position: [0.02, 0.255, 0.07],
    normal: normal(0),
    camera: frame([0.02, 0.24, 0.02], 26, 10, 0.66),
    internal: true,
  },
  {
    partId: 'group-head',
    position: [GROUP_X, GROUP_Y + 0.018, GROUP_Z + 0.036],
    normal: normal(6, 4),
    camera: frame([GROUP_X, 0.14, 0.09], 20, 8, 0.44),
  },
  {
    partId: 'portafilter',
    position: [GROUP_X, GROUP_Y - 0.03, GROUP_Z + 0.09],
    normal: normal(4, 22),
    camera: frame([GROUP_X, 0.11, 0.13], 26, 14, 0.46),
  },
  {
    partId: 'steam-wand',
    position: [0.155, 0.13, 0.22],
    normal: normal(52, 6),
    camera: frame([0.13, 0.165, 0.13], 54, 10, 0.5),
  },
  {
    partId: 'water-reservoir',
    position: [0, 0.255, -FRONT - 0.004],
    normal: normal(180),
    camera: frame([0, 0.25, -0.1], 196, 18, 0.66),
  },
  {
    partId: 'drip-tray',
    position: [0, 0.054, 0.185],
    normal: normal(4, 42),
    camera: frame([0, 0.075, 0.1], 18, 22, 0.46),
  },
  {
    partId: 'grinder',
    position: [-0.082, CASE_H + 0.05, -0.03],
    normal: normal(-26, 40),
    camera: frame([-0.065, 0.32, -0.02], -34, 24, 0.58),
  },
  {
    partId: 'control-panel',
    position: [-0.052, 0.222, PANEL + 0.008],
    normal: normal(0),
    camera: frame([0, 0.225, 0.1], 12, 6, 0.46),
  },
]

export const brevilleBaristaPro: MachineModelDefinition = {
  machineId: 'breville-barista-pro',
  source: { kind: 'primitive', Component: BrevilleBaristaProModel },
  size: { width: W, height: TOTAL_H, depth: D },
  home: frame([0, 0.19, 0], 32, 14, 0.88),
  anchors,
}
