import {
  Badge,
  BeanHopper,
  Boiler,
  Groove,
  DripTray,
  GrindDial,
  GroupHead,
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
 * Breville Barista Express — wide brushed-steel case with the grinder stacked
 * on the left shoulder, a pressure gauge on the front, and the water tank
 * hanging off the back as its own module.
 *
 * All dimensions are metres, matching the real machine (33 × 31 × 40 cm), so
 * the comparison view can stand these models next to each other at true scale.
 */
const W = 0.33
const D = 0.31
const CASE_H = 0.335
const HOPPER_H = 0.065
const TOTAL_H = CASE_H + HOPPER_H
const ALCOVE_H = 0.155
const ALCOVE_D = 0.115
const TANK_D = 0.065
const BODY_D = D - TANK_D
const FRONT = D / 2
const PANEL = FRONT + 0.002

const GROUP_X = 0.025
const GROUP_Z = 0.09
const GROUP_Y = ALCOVE_H - 0.036

export function BrevilleBaristaExpressModel() {
  return (
    <group>
      <Shell
        width={W}
        depth={D}
        height={CASE_H}
        alcoveHeight={ALCOVE_H}
        alcoveDepth={ALCOVE_D}
        bodyDepth={BODY_D}
        finish="brushedSteel"
        radius={0.014}
      />

      <WaterTank
        position={[0, ALCOVE_H, -FRONT + TANK_D / 2]}
        width={0.27}
        height={0.155}
        depth={TANK_D - 0.004}
        variant="rear"
      />

      <Part id="chassis">
        {/* Recessed cup-warming well on the top right */}
        <mesh position={[0.075, CASE_H - 0.0015, 0.02]}>
          <boxGeometry args={[0.13, 0.004, 0.14]} />
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
        <group position={[0, 0.26, -D / 2 + 0.0015]} rotation={[Math.PI / 2, 0, 0]}>
          <Vents position={[0, 0, 0]} count={8} length={0.12} spacing={0.009} />
        </group>

        <Badge position={[-0.132, 0.245, PANEL - 0.001]} width={0.042} />
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
        position={[0.133, 0.19, PANEL - 0.004]}
        length={0.105}
        variant="swivel"
        tilt={0.2}
        yaw={0.14}
      />

      <DripTray position={[0, 0, 0.09]} width={0.306} depth={0.128} height={0.042} float slats={14} />

      <Boiler position={[0.02, 0.235, 0.02]} variant="thermocoil" size={0.105} radius={0.03} />

      {/* Grinder: hopper on the left shoulder, dial on the left flank, chute
          over the portafilter cradle. */}
      <BeanHopper
        position={[-0.075, CASE_H, -0.01]}
        height={HOPPER_H}
        topRadius={0.043}
        bottomRadius={0.022}
      />
      <Part id="grinder">
        <GrindDial position={[-W / 2 - 0.004, 0.25, 0.03]} radius={0.026} />
        {/* Dosing chute above the cradle */}
        <mesh position={[-0.09, ALCOVE_H - 0.012, 0.085]}>
          <cylinderGeometry args={[0.014, 0.011, 0.026, 20]} />
          <Surface finish="black" />
        </mesh>
        {/* Moulded cradle recess the portafilter sits in while grinding */}
        <mesh position={[-0.09, 0.085, 0.04]}>
          <boxGeometry args={[0.08, 0.075, 0.004]} />
          <Surface finish="darkPlastic" color="#191617" />
        </mesh>
      </Part>

      <Part id="control-panel">
        <PressureGauge position={[-0.05, 0.208, PANEL]} radius={0.029} reading={0.66} />
        <RoundButton position={[0.062, 0.226, PANEL]} radius={0.0095} />
        <RoundButton position={[0.062, 0.19, PANEL]} radius={0.0095} lit />
        <RoundButton position={[-0.132, 0.19, PANEL]} radius={0.008} finish="black" />
        <SteamKnob position={[0.132, 0.262, PANEL]} radius={0.015} />
      </Part>
    </group>
  )
}

const anchors: PartAnchor[] = [
  {
    partId: 'boiler',
    position: [0.02, 0.245, 0.03],
    normal: normal(0),
    camera: frame([0.02, 0.23, 0], 26, 10, 0.62),
    internal: true,
  },
  {
    partId: 'group-head',
    position: [GROUP_X, GROUP_Y + 0.018, GROUP_Z + 0.036],
    normal: normal(6, 4),
    camera: frame([GROUP_X, 0.135, 0.05], 20, 8, 0.44),
  },
  {
    partId: 'portafilter',
    position: [GROUP_X, GROUP_Y - 0.03, GROUP_Z + 0.09],
    normal: normal(4, 22),
    camera: frame([GROUP_X, 0.105, 0.09], 26, 14, 0.46),
  },
  {
    partId: 'steam-wand',
    position: [0.146, 0.125, 0.175],
    normal: normal(52, 6),
    camera: frame([0.12, 0.16, 0.09], 54, 10, 0.5),
  },
  {
    partId: 'water-reservoir',
    position: [0, 0.245, -FRONT - 0.004],
    normal: normal(180),
    camera: frame([0, 0.24, -0.06], 196, 18, 0.62),
  },
  {
    partId: 'drip-tray',
    position: [0, 0.05, 0.142],
    normal: normal(4, 42),
    camera: frame([0, 0.07, 0.06], 18, 22, 0.46),
  },
  {
    partId: 'grinder',
    position: [-0.075, CASE_H + 0.05, -0.01],
    normal: normal(-26, 40),
    camera: frame([-0.06, 0.31, -0.01], -34, 24, 0.56),
  },
  {
    partId: 'control-panel',
    position: [-0.05, 0.208, PANEL + 0.006],
    normal: normal(0),
    camera: frame([0, 0.21, 0.06], 12, 6, 0.46),
  },
]

export const brevilleBaristaExpress: MachineModelDefinition = {
  machineId: 'breville-barista-express',
  source: { kind: 'primitive', Component: BrevilleBaristaExpressModel },
  size: { width: W, height: TOTAL_H, depth: D },
  home: frame([0, 0.185, 0], 32, 14, 0.82),
  anchors,
}
