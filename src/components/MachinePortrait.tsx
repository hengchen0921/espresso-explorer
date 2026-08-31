import { useId } from 'react'
import type { Finish, Machine } from '@/data/types'
import { cx } from '@/lib/format'

/**
 * A machine's picture.
 *
 * There is no product photography in this project — press shots are taken at
 * different focal lengths and finishes and cannot be trusted against each
 * other. This is drawn from the same `specs` the 3D model is built from, in the
 * same palette the 3D materials use, so a row of cards is directly comparable
 * in a way a row of photographs would not be. The blueprint version of the same
 * geometry lives in `MachineElevation`.
 */
interface Palette {
  top: string
  bottom: string
  edge: string
}

const FINISH_PALETTE: Record<Finish, Palette> = {
  'brushed-steel': { top: '#e3e7e9', bottom: '#9ba1a5', edge: '#767c81' },
  stainless: { top: '#eff2f4', bottom: '#a4abaf', edge: '#7d8489' },
  graphite: { top: '#56535b', bottom: '#221f25', edge: '#131116' },
}

export function MachinePortrait({
  machine,
  className,
  highlight = false,
}: {
  machine: Machine
  className?: string
  highlight?: boolean
}) {
  const uid = useId()
  const { widthCm: w, heightCm: h, grinder, portafilterMm, instrumentation } = machine.specs
  const palette = FINISH_PALETTE[machine.finish] ?? FINISH_PALETTE.stainless

  const hopperH = grinder ? h * 0.15 : 0
  const caseTop = hopperH
  const caseH = h - hopperH
  const alcoveTop = caseTop + caseH * 0.56
  const trayTop = h - caseH * 0.13
  const radius = w * 0.045

  const centreX = w * 0.5
  const groupR = (portafilterMm / 10) * 0.4
  const groupY = alcoveTop + caseH * 0.07

  const pad = Math.max(w, h) * 0.1

  // The caller sizes the frame; the drawing always fills it. Putting both on
  // one element made two competing height utilities and the tiles came out at
  // different heights depending on stylesheet order.
  return (
    <div className={cx('relative w-full', className)}>
      <svg
          viewBox={`${-pad} ${-pad * 0.6} ${w + pad * 2} ${h + pad * 1.9}`}
          className="h-full w-full"
          role="img"
          aria-label={`${machine.brand} ${machine.name}, ${w} by ${h} centimetres`}
        >
        <defs>
          <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor={palette.top} />
            <stop offset="0.55" stopColor={palette.bottom} />
            <stop offset="1" stopColor={palette.edge} />
          </linearGradient>
          <linearGradient id={`${uid}-steel`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eceff1" />
            <stop offset="1" stopColor="#a9b0b4" />
          </linearGradient>
          <radialGradient id={`${uid}-chrome`} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#c8ced2" />
            <stop offset="1" stopColor="#6f767b" />
          </radialGradient>
          <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8e3d8" stopOpacity="0.75" />
            <stop offset="1" stopColor="#c9c3b6" stopOpacity="0.5" />
          </linearGradient>
          <filter id={`${uid}-shadow`} x="-40%" y="-40%" width="180%" height="200%">
            <feGaussianBlur stdDeviation={w * 0.035} />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse
          cx={centreX}
          cy={h + w * 0.02}
          rx={w * 0.52}
          ry={w * 0.05}
          fill="var(--portrait-shadow)"
          opacity="0.32"
          filter={`url(#${uid}-shadow)`}
        />

        {/* Bean hopper */}
        {grinder && (
          <>
            <path
              d={`M ${w * 0.2} ${caseTop} L ${w * 0.26} ${caseTop - hopperH} L ${w * 0.5} ${caseTop - hopperH} L ${w * 0.44} ${caseTop} Z`}
              fill={`url(#${uid}-glass)`}
              stroke={palette.edge}
              strokeWidth="0.22"
              strokeOpacity="0.5"
            />
            {[
              [0.31, 0.42],
              [0.38, 0.55],
              [0.43, 0.35],
              [0.34, 0.68],
            ].map(([bx, by]) => (
              <ellipse
                key={`${bx}-${by}`}
                cx={w * bx}
                cy={caseTop - hopperH * by}
                rx={w * 0.016}
                ry={w * 0.012}
                fill="#4a2c17"
                opacity="0.75"
              />
            ))}
          </>
        )}

        {/* Case */}
        <rect
          x="0"
          y={caseTop}
          width={w}
          height={caseH}
          rx={radius}
          fill={`url(#${uid}-body)`}
          stroke={palette.edge}
          strokeWidth="0.28"
        />
        {/* Specular strip down the left shoulder */}
        <rect
          x={w * 0.045}
          y={caseTop + caseH * 0.06}
          width={w * 0.07}
          height={caseH * 0.42}
          rx={w * 0.03}
          fill="#ffffff"
          opacity={machine.finish === 'graphite' ? 0.14 : 0.34}
        />

        {/* Brew recess */}
        <rect
          x={w * 0.085}
          y={alcoveTop}
          width={w * 0.83}
          height={trayTop - alcoveTop}
          rx={w * 0.015}
          fill="#17120f"
          opacity="0.88"
        />

        {/* Group head and portafilter */}
        <circle cx={centreX} cy={groupY} r={groupR} fill={`url(#${uid}-chrome)`} />
        <circle cx={centreX} cy={groupY} r={groupR * 0.52} fill="#2b2724" opacity="0.55" />
        <rect
          x={centreX - groupR * 1.15}
          y={groupY + groupR * 0.75}
          width={groupR * 2.3}
          height={groupR * 0.62}
          rx={groupR * 0.2}
          fill={`url(#${uid}-chrome)`}
        />
        {/* Handle */}
        <rect
          x={centreX - groupR * 3.1}
          y={groupY + groupR * 0.95}
          width={groupR * 2}
          height={groupR * 0.42}
          rx={groupR * 0.21}
          fill="#1c1a1b"
        />
        {[-0.42, 0.42].map((o) => (
          <rect
            key={o}
            x={centreX + groupR * o - groupR * 0.12}
            y={groupY + groupR * 1.37}
            width={groupR * 0.24}
            height={groupR * 0.5}
            fill="#b9bfc3"
          />
        ))}

        {/* Steam wand */}
        <path
          d={`M ${w * 0.86} ${alcoveTop - caseH * 0.05} L ${w * 0.9} ${alcoveTop + caseH * 0.24}`}
          stroke={`url(#${uid}-chrome)`}
          strokeWidth={w * 0.028}
          strokeLinecap="round"
          fill="none"
        />

        {/* Drip tray */}
        <rect
          x={w * 0.07}
          y={trayTop}
          width={w * 0.86}
          height={h - trayTop}
          rx={w * 0.018}
          fill={`url(#${uid}-steel)`}
          stroke={palette.edge}
          strokeWidth="0.22"
        />
        {Array.from({ length: 7 }, (_, i) => {
          const x = w * 0.14 + (i * w * 0.72) / 6
          return (
            <line
              key={i}
              x1={x}
              y1={trayTop + (h - trayTop) * 0.28}
              x2={x}
              y2={h - (h - trayTop) * 0.3}
              stroke="#5f6669"
              strokeWidth="0.3"
              opacity="0.7"
            />
          )
        })}

        {/* Instrumentation */}
        {instrumentation === 'gauge' && (
          <>
            <circle
              cx={w * 0.26}
              cy={caseTop + caseH * 0.3}
              r={w * 0.085}
              fill="#f2ede3"
              stroke="#8b9195"
              strokeWidth="0.3"
            />
            <path
              d={`M ${w * 0.26} ${caseTop + caseH * 0.3} L ${w * 0.305} ${caseTop + caseH * 0.255}`}
              stroke="#c15a2b"
              strokeWidth="0.35"
              strokeLinecap="round"
            />
          </>
        )}
        {instrumentation === 'lcd' && (
          <rect
            x={w * 0.17}
            y={caseTop + caseH * 0.23}
            width={w * 0.22}
            height={caseH * 0.13}
            rx={caseH * 0.02}
            fill="#123028"
            stroke="#0b1a16"
            strokeWidth="0.25"
          />
        )}
        {instrumentation === 'switches' &&
          [0, 1, 2].map((i) => (
            <rect
              key={i}
              x={w * 0.7}
              y={caseTop + caseH * (0.16 + i * 0.11)}
              width={w * 0.14}
              height={caseH * 0.075}
              rx={caseH * 0.012}
              fill={i === 0 ? '#c15a2b' : '#1f1d1f'}
            />
          ))}
        {instrumentation === 'buttons' &&
          [0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={w * 0.66}
              cy={caseTop + caseH * (0.2 + i * 0.12)}
              r={Math.min(w * 0.055, caseH * 0.03)}
              fill={i === 0 ? '#c15a2b' : '#d3d8da'}
            />
          ))}

        {/* Hover accent along the base of the case */}
        <rect
          x="0"
          y={caseTop}
          width={w}
          height={caseH}
          rx={radius}
          fill="none"
          stroke="#c15a2b"
          strokeWidth="0.45"
          opacity={highlight ? 0.85 : 0}
          style={{ transition: 'opacity 400ms cubic-bezier(0.16,1,0.3,1)' }}
          />
      </svg>
    </div>
  )
}
