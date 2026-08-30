/**
 * Domain types for the machine catalogue. These mirror the shape of
 * `machines.json` and `parts.json` exactly — those files are the source of
 * truth for content, and the casts in `data/index.ts` are the only place the
 * two are tied together.
 */

export const PART_IDS = [
  'boiler',
  'group-head',
  'portafilter',
  'steam-wand',
  'water-reservoir',
  'drip-tray',
  'grinder',
  'control-panel',
] as const

export type PartId = (typeof PART_IDS)[number]

/** Editorial copy about a component, shared across every machine that has one. */
export interface PartDefinition {
  id: PartId
  name: string
  shortName: string
  /** Grouping label shown in the panel header: Brew, Milk, Thermal… */
  system: string
  /** What the component does, mechanically. */
  fn: string
  /** What a buyer should take from it. */
  whyItMatters: string
}

export type Finish = 'brushed-steel' | 'stainless' | 'graphite'
export type SkillFloor = 'gentle' | 'moderate' | 'steep'
export type Instrumentation = 'gauge' | 'lcd' | 'switches' | 'buttons'
export type Category = 'All-in-one' | 'Single boiler' | 'Dual boiler' | 'Compact'

export interface MachineSpecs {
  heating: string
  heatUpSeconds: number
  portafilterMm: number
  basketType: string
  pumpBar: number
  tankLitres: number
  pid: boolean
  grinder: boolean
  steamWand: string
  /** What the machine tells you about itself while it works. */
  instrumentation: Instrumentation
  wattage: number
  weightKg: number
  widthCm: number
  depthCm: number
  heightCm: number
}

/** One measurable fact about the component fitted to a particular machine. */
export interface PartFigure {
  label: string
  value: string
}

/**
 * A machine's take on one component. The shared `PartDefinition` explains what
 * the class of component does; everything here is about the specific part this
 * machine actually ships with.
 */
export interface MachinePartRef {
  partId: PartId
  /** The component as fitted: material, size, designation. */
  component: string
  /** Compact one-liner for the component list beside the viewer. */
  spec: string
  /** Hard numbers for this exact part. */
  figures: PartFigure[]
  /** What this specific part can and cannot do. */
  capability: string
  /** What it means for the buying decision. */
  note: string
}

export interface Machine {
  id: string
  brand: string
  name: string
  modelCode: string
  price: number
  category: Category
  categoryNote: string
  releaseYear: number
  finish: Finish
  skillFloor: SkillFloor
  tagline: string
  summary: string
  bestFor: string
  verdict: string
  pros: string[]
  cons: string[]
  specs: MachineSpecs
  parts: MachinePartRef[]
}

/** Shared part copy merged with one machine's specifics — what the UI renders. */
export interface ResolvedPart extends PartDefinition {
  component: string
  spec: string
  figures: PartFigure[]
  capability: string
  note: string
}
