/**
 * Plain-language definitions for the vocabulary this guide cannot avoid.
 *
 * The site is written for someone choosing their first machine, and the copy
 * uses "portafilter" 49 times and "PID" 44 times. Somebody has to say what
 * those are, once, where they are first read.
 *
 * `match` is what appears in prose; `term` is how the definition is titled.
 * Order matters — longer phrases first, so "pressurised basket" is matched
 * before "basket" and "dual boiler" before "boiler".
 */
export interface GlossaryEntry {
  match: string[]
  term: string
  definition: string
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    match: ['pressurised basket', 'pressurised baskets'],
    term: 'Pressurised basket',
    definition:
      'A filter basket with a single tiny outlet that fakes the resistance good coffee would create on its own. It makes supermarket ground coffee produce something crema-like, and it puts a hard ceiling on how good the cup can get. Most machines ship with one; better shots come from the unpressurised basket.',
  },
  {
    match: ['pre-infusion'],
    term: 'Pre-infusion',
    definition:
      'A gentle wetting of the coffee at low pressure before the pump comes up to full force. It settles the bed evenly so water cannot carve a channel straight through, which is the most common reason a shot tastes thin and sour.',
  },
  {
    match: ['portafilter', 'portafilters'],
    term: 'Portafilter',
    definition:
      'The handled metal basket holder you fill with ground coffee and lock into the machine. Its diameter — 58, 57, 54 or 51 mm — decides which tampers, baskets and accessories fit, so it quietly determines what you can buy later.',
  },
  {
    match: ['group head', 'group heads'],
    term: 'Group head',
    definition:
      'The fitting the portafilter locks into, where hot water meets coffee. A heavy brass one holds heat between shots; a light aluminium one cools between them and needs a flush.',
  },
  {
    match: ['dual boiler'],
    term: 'Dual boiler',
    definition:
      'Two separate heaters — one held at brew temperature, one at steam temperature. It means you can pull a shot and steam milk at the same moment, with no waiting and no temperature compromise.',
  },
  {
    match: ['single boiler'],
    term: 'Single boiler',
    definition:
      'One heater doing both jobs. You brew, then wait for it to climb to steam temperature, then wait again for it to come back down. Perfectly good coffee — it just asks for patience every morning.',
  },
  {
    match: ['thermoblock', 'thermocoil', 'thermojet'],
    term: 'Thermoblock',
    definition:
      'A metal block that heats water as it flows through, instead of storing a tankful hot. Ready in seconds from cold, but it holds almost no heat in reserve, so long or back-to-back shots can drift.',
  },
  {
    match: ['PID'],
    term: 'PID',
    definition:
      'An electronic controller that holds water temperature to about a degree, instead of a simple thermostat swinging several degrees either side. Steadier temperature means a shot tastes the same on Tuesday as it did on Sunday.',
  },
  {
    match: ['burr grinder', 'burr grinders'],
    term: 'Burr grinder',
    definition:
      'A grinder that crushes beans between two shaped discs, producing evenly sized particles. The cheap spinning-blade sort chops at random, and espresso cannot work with the result at any price.',
  },
  {
    match: ['tamping', 'tamp'],
    term: 'Tamp',
    definition:
      'Pressing the grounds flat and firm in the basket so water meets one even bed rather than finding the loosest path through it.',
  },
  {
    match: ['dose'],
    term: 'Dose',
    definition:
      'The weight of dry coffee in the basket, usually 16–20 g for a double. Weighing it is the single cheapest way to make shots repeatable.',
  },
  {
    match: ['crema'],
    term: 'Crema',
    definition:
      'The hazelnut foam on top of a fresh shot, made of carbon dioxide from recently roasted beans. A sign of fresh coffee — not, on its own, a sign of a good one.',
  },
]

/** Longest match first so "dual boiler" wins over "boiler". */
export const GLOSSARY_MATCHERS = GLOSSARY.flatMap((entry) =>
  entry.match.map((match) => ({ match, entry })),
).sort((a, b) => b.match.length - a.match.length)
