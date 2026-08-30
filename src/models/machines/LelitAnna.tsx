import {
  Badge,
  Boiler,
  CupRail,
  DripTray,
  Groove,
  GroupHead,
  LcdPanel,
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
 * Lelit Anna PL41TEM — a compact Italian single boiler whose one distinguishing
 * feature is on the front panel: a PID readout where its rivals have a warning
 * light. 24.5 × 26.5 × 30.5 cm.
 */
const W = 0.245
const D = 0.265
const H = 0.305
const ALCOVE_H = 0.16
const ALCOVE_D = 0.11
const FRONT = D / 2
const PANEL = FRONT + 0.002

const GROUP_Z = 0.104
const GROUP_Y = ALCOVE_H - 0.036

export function LelitAnnaModel() {
  return (
    <group>
      <Shell
        width={W}
        depth={D}
        height={H}
        alcoveHeight={ALCOVE_H}
        alcoveDepth={ALCOVE_D}
        finish="polishedSteel"
        radius={0.009}
      />

      <Part id="chassis">
        <CupRail position={[0, H + 0.0005, -0.02]} width={0.15} depth={0.12} bars={3} />
        <Groove position={[0, H - 0.02, PANEL - 0.003]} length={W * 0.98} axis="x" />
        {[-1, 1].map((side) => (
          <Groove
            key={side}
            position={[side * (W / 2 - 0.006), (H + ALCOVE_H) / 2 - 0.015, PANEL - 0.003]}
            length={H - ALCOVE_H - 0.05}
            axis="y"
          />
        ))}
        <Badge position={[-0.055, 0.198, PANEL - 0.001]} width={0.04} />
        <PowerCord from={[-0.06, 0.028, -D / 2 + 0.004]} to={[-0.16, 0.004, -D / 2 - 0.085]} />
      </Part>

      <GroupHead position={[0, GROUP_Y, GROUP_Z]} radius={0.037} drop={0.036} commercial />

      <Portafilter
        position={[0, GROUP_Y, GROUP_Z]}
        radius={0.0285}
        handleLength={0.115}
        handleFinish="black"
      />

      <SteamWand
        position={[0.084, 0.2, PANEL - 0.005]}
        length={0.112}
        variant="commercial"
        tilt={0.24}
        yaw={0.22}
      />
      <Part id="steam-wand">
        <mesh position={[0.092, 0.248, PANEL - 0.003]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.017, 0.017, 0.003, 28]} />
          <Surface finish="polishedSteel" roughness={0.3} />
        </mesh>
        <SteamKnob position={[0.092, 0.248, PANEL]} radius={0.013} />
      </Part>

      <DripTray position={[0, 0, 0.086]} width={0.222} depth={0.114} height={0.046} slats={10} />

      <Boiler position={[0, 0.235, 0.05]} variant="brass" size={0.08} radius={0.029} />

      <WaterTank position={[0, 0.185, -0.055]} width={0.175} height={0.108} depth={0.085} variant="top" />
      <Part id="water-reservoir">
        <mesh position={[0, H + 0.001, -0.055]}>
          <boxGeometry args={[0.19, 0.004, 0.095]} />
          <Surface finish="black" />
        </mesh>
      </Part>

      <Part id="control-panel">
        {/* The PID readout is the whole reason to buy this machine */}
        <LcdPanel position={[-0.052, 0.255, PANEL]} width={0.05} height={0.028} />
        <RockerSwitch position={[0.048, 0.266, PANEL]} width={0.022} height={0.026} lit />
        <RockerSwitch position={[0.048, 0.226, PANEL]} width={0.022} height={0.026} />
      </Part>
    </group>
  )
}

const anchors: PartAnchor[] = [
  {
    partId: 'boiler',
    position: [0, 0.245, 0.06],
    normal: normal(0),
    camera: frame([0, 0.235, 0.02], 24, 8, 0.52),
    internal: true,
  },
  {
    partId: 'group-head',
    position: [0, GROUP_Y + 0.018, GROUP_Z + 0.04],
    normal: normal(4, 4),
    camera: frame([0, 0.14, 0.07], 18, 8, 0.42),
  },
  {
    partId: 'portafilter',
    position: [0, GROUP_Y - 0.032, GROUP_Z + 0.1],
    normal: normal(4, 22),
    camera: frame([0, 0.105, 0.1], 24, 14, 0.44),
  },
  {
    partId: 'steam-wand',
    position: [0.1, 0.132, 0.172],
    normal: normal(50, 6),
    camera: frame([0.075, 0.18, 0.09], 52, 8, 0.46),
  },
  {
    partId: 'water-reservoir',
    position: [0, H + 0.012, -0.055],
    normal: normal(0, 78),
    camera: frame([0, 0.26, -0.04], 24, 46, 0.54),
    internal: true,
  },
  {
    partId: 'drip-tray',
    position: [0, 0.054, 0.135],
    normal: normal(4, 42),
    camera: frame([0, 0.07, 0.06], 16, 22, 0.42),
  },
  {
    partId: 'control-panel',
    position: [-0.052, 0.255, PANEL + 0.008],
    normal: normal(-6),
    camera: frame([-0.01, 0.25, 0.06], 10, 6, 0.42),
  },
]

export const lelitAnna: MachineModelDefinition = {
  machineId: 'lelit-anna',
  source: { kind: 'primitive', Component: LelitAnnaModel },
  size: { width: W, height: H, depth: D },
  home: frame([0, 0.15, 0], 30, 12, 0.66),
  anchors,
}
