import {
  Badge,
  Boiler,
  CupRail,
  DripTray,
  Groove,
  GroupHead,
  Part,
  Portafilter,
  PowerCord,
  RoundButton,
  Shell,
  SteamWand,
  Surface,
  Vents,
  WaterTank,
} from '../primitives'
import { frame, normal } from '../framing'
import type { MachineModelDefinition, PartAnchor } from '../types'

/**
 * Breville Bambino Plus — the Barista brew path with the grinder deleted and
 * the case narrowed to a chopping board's width. Almost all of its 32 cm depth
 * is water tank. 19.5 × 32 × 31 cm.
 */
const W = 0.195
const D = 0.32
const H = 0.31
const ALCOVE_H = 0.145
const ALCOVE_D = 0.1
const TANK_D = 0.06
const BODY_D = D - TANK_D
const FRONT = D / 2
const PANEL = FRONT + 0.002

const GROUP_Z = 0.105
const GROUP_Y = ALCOVE_H - 0.032

export function BrevilleBambinoPlusModel() {
  return (
    <group>
      <Shell
        width={W}
        depth={D}
        height={H}
        alcoveHeight={ALCOVE_H}
        alcoveDepth={ALCOVE_D}
        bodyDepth={BODY_D}
        finish="brushedSteel"
        radius={0.013}
        cheekWidth={0.01}
      />

      <Part id="chassis">
        <CupRail position={[0, H + 0.0005, -0.015]} width={0.1} depth={0.1} bars={2} />

        <Groove position={[0, ALCOVE_H + 0.005, PANEL - 0.0015]} length={W * 0.95} axis="x" />
        {[-1, 1].map((side) => (
          <Groove
            key={side}
            position={[side * (W / 2 - 0.007), (H + ALCOVE_H) / 2, PANEL - 0.0015]}
            length={H - ALCOVE_H - 0.03}
            axis="y"
          />
        ))}

        <group position={[0, 0.235, -D / 2 + 0.0015]} rotation={[Math.PI / 2, 0, 0]}>
          <Vents position={[0, 0, 0]} count={6} length={0.07} spacing={0.009} />
        </group>

        <Badge position={[-0.03, 0.166, PANEL - 0.001]} width={0.032} />
        <PowerCord from={[-0.04, 0.026, -D / 2 + 0.004]} to={[-0.12, 0.004, -D / 2 - 0.085]} />
      </Part>

      <WaterTank
        position={[0, ALCOVE_H, -FRONT + TANK_D / 2]}
        width={0.17}
        height={0.14}
        depth={TANK_D - 0.004}
        variant="rear"
      />

      <GroupHead position={[0, GROUP_Y, GROUP_Z]} radius={0.032} drop={0.032} />

      <Portafilter
        position={[0, GROUP_Y, GROUP_Z]}
        radius={0.027}
        handleLength={0.1}
        handleFinish="darkPlastic"
      />

      <SteamWand
        position={[0.068, 0.178, PANEL - 0.004]}
        length={0.092}
        variant="swivel"
        tilt={0.2}
        yaw={0.14}
      />

      <DripTray position={[0, 0, 0.098]} width={0.172} depth={0.108} height={0.04} float slats={9} />

      <Boiler position={[0, 0.215, 0.03]} variant="thermojet" size={0.09} radius={0.024} />

      <Part id="control-panel">
        {[-0.058, -0.028, 0.002].map((x, i) => (
          <RoundButton key={x} position={[x, 0.255, PANEL]} radius={0.0085} lit={i === 1} />
        ))}
        {/* Milk temperature and texture dials — small, flush, not valves */}
        {[-0.045, 0.005].map((x) => (
          <group key={x} position={[x, 0.205, PANEL]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.011, 0.011, 0.004, 24]} />
              <Surface finish="black" />
            </mesh>
            <mesh position={[0, 0.006, 0.003]}>
              <boxGeometry args={[0.0022, 0.004, 0.001]} />
              <Surface finish="copper" grain="none" />
            </mesh>
          </group>
        ))}
      </Part>
    </group>
  )
}

const anchors: PartAnchor[] = [
  {
    partId: 'boiler',
    position: [0, 0.225, 0.04],
    normal: normal(0),
    camera: frame([0, 0.215, 0.01], 24, 8, 0.48),
    internal: true,
  },
  {
    partId: 'group-head',
    position: [0, GROUP_Y + 0.016, GROUP_Z + 0.034],
    normal: normal(4, 4),
    camera: frame([0, 0.13, 0.07], 18, 8, 0.4),
  },
  {
    partId: 'portafilter',
    position: [0, GROUP_Y - 0.03, GROUP_Z + 0.088],
    normal: normal(4, 22),
    camera: frame([0, 0.1, 0.1], 24, 14, 0.42),
  },
  {
    partId: 'steam-wand',
    position: [0.08, 0.115, 0.185],
    normal: normal(50, 6),
    camera: frame([0.055, 0.16, 0.1], 54, 8, 0.44),
  },
  {
    partId: 'water-reservoir',
    position: [0, 0.23, -FRONT - 0.004],
    normal: normal(180),
    camera: frame([0, 0.22, -0.08], 198, 16, 0.56),
  },
  {
    partId: 'drip-tray',
    position: [0, 0.048, 0.148],
    normal: normal(4, 42),
    camera: frame([0, 0.065, 0.08], 16, 22, 0.42),
  },
  {
    partId: 'control-panel',
    position: [-0.028, 0.232, PANEL + 0.008],
    normal: normal(0),
    camera: frame([0, 0.23, 0.09], 14, 6, 0.4),
  },
]

export const brevilleBambinoPlus: MachineModelDefinition = {
  machineId: 'breville-bambino-plus',
  source: { kind: 'primitive', Component: BrevilleBambinoPlusModel },
  size: { width: W, height: H, depth: D },
  home: frame([0, 0.155, 0], 32, 14, 0.64),
  anchors,
}
