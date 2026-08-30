import { Link } from 'react-router-dom'
import { machines, parts } from '@/data'
import { AMAZON_REQUIRED_DISCLOSURE, HAS_AFFILIATE_LINKS } from '@/data/retailers'
import { Container } from '@/components/ui/Section'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-32 bg-ink text-crema">
      <Container className="py-16 md:py-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Logo className="h-7 w-7 text-copper" />
            <p className="mt-7 max-w-[16ch] font-display text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.05] text-linen">
              Take it apart before you take it home.
            </p>
          </div>

          <nav className="lg:col-span-3">
            <p className="eyebrow text-mist/70">Machines</p>
            <ul className="mt-5 space-y-2.5">
              {machines.map((machine) => (
                <li key={machine.id}>
                  <Link
                    to={`/machines/${machine.id}`}
                    className="link-underline text-[0.92rem] text-crema/75 transition-colors hover:text-linen"
                  >
                    {machine.brand} {machine.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="eyebrow text-mist/70">Colophon</p>
            <p className="mt-5 text-[0.86rem] leading-[1.7] text-crema/60">
              Every machine is built from primitive geometry — cylinders, boxes and extrusions
              measured against the real thing — and rendered live rather than pre-baked. Component
              positions are authored as data, so a scanned model can take over without the
              interface changing.
            </p>
            <p className="mt-5 text-[0.86rem] leading-[1.7] text-crema/60">
              Prices are indicative US street prices. Specifications are manufacturer-published.
            </p>
            {HAS_AFFILIATE_LINKS && (
              <p className="mt-5 text-[0.86rem] leading-[1.7] text-crema/60">
                {AMAZON_REQUIRED_DISCLOSURE} Retailer links on machine pages are affiliate links
                and may earn a commission. Which machines appear here, how they are ordered and
                what the verdicts say are decided independently of that.
              </p>
            )}
          </div>
        </div>

        <div className="hairline-dark mt-16 flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist/50">
            Espresso Explorer — an interactive buyer's guide
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist/50">
            {machines.length} machines · {parts.length} components
          </p>
        </div>
      </Container>
    </footer>
  )
}
