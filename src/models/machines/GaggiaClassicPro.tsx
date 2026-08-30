import {
  Badge,
  Boiler,
  CupRail,
  Groove,
  DripTray,
  GroupHead,
  Part,
  Portafilter,
  PowerCord,
  RockerSwitch,
  Shell,
  SteamKnob,
  SteamWand,
  Surface,
  WaterTank,
} from '../primitives'
import { frame, normal } from '../framing'
import type { MachineModelDefinition, PartAnchor } from '../types'

/**
 * Gaggia Classic Pro — narrow polished-steel box, commercial 58 mm group
 * hanging off the front, three rocker switches stacked on the right cheek, and
 * a top-loading tank hidden under the lid. 24 × 30 × 38 cm.
 */
const W = 0.24
const D = 0.3
const H = 0.38
const ALCOVE_H = 0.17
const ALCOVE_D = 0.115
const FRONT = D / 2
const PANEL = FRONT + 0.002

const GROUP_Z = 0.112
const GROUP_Y = ALCOVE_H - 0.038

export function GaggiaClassicProModel() {
  return (
    <group>
      <Shell
        width={W}
        depth={D}
        height={H}
        alcoveHeight={ALCOVE_H}
        alcoveDepth={ALCOVE_D}
        finish="polishedSteel"
        radius={0.008}
      />

      <Part id="chassis">
        {/* The Classic's top front edge is chamfered rather than square */}
        <mesh position={[0, H - 0.007, PANEL - 0.009]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[W * 0.994, 0.013, 0.013]} />
          <Surface finish="polishedSteel" />
        </mesh>

        <CupRail position={[0, H + 0.0005, -0.02]} width={0.15} depth={0.14} bars={3} />

        {/* Shut line under the lid */}
        <Groove position={[0, H - 0.021, PANEL - 0.003]} length={W * 0.98} axis="x" />

        {[-1, 1].map((side) => (
          <Groove
            key={side}
            position={[side * (W / 2 - 0.006), (H + ALCOVE_H) / 2 - 0.02, PANEL - 0.003]}
            length={H - ALCOVE_H - 0.06}
            axis="y"
          />
        ))}

        <Badge position={[-0.05, 0.212, PANEL - 0.001]} width={0.044} />
        <PowerCord from={[-0.06, 0.028, -D / 2 + 0.004]} to={[-0.17, 0.004, -D / 2 - 0.09]} />
      </Part>

      <GroupHead position={[0, GROUP_Y, GROUP_Z]} radius={0.037} drop={0.038} commercial />

      <Portafilter
        position={[0, GROUP_Y, GROUP_Z]}
        radius={0.029}
        handleLength={0.118}
        handleFinish="black"
      />

      <SteamWand
        position={[0.088, 0.212, PANEL - 0.006]}
        length={0.118}
        variant="commercial"
        tilt={0.24}
        yaw={0.22}
      />
      {/* The steam valve belongs to the milk circuit, so it selects with it */}
      <Part id="steam-wand">
        <mesh position={[0.088, 0.235, PANEL - 0.003]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.017, 0.017, 0.003, 28]} />
          <Surface finish="polishedSteel" roughness={0.3} />
        </mesh>
        <SteamKnob position={[0.088, 0.235, PANEL]} radius={0.013} />
      </Part>

      <DripTray position={[0, 0, 0.092]} width={0.216} depth={0.122} height={0.046} slats={10} />

      <Boiler position={[0, 0.25, 0.055]} variant="aluminium" size={0.086} radius={0.028} />

      <WaterTank
        position={[0, 0.198, -0.062]}
        width={0.17}
        height={0.146}
        depth={0.088}
        variant="top"
      />
      {/* Lift-off hatch over the tank */}
      <Part id="water-reservoir">
        <mesh position={[0, H + 0.001, -0.062]}>
          <boxGeometry args={[0.185, 0.004, 0.115]} />
          <Surface finish="black" />
        </mesh>
      </Part>

      <Part id="control-panel">
        <RockerSwitch position={[0.06, 0.312, PANEL]} width={0.022} height={0.028} lit />
        <RockerSwitch position={[0.06, 0.278, PANEL]} width={0.022} height={0.028} />
        <RockerSwitch position={[0.06, 0.244, PANEL]} width={0.022} height={0.028} />
      </Part>
    </group>
  )
}

const anchors: PartAnchor[] = [
  {
    partId: 'boiler',
    position: [0, 0.26, 0.065],
    normal: normal(0),
    camera: frame([0, 0.25, -0.01], 24, 10, 0.58),
    internal: true,
  },
  {
    partId: 'group-head',
    position: [0, GROUP_Y + 0.02, GROUP_Z + 0.042],
    normal: normal(4, 4),
    camera: frame([0, 0.14, 0.06], 18, 8, 0.42),
  },
  {
    partId: 'portafilter',
    position: [0, GROUP_Y - 0.032, GROUP_Z + 0.1],
    normal: normal(4, 22),
    camera: frame([0, 0.105, 0.1], 24, 14, 0.46),
  },
  {
    partId: 'steam-wand',
    position: [0.104, 0.14, 0.175],
    normal: normal(50, 6),
    camera: frame([0.08, 0.19, 0.09], 52, 8, 0.48),
  },
  {
    partId: 'water-reservoir',
    position: [0, H + 0.01, -0.062],
    normal: normal(0, 78),
    camera: frame([0, 0.3, -0.04], 24, 44, 0.6),
    internal: true,
  },
  {
    partId: 'drip-tray',
    position: [0, 0.054, 0.145],
    normal: normal(4, 42),
    camera: frame([0, 0.07, 0.06], 16, 22, 0.44),
  },
  {
    partId: 'control-panel',
    position: [0.06, 0.278, PANEL + 0.01],
    normal: normal(10),
    camera: frame([0.04, 0.26, 0.06], 24, 6, 0.44),
  },
]

export const gaggiaClassicPro: MachineModelDefinition = {
  machineId: 'gaggia-classic-pro',
  source: { kind: 'primitive', Component: GaggiaClassicProModel },
  size: { width: W, height: H, depth: D },
  home: frame([0, 0.185, 0], 30, 12, 0.72),
  anchors,
}
