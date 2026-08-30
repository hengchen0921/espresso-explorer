import { useId } from 'react'
import type { Machine } from '@/data/types'
import { cx } from '@/lib/format'
import { lengthUnit, lengthValue } from '@/lib/units'
import { useUnits } from '@/hooks/useUnits'

/**
 * A front elevation drawn from the machine's real dimensions and specs.
 *
 * Product photography is what a page like this would normally use; a scale
 * line drawing says more. The Dedica's sliver of a case next to the Barista
 * Pro's is the single most useful thing a buyer can see at a glance, and it
 * comes straight out of `specs` rather than out of an asset pipeline.
 */
interface MachineElevationProps {
  machine: Machine
  className?: string
  /** Draws the width and height dimension lines. */
  dimensions?: boolean
  /** Hover state is owned by the card so the whole tile responds as one. */
  highlight?: boolean
}

export function MachineElevation({
  machine,
  className,
  dimensions = true,
  highlight = false,
}: MachineElevationProps) {
  const uid = useId()
  const { units } = useUnits()
  const { widthCm: w, heightCm: h, grinder, portafilterMm, instrumentation } = machine.specs

  const hopperH = grinder ? h * 0.16 : 0
  const caseTop = hopperH
  const caseH = h - hopperH
  const alcoveTop = caseTop + caseH * 0.58
  const trayTop = h - caseH * 0.13

  const centreX = w * 0.52
  const groupR = (portafilterMm / 10) * 0.42
  const groupY = alcoveTop + caseH * 0.06

  const pad = Math.max(w, h) * 0.13
  const padRight = dimensions ? pad * 2.4 : pad
  const padBottom = dimensions ? pad * 2.2 : pad

  const line = highlight ? 'var(--color-copper)' : 'currentColor'

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${w + pad + padRight} ${h + pad + padBottom}`}
      className={cx('w-full text-ink/45', className)}
      role="img"
      aria-label={`Scale elevation of the ${machine.brand} ${machine.name}: ${w} by ${h} centimetres`}
    >
      <defs>
        <marker id={`${uid}-tick`} markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <line x1="2" y1="0" x2="2" y2="4" stroke="currentColor" strokeWidth="0.5" />
        </marker>
      </defs>

      <g
        fill="none"
        stroke={line}
        strokeWidth="0.55"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke 400ms cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Case */}
        <rect x="0" y={caseTop} width={w} height={caseH} rx={w * 0.035} />

        {/* Bean hopper */}
        {grinder && (
          <path
            d={`M ${w * 0.18} ${caseTop} L ${w * 0.24} ${caseTop - hopperH} L ${w * 0.5} ${caseTop - hopperH} L ${w * 0.44} ${caseTop} Z`}
          />
        )}

        {/* Brew recess */}
        <line x1={w * 0.06} y1={alcoveTop} x2={w * 0.94} y2={alcoveTop} strokeDasharray="1.6 1.6" opacity="0.6" />

        {/* Group head and portafilter */}
        <circle cx={centreX} cy={groupY} r={groupR} />
        <line x1={centreX} y1={groupY + groupR} x2={centreX} y2={groupY + groupR + caseH * 0.055} />
        <line
          x1={centreX - groupR * 1.25}
          y1={groupY + groupR + caseH * 0.055}
          x2={centreX + groupR * 1.25}
          y2={groupY + groupR + caseH * 0.055}
        />
        {[-0.45, 0.45].map((o) => (
          <line
            key={o}
            x1={centreX + groupR * o}
            y1={groupY + groupR + caseH * 0.055}
            x2={centreX + groupR * o}
            y2={groupY + groupR + caseH * 0.09}
          />
        ))}

        {/* Steam wand */}
        <line
          x1={w * 0.86}
          y1={alcoveTop - caseH * 0.06}
          x2={w * 0.9}
          y2={alcoveTop + caseH * 0.2}
        />

        {/* Drip tray */}
        <rect x={w * 0.07} y={trayTop} width={w * 0.86} height={h - trayTop} rx={w * 0.02} />
        {Array.from({ length: 6 }, (_, i) => {
          const x = w * 0.14 + (i * w * 0.72) / 5
          return <line key={i} x1={x} y1={trayTop + (h - trayTop) * 0.3} x2={x} y2={h - (h - trayTop) * 0.25} />
        })}

        {/* Controls */}
        {instrumentation === 'gauge' && <circle cx={w * 0.24} cy={caseTop + caseH * 0.3} r={w * 0.075} />}
        {instrumentation === 'lcd' && (
          <rect
            x={w * 0.16}
            y={caseTop + caseH * 0.22}
            width={w * 0.2}
            height={caseH * 0.14}
            rx={caseH * 0.02}
          />
        )}
        {instrumentation === 'switches' &&
          [0, 1, 2].map((i) => (
            <rect
              key={i}
              x={w * 0.72}
              y={caseTop + caseH * (0.16 + i * 0.11)}
              width={w * 0.13}
              height={caseH * 0.07}
              rx={caseH * 0.012}
            />
          ))}
        {instrumentation === 'buttons' &&
          [0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={w * 0.68}
              cy={caseTop + caseH * (0.2 + i * 0.12)}
              r={Math.min(w * 0.075, caseH * 0.032)}
            />
          ))}
      </g>

      {dimensions && (
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="0.28"
          opacity="0.5"
          style={{ transition: 'opacity 400ms' }}
        >
          <line
            x1="0"
            y1={h + pad * 0.9}
            x2={w}
            y2={h + pad * 0.9}
            markerStart={`url(#${uid}-tick)`}
            markerEnd={`url(#${uid}-tick)`}
          />
          <line
            x1={w + pad * 0.9}
            y1="0"
            x2={w + pad * 0.9}
            y2={h}
            markerStart={`url(#${uid}-tick)`}
            markerEnd={`url(#${uid}-tick)`}
          />
        </g>
      )}

      {dimensions && (
        <g fill="currentColor" opacity="0.65" style={{ fontSize: Math.max(w, h) * 0.075 }}>
          <text
            x={w / 2}
            y={h + pad * 1.85}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            letterSpacing="0.06em"
          >
            {lengthValue(w, units)} {lengthUnit(units)}
          </text>
          <text
            x={w + pad * 1.5}
            y={h / 2}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            letterSpacing="0.06em"
            transform={`rotate(90 ${w + pad * 1.5} ${h / 2})`}
          >
            {lengthValue(h, units)} {lengthUnit(units)}
          </text>
        </g>
      )}
    </svg>
  )
}
