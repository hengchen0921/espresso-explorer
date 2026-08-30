const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  return priceFormatter.format(value)
}

/** 3 → "3 sec", 300 → "5 min", 1200 → "20 min". */
export function formatDuration(seconds: number): string {
  if (seconds < 90) return `${seconds} sec`
  return `${Math.round(seconds / 60)} min`
}

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
]

/** Prose reads better with small numbers spelled out; large ones fall back. */
export function spellOut(value: number): string {
  return NUMBER_WORDS[value] ?? String(value)
}

export function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function slugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
