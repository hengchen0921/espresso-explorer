import { brevilleBambino } from './machines/BrevilleBambino'
import { brevilleBambinoPlus } from './machines/BrevilleBambinoPlus'
import { brevilleBaristaExpress } from './machines/BrevilleBaristaExpress'
import { brevilleBaristaPro } from './machines/BrevilleBaristaPro'
import { brevilleDualBoiler } from './machines/BrevilleDualBoiler'
import { delonghiDedica } from './machines/DelonghiDedica'
import { gaggiaClassicPro } from './machines/GaggiaClassicPro'
import { lelitAnna } from './machines/LelitAnna'
import { rancilioSilvia } from './machines/RancilioSilvia'
import type { MachineModelDefinition } from './types'

/**
 * The seam between the catalogue and the geometry.
 *
 * Every machine resolves to exactly one `MachineModelDefinition`, and the
 * viewer only ever talks to this shape. Replacing a primitive build with a
 * real asset is a change to one entry:
 *
 *   source: {
 *     kind: 'gltf',
 *     url: '/models/rancilio-silvia.glb',
 *     partNodes: { GroupHead_01: 'group-head', Wand: 'steam-wand', ... },
 *   }
 *
 * …plus re-measuring that machine's `anchors` against the new asset. No page,
 * panel, hotspot or camera behaviour changes, because none of them know which
 * kind of source they are looking at.
 */
const definitions: MachineModelDefinition[] = [
  brevilleBaristaExpress,
  brevilleBaristaPro,
  gaggiaClassicPro,
  lelitAnna,
  rancilioSilvia,
  brevilleDualBoiler,
  brevilleBambinoPlus,
  brevilleBambino,
  delonghiDedica,
]

const registry = new Map(definitions.map((d) => [d.machineId, d]))

export function getModelDefinition(machineId: string): MachineModelDefinition | undefined {
  return registry.get(machineId)
}

export function hasModel(machineId: string): boolean {
  return registry.has(machineId)
}

export { definitions as modelDefinitions }
