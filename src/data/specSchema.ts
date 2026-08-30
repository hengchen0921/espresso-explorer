import { formatDuration, formatFootprint, formatLitres, formatPrice } from '@/lib/format'
import type { Machine } from './types'

export type CompareDirection = 'lower' | 'higher' | 'none'

export interface SpecRow {
  key: string
  label: string
  group: SpecGroup
  /** Rendered cell text. */
  value: (machine: Machine) => string
  /**
   * Optional numeric projection used to mark the strongest machine in a
   * comparison. Rows without one are informational — plenty of specs
   * (steam wand type, basket type) have no single "better" answer.
   */
  score?: (machine: Machine) => number
  better?: CompareDirection
  /** One line explaining what the row actually tells a buyer. */
  hint?: string
}

export type SpecGroup = 'Cost' | 'Thermal' | 'Brew' | 'Milk' | 'Water' | 'Grind' | 'Physical'

export const SPEC_GROUPS: SpecGroup[] = [
  'Cost',
  'Thermal',
  'Brew',
  'Milk',
  'Water',
  'Grind',
  'Physical',
]

const INSTRUMENT_LABEL: Record<Machine['specs']['instrumentation'], string> = {
  gauge: 'Analogue pressure gauge',
  lcd: 'Digital display',
  switches: 'Indicator light only',
  buttons: 'None — backlit buttons',
}

/** Rank by how much the machine tells you while it is working. */
const INSTRUMENT_RANK: Record<Machine['specs']['instrumentation'], number> = {
  gauge: 3,
  lcd: 2,
  switches: 1,
  buttons: 0,
}

const SKILL_LABEL: Record<Machine['skillFloor'], string> = {
  gentle: 'Gentle — usable on day one',
  moderate: 'Moderate — some technique required',
  steep: 'Steep — expects you to learn',
}

export const SPEC_ROWS: SpecRow[] = [
  {
    key: 'price',
    label: 'Street price',
    group: 'Cost',
    value: (m) => formatPrice(m.price),
    score: (m) => m.price,
    better: 'lower',
  },
  {
    key: 'category',
    label: 'Type',
    group: 'Cost',
    value: (m) => `${m.category} · ${m.categoryNote}`,
  },
  {
    key: 'skillFloor',
    label: 'Learning curve',
    group: 'Cost',
    value: (m) => SKILL_LABEL[m.skillFloor],
    hint: 'How much technique the machine expects before it makes good coffee.',
  },
  {
    key: 'heating',
    label: 'Heating system',
    group: 'Thermal',
    value: (m) => m.specs.heating,
    hint: 'Thermoblocks are fast and shallow; boilers are slow and stable.',
  },
  {
    key: 'heatUp',
    label: 'Time to brew-ready',
    group: 'Thermal',
    value: (m) => formatDuration(m.specs.heatUpSeconds),
    score: (m) => m.specs.heatUpSeconds,
    better: 'lower',
    hint: 'From cold. Boiler machines need longer again for the group to settle.',
  },
  {
    key: 'pid',
    label: 'PID temperature control',
    group: 'Thermal',
    value: (m) => (m.specs.pid ? 'Yes' : 'No — thermostat only'),
    score: (m) => (m.specs.pid ? 1 : 0),
    better: 'higher',
    hint: 'Without it, brew temperature drifts and you time shots to the heating light.',
  },
  {
    key: 'portafilter',
    label: 'Portafilter size',
    group: 'Brew',
    value: (m) => `${m.specs.portafilterMm} mm`,
    score: (m) => m.specs.portafilterMm,
    better: 'higher',
    hint: '58 mm is the commercial standard, so accessories are cheap and everywhere.',
  },
  {
    key: 'baskets',
    label: 'Baskets supplied',
    group: 'Brew',
    value: (m) => m.specs.basketType,
    hint: 'Pressurised baskets forgive a bad grind and cap how good the cup can get.',
  },
  {
    key: 'pump',
    label: 'Pump pressure',
    group: 'Brew',
    value: (m) => `${m.specs.pumpBar} bar`,
    hint: 'Every machine here quotes 15 bar and regulates down to about 9 at the puck.',
  },
  {
    key: 'instrumentation',
    label: 'Instrumentation',
    group: 'Brew',
    value: (m) => INSTRUMENT_LABEL[m.specs.instrumentation],
    score: (m) => INSTRUMENT_RANK[m.specs.instrumentation],
    better: 'higher',
    hint: 'A gauge diagnoses a bad grind before you taste it; a timer only says how long.',
  },
  {
    key: 'steamWand',
    label: 'Steam wand',
    group: 'Milk',
    value: (m) => m.specs.steamWand,
    hint: 'A panarello froths; a bare commercial wand textures pourable microfoam.',
  },
  {
    key: 'tank',
    label: 'Reservoir',
    group: 'Water',
    value: (m) => formatLitres(m.specs.tankLitres),
    score: (m) => m.specs.tankLitres,
    better: 'higher',
  },
  {
    key: 'grinder',
    label: 'Built-in grinder',
    group: 'Grind',
    value: (m) => (m.specs.grinder ? 'Yes — conical burr' : 'No — buy separately'),
    hint: 'Budget $150–400 more if the answer is no. A grinder matters more than the machine.',
  },
  {
    key: 'footprint',
    label: 'Footprint',
    group: 'Physical',
    value: (m) => formatFootprint(m.specs.widthCm, m.specs.depthCm),
    score: (m) => m.specs.widthCm * m.specs.depthCm,
    better: 'lower',
    hint: 'Width × depth on the counter, excluding clearance for the tank lid.',
  },
  {
    key: 'height',
    label: 'Height',
    group: 'Physical',
    value: (m) => `${m.specs.heightCm} cm`,
    hint: 'Check it against the underside of your wall cabinets, tank lid included.',
  },
  {
    key: 'weight',
    label: 'Weight',
    group: 'Physical',
    value: (m) => `${m.specs.weightKg} kg`,
    hint: 'Weight is mostly boiler and frame — heavier usually means more thermal mass.',
  },
  {
    key: 'power',
    label: 'Power draw',
    group: 'Physical',
    value: (m) => `${m.specs.wattage} W`,
  },
]

/**
 * Ids of the machines that win a row. Returns an empty set for informational
 * rows and for ties across every machine, so nothing is highlighted when the
 * distinction is meaningless.
 */
export function winnersFor(row: SpecRow, machines: Machine[]): Set<string> {
  if (!row.score || !row.better || row.better === 'none' || machines.length < 2) {
    return new Set()
  }
  const scored = machines.map((m) => ({ id: m.id, score: row.score!(m) }))
  const best =
    row.better === 'lower'
      ? Math.min(...scored.map((s) => s.score))
      : Math.max(...scored.map((s) => s.score))
  const winners = scored.filter((s) => s.score === best)
  if (winners.length === machines.length) return new Set()
  return new Set(winners.map((s) => s.id))
}
