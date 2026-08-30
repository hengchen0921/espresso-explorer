import machinesJson from './machines.json'
import partsJson from './parts.json'
import type { Machine, PartDefinition, PartId, ResolvedPart } from './types'

export const machines = machinesJson as Machine[]
export const parts = partsJson as PartDefinition[]

const machineIndex = new Map(machines.map((m) => [m.id, m]))
const partIndex = new Map(parts.map((p) => [p.id, p]))

/**
 * `machines.json` is brought in through a blunt `as Machine[]` cast, so a typo
 * in an enum-valued field type-checks cleanly and only fails later, wherever
 * something indexes a lookup table with it. These checks turn that into a loud
 * warning at startup in development instead.
 */
if (import.meta.env?.DEV) {
  const FINISHES = new Set(['brushed-steel', 'stainless', 'graphite'])
  const CATEGORIES = new Set(['All-in-one', 'Single boiler', 'Dual boiler', 'Compact'])
  const SKILLS = new Set(['gentle', 'moderate', 'steep'])
  const INSTRUMENTS = new Set(['gauge', 'lcd', 'switches', 'buttons'])

  for (const machine of machines) {
    const problems: string[] = []
    if (!FINISHES.has(machine.finish)) problems.push(`finish "${machine.finish}"`)
    if (!CATEGORIES.has(machine.category)) problems.push(`category "${machine.category}"`)
    if (!SKILLS.has(machine.skillFloor)) problems.push(`skillFloor "${machine.skillFloor}"`)
    if (!INSTRUMENTS.has(machine.specs.instrumentation)) {
      problems.push(`instrumentation "${machine.specs.instrumentation}"`)
    }
    if (problems.length > 0) {
      console.warn(`[data] ${machine.id} has unknown ${problems.join(', ')}`)
    }
  }
}

export function getMachine(id: string | undefined): Machine | undefined {
  return id ? machineIndex.get(id) : undefined
}

export function getMachines(ids: string[]): Machine[] {
  return ids.map((id) => machineIndex.get(id)).filter((m): m is Machine => Boolean(m))
}

export function getPart(id: PartId): PartDefinition | undefined {
  return partIndex.get(id)
}

/**
 * Merges the shared part library with a machine's per-part specifics. The UI
 * only ever sees this resolved shape, so adding a machine never means
 * rewriting the generic copy.
 */
export function resolveParts(machine: Machine): ResolvedPart[] {
  return machine.parts.flatMap((ref) => {
    const def = partIndex.get(ref.partId)
    if (!def) {
      if (import.meta.env?.DEV) {
        console.warn(`[data] ${machine.id} references unknown part "${ref.partId}"`)
      }
      return []
    }
    return [
      {
        ...def,
        component: ref.component,
        spec: ref.spec,
        figures: ref.figures,
        capability: ref.capability,
        note: ref.note,
      },
    ]
  })
}

export function resolvePart(machine: Machine, partId: PartId): ResolvedPart | undefined {
  return resolveParts(machine).find((p) => p.id === partId)
}

export const priceRange = {
  min: Math.min(...machines.map((m) => m.price)),
  max: Math.max(...machines.map((m) => m.price)),
}

export type {
  Machine,
  MachineSpecs,
  PartDefinition,
  PartFigure,
  PartId,
  ResolvedPart,
} from './types'
