import { machines } from './index'
import { formatLength, type UnitSystem } from '@/lib/units'
import type { Machine } from './types'

/**
 * The recommender.
 *
 * This is a transparent scoring model, not a language model. That is a
 * deliberate choice, not a shortcut: the site is a static build with no server,
 * so calling an LLM would mean shipping an API key to the browser where anyone
 * could read and spend it. Scoring in the client is instant, free, works
 * offline, and — the part that actually matters for a buying guide — can show
 * its reasoning. Every recommendation below states why, and every rejection
 * states what ruled the machine out.
 */

export interface FinderAnswers {
  milk: 'none' | 'one-two' | 'three-four' | 'five-plus'
  grinder: 'own' | 'will-buy' | 'wont-buy'
  space: 'tiny' | 'modest' | 'roomy' | 'any'
  budget: 'under-400' | 'under-700' | 'under-1100' | 'open'
  learning: 'minimal' | 'some' | 'tinker'
  patience: 'seconds' | 'a-minute' | 'planned'
}

export type FinderQuestionId = keyof FinderAnswers

export interface FinderQuestion {
  id: FinderQuestionId
  question: string
  hint: string
  options: Array<{ value: string; label: string; detail: string }>
}

export const FINDER_QUESTIONS: FinderQuestion[] = [
  {
    id: 'milk',
    question: 'How many milk drinks on a typical morning?',
    hint: 'This decides more about the machine than anything else on this page.',
    options: [
      { value: 'none', label: 'None', detail: 'Espresso, americano, or black' },
      { value: 'one-two', label: 'One or two', detail: 'Just me, or me and one other' },
      { value: 'three-four', label: 'Three or four', detail: 'A household' },
      { value: 'five-plus', label: 'Five or more', detail: 'Or guests, regularly' },
    ],
  },
  {
    id: 'grinder',
    question: 'What about a grinder?',
    hint: 'Grind quality matters more than machine quality. A machine without one is not cheaper — it is unfinished.',
    options: [
      { value: 'own', label: 'I already own a good one', detail: 'Burr grinder, espresso-capable' },
      { value: 'will-buy', label: "I'll buy one separately", detail: 'Budget around $250 more' },
      { value: 'wont-buy', label: 'I want it built in', detail: 'One box, one purchase' },
    ],
  },
  {
    id: 'space',
    question: 'How much counter width can you give it?',
    hint: 'Measure it. Depth matters too — most of these need 30 cm or more, plus room to lift the tank lid.',
    options: [
      { value: 'tiny', label: 'Very little', detail: 'Under 20 cm / 8 in' },
      { value: 'modest', label: 'A narrow slot', detail: 'Under 26 cm / 10 in' },
      { value: 'roomy', label: 'A normal gap', detail: 'Under 34 cm / 13 in' },
      { value: 'any', label: 'Plenty', detail: 'Whatever it needs' },
    ],
  },
  {
    id: 'budget',
    question: 'What is the total budget — machine and grinder together?',
    hint: 'Total, not the price on the box. A machine without a grinder needs about $250 more before it makes coffee.',
    options: [
      { value: 'under-400', label: 'Up to $400', detail: 'Everything included' },
      { value: 'under-700', label: 'Up to $700', detail: 'Everything included' },
      { value: 'under-1100', label: 'Up to $1,100', detail: 'Everything included' },
      { value: 'open', label: 'Open', detail: 'If it earns it' },
    ],
  },
  {
    id: 'learning',
    question: 'How much do you want to learn?',
    hint: 'Some of these make good coffee on day one. Some expect you to earn it.',
    options: [
      { value: 'minimal', label: 'As little as possible', detail: 'I want the coffee, not the hobby' },
      { value: 'some', label: 'Happy to learn the basics', detail: 'Dialling in, texturing milk' },
      { value: 'tinker', label: 'I want to tinker', detail: 'Mods, accessories, taking it apart' },
    ],
  },
  {
    id: 'patience',
    question: 'How long will you wait in the morning?',
    hint: 'Heat-up is the single thing owners most underestimate.',
    options: [
      { value: 'seconds', label: 'Seconds', detail: 'Switch on and pull' },
      { value: 'a-minute', label: 'A minute or two', detail: 'Enough to grind and prep' },
      { value: 'planned', label: "I'll plan ahead", detail: 'Switch it on, go and shower' },
    ],
  },
]

