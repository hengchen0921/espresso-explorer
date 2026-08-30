import {
  Badge,
  Boiler,
  Groove,
  DripTray,
  GroupHead,
  Part,
  Portafilter,
  PowerCord,
  RoundButton,
  Shell,
  SteamKnob,
  SteamWand,
  Surface,
  WaterTank,
} from '../primitives'
import { frame, normal } from '../framing'
import type { MachineModelDefinition, PartAnchor } from '../types'

/**
 * De'Longhi Dedica — 15 cm across and 33 cm deep, which is the whole design
 * argument: everything that would make it wider has been pushed backwards
 * instead. Steel cup plate on top, three backlit buttons, panarello wand.
 */
const W = 0.15
const D = 0.33
const H = 0.3
const ALCOVE_H = 0.145
const ALCOVE_D = 0.095
const TANK_D = 0.062
const BODY_D = D - TANK_D
const FRONT = D / 2
const PANEL = FRONT + 0.002

const GROUP_Z = 0.115
const GROUP_Y = ALCOVE_H - 0.032

export function DelonghiDedicaModel() {
  return (
    <group>
      <Shell
        width={W}
        depth={D}
        height={H}
        alcoveHeight={ALCOVE_H}
        alcoveDepth={ALCOVE_D}
        bodyDepth={BODY_D}
        finish="graphite"
        topFinish="polishedSteel"
        topPanelHeight={0.008}
        radius={0.011}
      />

      <WaterTank
        position={[0, ALCOVE_H, -FRONT + TANK_D / 2]}
        width={0.128}
        height={0.13}
        depth={TANK_D - 0.004}
        variant="rear"
        level={0.55}
      />

      <Part id="chassis">
        {/* Raised lip around the stainless cup plate */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (W / 2 - 0.004), H + 0.002, -0.02]}>
            <boxGeometry args={[0.005, 0.004, D * 0.62]} />
            <Surface finish="polishedSteel" />
          </mesh>
        ))}

        {/* Brushed panel inset above the brew recess — the Dedica's one
            flourish on an otherwise plain black front. */}
        <mesh position={[-0.024, 0.238, PANEL - 0.0015]}>
          <boxGeometry args={[0.052, 0.03, 0.0025]} />
          <Surface finish="brushedSteel" roughness={0.34} />
        </mesh>

        <Groove position={[0, ALCOVE_H + 0.005, PANEL - 0.0015]} length={W * 0.94} axis="x" />
        {[-1, 1].map((side) => (
          <Groove
            key={side}
            position={[side * (W / 2 - 0.007), (H + ALCOVE_H) / 2, PANEL - 0.0015]}
            length={H - ALCOVE_H - 0.03}
            axis="y"
          />
        ))}

        <Badge position={[-0.024, 0.186, PANEL - 0.001]} width={0.028} />
        <PowerCord from={[-0.03, 0.026, -D / 2 + 0.004]} to={[-0.1, 0.004, -D / 2 - 0.08]} />
      </Part>

      <GroupHead position={[0, GROUP_Y, GROUP_Z]} radius={0.03} drop={0.032} finish="polishedSteel" />

      <Portafilter
        position={[0, GROUP_Y, GROUP_Z]}
        radius={0.0255}
        handleLength={0.1}
        finish="polishedSteel"
        handleFinish="darkPlastic"
      />

      <SteamWand
        position={[0.052, 0.178, PANEL - 0.004]}
        length={0.088}
        variant="panarello"
        tilt={0.18}
        yaw={0.16}
      />
      <Part id="steam-wand">
        <SteamKnob position={[W / 2 + 0.004, 0.212, 0.05]} radius={0.014} axis="x" />
      </Part>

      <DripTray position={[0, 0, 0.102]} width={0.13} depth={0.112} height={0.04} slats={8} />

      <Boiler position={[0, 0.212, 0.03]} variant="thermoblock" size={0.086} radius={0.022} />

      <Part id="control-panel">
        <RoundButton position={[0.042, 0.248, PANEL]} radius={0.0062} finish="graphite" lit />
        <RoundButton position={[0.042, 0.222, PANEL]} radius={0.0062} finish="graphite" />
        <RoundButton position={[0.042, 0.196, PANEL]} radius={0.0062} finish="graphite" />
        {/* Model badge strip */}
        <mesh position={[-0.03, 0.216, PANEL]}>
          <planeGeometry args={[0.046, 0.004]} />
          <Surface finish="polishedSteel" roughness={0.5} />
        </mesh>
      </Part>
    </group>
  )
}

const anchors: PartAnchor[] = [
  {
    partId: 'boiler',
    position: [0, 0.222, 0.04],
    normal: normal(0),
    camera: frame([0, 0.215, 0.01], 24, 8, 0.5),
    internal: true,
  },
  {
    partId: 'group-head',
    position: [0, GROUP_Y + 0.016, GROUP_Z + 0.032],
    normal: normal(4, 4),
    camera: frame([0, 0.125, 0.08], 18, 8, 0.38),
  },
  {
    partId: 'portafilter',
    position: [0, GROUP_Y - 0.028, GROUP_Z + 0.085],
    normal: normal(4, 22),
    camera: frame([0, 0.095, 0.11], 24, 14, 0.42),
  },
  {
    partId: 'steam-wand',
    position: [0.062, 0.115, 0.185],
    normal: normal(48, 6),
    camera: frame([0.04, 0.155, 0.1], 52, 8, 0.42),
  },
  {
    partId: 'water-reservoir',
    position: [0, 0.225, -FRONT - 0.004],
    normal: normal(180),
    camera: frame([0, 0.22, -0.09], 200, 16, 0.56),
  },
  {
    partId: 'drip-tray',
    position: [0, 0.048, 0.15],
    normal: normal(4, 42),
    camera: frame([0, 0.065, 0.08], 16, 22, 0.4),
  },
  {
    partId: 'control-panel',
    position: [0.042, 0.222, PANEL + 0.008],
    normal: normal(6),
    camera: frame([0.01, 0.215, 0.09], 16, 6, 0.4),
  },
]

export const delonghiDedica: MachineModelDefinition = {
  machineId: 'delonghi-dedica',
  source: { kind: 'primitive', Component: DelonghiDedicaModel },
  size: { width: W, height: H, depth: D },
  home: frame([0, 0.16, 0], 34, 12, 0.66),
  anchors,
}
