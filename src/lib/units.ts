export type UnitSystem = 'metric' | 'imperial'

const CM_PER_INCH = 2.54
const LB_PER_KG = 2.2046226
const FL_OZ_PER_LITRE = 33.814

/** Drops a trailing .0 so "13.0 in" reads as "13 in". */
function trim(value: number, places = 1): string {
  return value.toFixed(places).replace(/\.0+$/, '')
}

export function formatLength(cm: number, system: UnitSystem): string {
  return system === 'metric' ? `${trim(cm)} cm` : `${trim(cm / CM_PER_INCH)} in`
}

/** Bare number, for drawing labels that carry their own unit. */
export function lengthValue(cm: number, system: UnitSystem): string {
  return system === 'metric' ? trim(cm) : trim(cm / CM_PER_INCH)
}

export function lengthUnit(system: UnitSystem): string {
  return system === 'metric' ? 'cm' : 'in'
}

export function formatFootprint(widthCm: number, depthCm: number, system: UnitSystem): string {
  return system === 'metric'
    ? `${trim(widthCm)} × ${trim(depthCm)} cm`
    : `${trim(widthCm / CM_PER_INCH)} × ${trim(depthCm / CM_PER_INCH)} in`
}

export function formatWeight(kg: number, system: UnitSystem): string {
  return system === 'metric' ? `${trim(kg)} kg` : `${trim(kg * LB_PER_KG)} lb`
}

export function formatVolume(litres: number, system: UnitSystem): string {
  return system === 'metric'
    ? `${trim(litres)} L`
    : `${Math.round(litres * FL_OZ_PER_LITRE)} oz`
}

/**
 * Portafilter and basket sizes stay in millimetres in both systems.
 *
 * "58 mm" is the name of the standard, not a measurement to be converted — US
 * retailers, tamper makers and basket manufacturers all say 58 mm. Rendering it
 * as 2.3 in would be arithmetically correct and useless.
 */
export function formatPortafilter(mm: number): string {
  return `${mm} mm`
}
