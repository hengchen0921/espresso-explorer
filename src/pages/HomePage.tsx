import { Suspense, lazy, useMemo, useState } from 'react'
import { machines, parts, priceRange } from '@/data'
import type { Category } from '@/data/types'
import { capitalise, cx, formatPrice, spellOut } from '@/lib/format'
import { MachineCard } from '@/components/MachineCard'
import { ArrowGlyph, ButtonLink } from '@/components/ui/Button'
import { Container, SectionHeading } from '@/components/ui/Section'

const HeroCanvas = lazy(() => import('@/components/viewer/HeroCanvas'))

const CATEGORIES: Array<Category | 'All'> = [
  'All',
  'All-in-one',
  'Single boiler',
  'Dual boiler',
  'Compact',
]
type Sort = 'featured' | 'price-asc' | 'price-desc'

const SORTS: Array<{ id: Sort; label: string }> = [
  { id: 'featured', label: 'Editor order' },
  { id: 'price-asc', label: 'Price ↑' },
  { id: 'price-desc', label: 'Price ↓' },
]

const DECIDERS = [
  {
    title: 'The grinder decides more than the machine does.',
    body: 'A $900 machine fed by a $60 grinder makes worse coffee than a $450 machine fed by a $300 one. If a machine has no grinder built in, its real price is the number on the box plus about $250. Two of the five here include one; the other three do not, and pretending otherwise is the most common way people overspend.',
  },
  {
    title: 'Your patience decides the thermal system.',
    body: 'A thermoblock is ready in seconds and holds almost no heat in reserve. A brass boiler is rock steady through a shot and wants twenty minutes before you touch it. Neither is better — they suit different mornings. Be honest about whether you will actually wait, because the machine will not compromise.',
  },
  {
    title: 'The portafilter decides what you can buy next.',
    body: '58 mm is the commercial standard, so every tamper, basket and distribution tool fits and resale is easy. 54 mm and 51 mm work, but the accessory aisle narrows and pressurised baskets put a ceiling on how good the cup can get. This is the spec people ignore first and regret longest.',
  },
]

