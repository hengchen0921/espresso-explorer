import { RoundedBox } from '@react-three/drei'
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
 * Rancilio Silvia — compact steel case under a black cap, a commercial brass
 * group that stands proud of the front, three switches in a row, and a brass
 * boiler doing most of the work of the machine's 14 kg. 23 × 29 × 34 cm.
 */
const W = 0.23
const D = 0.29
const H = 0.34
const ALCOVE_H = 0.155
const ALCOVE_D = 0.115
const FRONT = D / 2
const PANEL = FRONT + 0.002

const GROUP_Z = 0.118
const GROUP_Y = ALCOVE_H - 0.034

export function RancilioSilviaModel() {
  return (
    <group>
      <Shell
        width={W}
        depth={D}
        height={H}
        alcoveHeight={ALCOVE_H}
        alcoveDepth={ALCOVE_D}
        finish="polishedSteel"
        topFinish="black"
        topPanelHeight={0.018}
        radius={0.01}
      />

      {/* Case detail. Silvia's identity is a stainless box under an overhanging
          black cap, with the group standing well proud of the front. */}
      <Part id="chassis">
        <RoundedBox
          args={[W + 0.005, 0.007, D + 0.005]}
          radius={0.002}
          smoothness={3}
          position={[0, H - 0.021, 0]}
        >
          <Surface finish="darkPlastic" />
        </RoundedBox>

        <CupRail position={[0, H + 0.0005, -0.03]} width={0.125} depth={0.1} bars={3} finish="black" />

        {/* Shut line where the cap meets the body */}
        <Groove position={[0, H - 0.026, PANEL - 0.003]} length={W * 0.98} axis="x" />

        {/* Wrap seams down the front corners */}
        {[-1, 1].map((side) => (
          <Groove
            key={side}
            position={[side * (W / 2 - 0.007), (H + ALCOVE_H) / 2 - 0.012, PANEL - 0.003]}
            length={H - ALCOVE_H - 0.05}
            axis="y"
          />
        ))}

        <Badge position={[0, 0.198, PANEL - 0.001]} width={0.04} />
        <PowerCord from={[-0.06, 0.028, -D / 2 + 0.004]} to={[-0.17, 0.004, -D / 2 - 0.09]} />
      </Part>

      <GroupHead position={[0, GROUP_Y, GROUP_Z]} radius={0.038} drop={0.034} commercial />

      <Portafilter
        position={[0, GROUP_Y, GROUP_Z]}
        radius={0.029}
        handleLength={0.125}
        handleFinish="black"
      />

      <SteamWand
        position={[0.078, 0.208, PANEL - 0.006]}
        length={0.128}
        variant="articulating"
        tilt={0.3}
        yaw={0.26}
      />
      <Part id="steam-wand">
        {/* Chromed escutcheon where the valve stem passes through the panel */}
        <mesh position={[0.086, 0.212, PANEL - 0.003]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.003, 28]} />
          <Surface finish="polishedSteel" roughness={0.3} />
        </mesh>
        <SteamKnob position={[0.086, 0.212, PANEL]} radius={0.013} />
      </Part>

      <DripTray position={[0, 0, 0.09]} width={0.206} depth={0.118} height={0.05} slats={10} />

      <Boiler position={[0, 0.226, 0.05]} variant="brass" size={0.088} radius={0.034} />

      <WaterTank position={[0, 0.172, -0.058]} width={0.16} height={0.126} depth={0.088} variant="top" />
      <Part id="water-reservoir">
        {/* The tank is reached by lifting the black cap */}
        <mesh position={[0, H + 0.0015, -0.058]}>
          <boxGeometry args={[0.17, 0.004, 0.115]} />
          <Surface finish="darkPlastic" />
        </mesh>
      </Part>

      <Part id="control-panel">
        {[-0.055, 0, 0.055].map((x, i) => (
          <RockerSwitch key={x} position={[x, 0.284, PANEL]} width={0.025} height={0.021} lit={i === 0} />
        ))}
      </Part>
    </group>
  )
}

const anchors: PartAnchor[] = [
  {
    partId: 'boiler',
    position: [0, 0.236, 0.06],
    normal: normal(0),
    camera: frame([0, 0.23, -0.01], 24, 8, 0.56),
    internal: true,
  },
  {
    partId: 'group-head',
    position: [0, GROUP_Y + 0.018, GROUP_Z + 0.044],
    normal: normal(4, 4),
    camera: frame([0, 0.135, 0.07], 18, 8, 0.42),
  },
  {
    partId: 'portafilter',
    position: [0, GROUP_Y - 0.032, GROUP_Z + 0.105],
    normal: normal(4, 22),
    camera: frame([0, 0.1, 0.11], 24, 14, 0.46),
  },
  {
    partId: 'steam-wand',
    position: [0.104, 0.128, 0.18],
    normal: normal(52, 6),
    camera: frame([0.075, 0.18, 0.09], 54, 8, 0.48),
  },
  {
    partId: 'water-reservoir',
    position: [0, H + 0.012, -0.058],
    normal: normal(0, 78),
    camera: frame([0, 0.27, -0.04], 24, 46, 0.58),
    internal: true,
  },
  {
    partId: 'drip-tray',
    position: [0, 0.058, 0.138],
    normal: normal(4, 42),
    camera: frame([0, 0.07, 0.06], 16, 22, 0.44),
  },
  {
    partId: 'control-panel',
    position: [0, 0.284, PANEL + 0.01],
    normal: normal(0),
    camera: frame([0, 0.27, 0.06], 14, 6, 0.42),
  },
]

export const rancilioSilvia: MachineModelDefinition = {
  machineId: 'rancilio-silvia',
  source: { kind: 'primitive', Component: RancilioSilviaModel },
  size: { width: W, height: H, depth: D },
  home: frame([0, 0.17, 0], 30, 12, 0.68),
  anchors,
}