/** What a separate grinder realistically adds to the total. */
export const SEPARATE_GRINDER_COST = 250

const BUDGET_CAP: Record<FinderAnswers['budget'], number> = {
  'under-400': 400,
  'under-700': 700,
  'under-1100': 1100,
  open: Number.POSITIVE_INFINITY,
}

const WIDTH_CAP: Record<FinderAnswers['space'], number> = {
  tiny: 20,
  modest: 26,
  roomy: 34,
  any: Number.POSITIVE_INFINITY,
}

export interface MachineMatch {
  machine: Machine
  /** 0–1. Only meaningful for machines that were not ruled out. */
  score: number
  totalCost: number
  reasons: string[]
  caveats: string[]
  /**
   * Every hard mismatch, not just the first. A machine that fails only on price
   * is far closer to being the answer than one that fails on price, width and
   * grinder, and the "nothing fits" case is only useful if it can say so.
   */
  blockers: string[]
  /**
   * How hard those failures are to get around, for ranking the near-misses.
   * A counter is a fixed size; a budget can stretch; a preference for a
   * built-in grinder is the easiest of the three to reconsider.
   */
  blockerWeight: number
}

const isDualBoiler = (m: Machine) => m.specs.heating.includes('Twin')
const isFastHeater = (m: Machine) => m.specs.heatUpSeconds <= 60
const isPanarello = (m: Machine) => m.specs.steamWand.includes('Panarello')
const isAutoWand = (m: Machine) => m.specs.steamWand.includes('Automatic')