export function HomePage() {
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [sort, setSort] = useState<Sort>('featured')

  const filtered = useMemo(() => {
    const list = machines.filter((m) => category === 'All' || m.category === category)
    if (sort === 'price-asc') return [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...list].sort((a, b) => b.price - a.price)
    return list
  }, [category, sort])

  // Break the grid's rhythm rather than tiling identical cards. Rows of three
  // lead; if the tail would leave a ragged row, the last one or two tiles go
  // wide so every row fills whatever the filter leaves behind.
  const spanFor = (index: number, total: number) => {
    if (total === 1) return 'lg:col-span-6'
    if (total === 2) return 'lg:col-span-3'
    const remainder = total % 3
    if (remainder === 2 && index >= total - 2) return 'lg:col-span-3'
    if (remainder === 1 && index >= total - 1) return 'lg:col-span-6'
    return 'lg:col-span-2'
  }

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <Container className="relative grid gap-10 pt-10 pb-16 lg:grid-cols-12 lg:gap-6 lg:pt-16 lg:pb-24">
          <div className="lg:col-span-6 lg:pt-10">
            <p className="eyebrow animate-fade">Interactive teardown · 2026 buyer's guide</p>

            <h1 className="mt-7 text-[clamp(2.6rem,6.6vw,5.6rem)] leading-[0.94] tracking-[-0.03em] animate-rise">
              Every espresso machine
              <span className="block text-copper">looks the same</span>
              until you take it apart.
            </h1>

            <p
              className="mt-8 max-w-[52ch] text-[1.05rem] leading-[1.72] text-ash animate-rise"
              style={{ animationDelay: '90ms' }}
            >
              {capitalise(spellOut(machines.length))} machines people actually cross-shop, rebuilt
              in 3D and pulled apart component by component. Turn one around, open up the boiler,
              and find out what the spec sheet was trying to tell you.
            </p>

            <div
              className="mt-10 flex flex-wrap items-center gap-3 animate-rise"
              style={{ animationDelay: '150ms' }}
            >
              <ButtonLink to="/machines/breville-barista-express" className="group">
                Open a machine
                <ArrowGlyph className="group-hover:translate-x-1" />
              </ButtonLink>
              <ButtonLink to="/compare" variant="outline">
                Compare side by side
              </ButtonLink>
            </div>

            <dl
              className="hairline mt-14 grid max-w-lg grid-cols-3 gap-6 pt-6 animate-fade"
              style={{ animationDelay: '260ms' }}
            >
              {[
                ['Machines', String(machines.length)],
                ['Components', String(parts.length)],
                ['Price range', `${formatPrice(priceRange.min)}–${formatPrice(priceRange.max)}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="eyebrow">{label}</dt>
                  <dd className="mt-2 font-display text-[1.35rem] tracking-[-0.01em]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink sm:aspect-[16/11] lg:aspect-auto lg:h-[min(74vh,660px)]">
              <div className="absolute inset-0 stage-vignette" aria-hidden />
              <Suspense fallback={null}>
                <HeroCanvas machineId="breville-barista-express" />
              </Suspense>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist/60">
                    Shown
                  </p>
                  <p className="mt-1.5 font-display text-[1.1rem] text-crema">
                    Breville Barista Express
                  </p>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist/50">
                  Drag to rotate
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------- Machines */}
      <section id="machines" className="scroll-mt-24">
        <Container>
          <SectionHeading
            eyebrow="The shortlist"
            index={String(machines.length).padStart(2, '0')}
            title={
              <>
                {capitalise(spellOut(machines.length))} machines,{' '}
                <em className="font-normal italic text-copper">honestly</em> described.
              </>
            }
            lede={
              <p>
                Nothing here is ordered or recommended by commission, and there is no "best
                overall". Each one is the right answer for a different kitchen and a different
                amount of patience — the job here is working out which kitchen is yours.
              </p>
            }
          />

          <div className="mt-12 flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  aria-pressed={category === option}
                  className={cx(
                    'rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-300',
                    category === option
                      ? 'border-ink bg-ink text-linen'
                      : 'border-ink/15 text-stone hover:border-copper hover:text-copper',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="eyebrow mr-2 hidden sm:inline">Sort</span>
              {SORTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSort(option.id)}
                  aria-pressed={sort === option.id}
                  className={cx(
                    'rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-300',
                    sort === option.id ? 'text-ink underline decoration-copper underline-offset-4' : 'text-stone hover:text-copper',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {filtered.map((machine, index) => {
              const span = spanFor(index, filtered.length)
              return (
                <div key={machine.id} className={cx('sm:col-span-1', span)}>
                  <MachineCard
                    machine={machine}
                    index={machines.indexOf(machine)}
                    wide={span !== 'lg:col-span-2'}
                  />
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <p className="py-20 text-center text-ash">Nothing in that category yet.</p>
          )}
        </Container>
      </section>

      {/* -------------------------------------------------------- Editorial band */}
      <section className="mt-28 bg-espresso py-20 text-crema md:py-28">
        <Container>
          <p className="eyebrow text-mist/60">Before you look at a single price</p>
          <h2 className="mt-6 max-w-[18ch] text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.02] text-linen">
            Three decisions, and the rest is detail.
          </h2>

          <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {DECIDERS.map((item, i) => (
              <li key={item.title} className="hairline-dark pt-6">
                <span className="font-mono text-[10px] tracking-[0.16em] text-copper">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-5 text-[1.32rem] leading-[1.18] text-linen">{item.title}</h3>
                <p className="mt-4 text-[0.92rem] leading-[1.72] text-crema/65">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <section className="mt-28">
        <Container>
          <div className="hairline flex flex-col items-start justify-between gap-8 pt-10 md:flex-row md:items-end">
            <h2 className="max-w-[16ch] text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.05]">
              Put two or three of them side by side.
            </h2>
            <div className="flex shrink-0 flex-wrap gap-3">
              <ButtonLink to="/lineup" variant="outline" className="group">
                See all {machines.length} together
                <ArrowGlyph className="group-hover:translate-x-1" />
              </ButtonLink>
              <ButtonLink to="/compare" className="group">
                Open the comparison
                <ArrowGlyph className="group-hover:translate-x-1" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
