import type { Machine } from '@/data/types'
import { AMAZON_REQUIRED_DISCLOSURE, HAS_AFFILIATE_LINKS, retailerLinksFor } from '@/data/retailers'
import { cx, formatPrice } from '@/lib/format'

/**
 * Retailer links for one machine.
 *
 * Affiliate links carry `rel="sponsored nofollow"` — required by search-engine
 * guidelines for compensated links — and the disclosure is rendered from
 * whether a tag is actually configured, so it can never claim a relationship
 * that does not exist, or hide one that does.
 */
/**
 * The primary commercial action, sat next to the price at the top of a machine
 * page. Disclosure travels with it: FTC guidance wants the relationship stated
 * next to the link itself, not only in a block further down the page.
 */
export function BuyButton({ machine, className }: { machine: Machine; className?: string }) {
  const [primary] = retailerLinksFor(machine)
  if (!primary) return null

  return (
    <div className={cx('flex flex-col items-start gap-2 md:items-end', className)}>
      <a
        href={primary.url}
        target="_blank"
        rel={primary.sponsored ? 'sponsored nofollow noopener noreferrer' : 'noopener noreferrer'}
        className={cx(
          'group inline-flex items-center gap-2 rounded-full bg-copper px-5 py-2.5',
          'font-mono text-[11px] uppercase tracking-[0.14em] text-linen',
          'transition-colors duration-300 hover:bg-copper-deep',
        )}
      >
        Buy at {primary.name}
        <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <path
            d="M5 11 11 5M11 5H6.2M11 5v4.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">
          {primary.sponsored ? ', affiliate link' : ''}, opens in a new tab
        </span>
      </a>

      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist">
        {HAS_AFFILIATE_LINKS
          ? 'Affiliate link · may earn a commission'
          : 'Retailer search · earns nothing'}
      </p>
    </div>
  )
}

export function BuyLinks({ machine, className }: { machine: Machine; className?: string }) {
  const links = retailerLinksFor(machine)
  if (links.length === 0) return null

  return (
    <section className={cx('border border-ink/12 bg-surface px-6 py-6', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="eyebrow">Where to buy</h3>
        <p className="font-mono text-[0.78rem] text-stone">
          about {formatPrice(machine.price)}
        </p>
      </div>

      <ul className="mt-5 space-y-2.5">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel={
                link.sponsored
                  ? 'sponsored nofollow noopener noreferrer'
                  : 'noopener noreferrer'
              }
              className="group flex items-center justify-between gap-4 border border-ink/12 px-4 py-3 transition-colors duration-300 hover:border-copper hover:bg-copper-tint/25"
            >
              <span>
                <span className="block text-[0.95rem] text-ink">{link.name}</span>
                <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-mist">
                  {link.note}
                </span>
              </span>
              <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0 text-stone transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-copper">
                <path
                  d="M5 11 11 5M11 5H6.2M11 5v4.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">
                {link.name}
                {link.sponsored ? ', affiliate link' : ''}, opens in a new tab
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[0.78rem] leading-[1.65] text-mist">
        {HAS_AFFILIATE_LINKS ? (
          <>
            {AMAZON_REQUIRED_DISCLOSURE} Buy through one of these and this guide may earn a
            commission at no extra cost to you. Nothing here is ranked, ordered or recommended on
            the basis of commission — the verdicts were written before any link existed, and no
            retailer has seen them.
          </>
        ) : (
          <>
            These are plain links to a retailer search. No affiliate tags are configured, so nothing
            on this page earns a commission.
          </>
        )}
      </p>
    </section>
  )
}