export function scoreMachine(
  machine: Machine,
  answers: FinderAnswers,
  units: UnitSystem = 'metric',
): MachineMatch {
  const reasons: string[] = []
  const caveats: string[] = []
  const blockers: string[] = []
  let blockerWeight = 0
  let points = 0

  const needsSeparateGrinder = !machine.specs.grinder
  const grinderCost =
    needsSeparateGrinder && answers.grinder !== 'own' ? SEPARATE_GRINDER_COST : 0
  const totalCost = machine.price + grinderCost

  // ---------------------------------------------------------------- milk (25)
  if (answers.milk === 'none') {
    points += 25
    if (isDualBoiler(machine)) {
      points -= 12
      caveats.push('Half this machine is a steam boiler you said you will not use.')
    } else {
      reasons.push('You are not asking it to steam milk, so its weakest circuit never matters.')
    }
  } else if (answers.milk === 'one-two') {
    if (isPanarello(machine)) {
      points += 12
      caveats.push('The frothing sleeve makes stiff foam, not the microfoam you pour patterns with.')
    } else {
      points += 25
      if (isAutoWand(machine)) {
        reasons.push('The automatic wand takes milk to temperature and texture without technique.')
      } else {
        reasons.push('A single boiler handles one or two milk drinks without complaint.')
      }
    }
  } else if (answers.milk === 'three-four') {
    if (isDualBoiler(machine)) {
      points += 25
      reasons.push('Two boilers means no mode switch and no cooling flush between drinks.')
    } else if (isFastHeater(machine) && !isPanarello(machine)) {
      points += 18
      caveats.push('One heater doing both jobs — quick, but it will drift across four drinks.')
    } else {
      points += 8
      caveats.push('A single boiler will make you wait between each drink at this volume.')
    }
  } else {
    if (isDualBoiler(machine)) {
      points += 25
      reasons.push('The only machine here that brews and steams at once — five drinks is a queue on anything else.')
    } else {
      points += 4
      caveats.push('At five drinks this becomes a twenty-minute job of waiting and flushing.')
    }
  }

  // ------------------------------------------------------------- grinder (20)
  if (answers.grinder === 'own') {
    if (machine.specs.grinder) {
      points += 6
      caveats.push('You would be paying roughly $300 for burrs you already have better versions of.')
    } else {
      points += 20
      reasons.push('No built-in grinder, so none of the price is burrs you already own.')
    }
  } else if (answers.grinder === 'will-buy') {
    points += machine.specs.grinder ? 18 : 17
    if (needsSeparateGrinder) {
      caveats.push(`Add about $${SEPARATE_GRINDER_COST} for the grinder before it makes coffee.`)
    } else {
      reasons.push('Grinder included, so it works out of the box and takes one footprint.')
    }
  } else {
    if (machine.specs.grinder) {
      points += 20
      reasons.push('Grinds, doses and brews in one box, which is what you asked for.')
    } else {
      blockers.push('No built-in grinder — it cannot make coffee without a separate one.')
      blockerWeight += 2
    }
  }

  // --------------------------------------------------------------- space (15)
  const widthCap = WIDTH_CAP[answers.space]
  if (machine.specs.widthCm > widthCap) {
    blockers.push(
      `${formatLength(machine.specs.widthCm, units)} wide — too big for the space you described.`,
    )
    blockerWeight += 4
  } else {
    points += 15
    if (widthCap !== Number.POSITIVE_INFINITY && machine.specs.widthCm <= widthCap - 6) {
      reasons.push(
        `At ${formatLength(machine.specs.widthCm, units)} it leaves room to spare on your counter.`,
      )
    }
  }

  // -------------------------------------------------------------- budget (20)
  const cap = BUDGET_CAP[answers.budget]
  if (totalCost > cap) {
    blockers.push(
      `$${totalCost.toLocaleString()} all in${grinderCost ? ' once you add a grinder' : ''} — over your budget.`,
    )
    blockerWeight += 1
  } else {
    points += 20
    const headroom = cap - totalCost
    if (cap !== Number.POSITIVE_INFINITY && headroom >= 250) {
      reasons.push(`$${totalCost.toLocaleString()} all in, leaving $${headroom.toLocaleString()} spare.`)
    }
  }

  // ------------------------------------------------------------ learning (10)
  if (answers.learning === 'minimal') {
    if (machine.skillFloor === 'gentle') {
      points += 10
      reasons.push('Usable properly on day one without learning to temperature-surf.')
    } else if (machine.skillFloor === 'moderate') {
      points += 5
    } else {
      caveats.push('Expects real technique — without a PID you time shots to a heating light.')
    }
  } else if (answers.learning === 'some') {
    points += machine.skillFloor === 'moderate' ? 10 : 7
  } else {
    if (machine.skillFloor === 'steep') {
      points += 10
      reasons.push('The most modified machines in home espresso — PID kits, springs, bottomless portafilters.')
    } else if (machine.skillFloor === 'moderate') {
      points += 8
    } else {
      points += 3
      caveats.push('Little to tinker with; the interesting decisions were made for you.')
    }
    if (machine.specs.portafilterMm >= 58) {
      reasons.push('58 mm, so every tamper, basket and distribution tool on the market fits.')
    }
  }

  // ------------------------------------------------------------ patience (10)
  if (answers.patience === 'seconds') {
    if (isFastHeater(machine)) {
      points += 10
      reasons.push(`Brew-ready in ${machine.specs.heatUpSeconds} seconds from cold.`)
    } else if (machine.specs.heatUpSeconds <= 300) {
      points += 3
      caveats.push(`Needs about ${Math.round(machine.specs.heatUpSeconds / 60)} minutes before the first shot.`)
    } else {
      caveats.push(`Wants ${Math.round(machine.specs.heatUpSeconds / 60)} minutes to reach a stable temperature.`)
    }
  } else if (answers.patience === 'a-minute') {
    points += machine.specs.heatUpSeconds <= 300 ? 10 : 5
    if (machine.specs.heatUpSeconds > 300) {
      caveats.push('Longer warm-up than you said you would wait for.')
    }
  } else {
    points += 10
    if (machine.specs.heatUpSeconds >= 300) {
      reasons.push('The long warm-up buys thermal mass, which is why its shots repeat so well.')
    }
  }

  return {
    machine,
    score: Math.max(0, Math.min(1, points / 100)),
    totalCost,
    reasons,
    caveats,
    blockers,
    blockerWeight,
  }
}

export interface FinderResult {
  matches: MachineMatch[]
  ruledOut: MachineMatch[]
}

export function findMachines(answers: FinderAnswers, units: UnitSystem = 'metric'): FinderResult {
  const scored = machines.map((machine) => scoreMachine(machine, answers, units))
  return {
    matches: scored.filter((m) => m.blockers.length === 0).sort((a, b) => b.score - a.score),
    // Fewest failures first: when nothing fits, the near-misses are the useful
    // part of the answer.
    ruledOut: scored
      .filter((m) => m.blockers.length > 0)
      .sort((a, b) => a.blockerWeight - b.blockerWeight || b.score - a.score),
  }
}
