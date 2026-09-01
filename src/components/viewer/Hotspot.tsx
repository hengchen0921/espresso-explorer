import { useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { PartAnchor } from '@/models/types'

interface HotspotProps {
  anchor: PartAnchor
  /** 1-based badge number, matching the part list beside the viewer. */
  index: number
  label: string
  active: boolean
  dimmed: boolean
  onSelect: () => void
  onHover: (hovering: boolean) => void
}

/**
 * A DOM marker pinned to a point on the model.
 *
 * Rather than raycasting against the mesh every frame to test occlusion — which
 * flickers on thin geometry like a steam wand — each anchor carries an outward
 * normal, and the marker fades as that normal turns away from the camera. It is
 * cheap, perfectly stable, and reads as the marker sliding around the far side
 * of the machine.
 */
export function Hotspot({ anchor, index, label, active, dimmed, onSelect, onHover }: HotspotProps) {
  const wrapper = useRef<HTMLDivElement>(null)
  const camera = useThree((state) => state.camera)

  const point = useMemo(() => new Vector3(...anchor.position), [anchor.position])
  const facing = useMemo(() => new Vector3(...anchor.normal).normalize(), [anchor.normal])
  const toCamera = useMemo(() => new Vector3(), [])

  useFrame(() => {
    const node = wrapper.current
    if (!node) return

    toCamera.copy(camera.position).sub(point).normalize()
    const dot = toCamera.dot(facing)
    // Selected markers stay put — the open panel refers to them.
    const visibility = active ? 1 : Math.min(1, Math.max(0, (dot - 0.02) / 0.34))

    node.style.opacity = visibility.toFixed(3)
    node.style.transform = `scale(${(0.82 + visibility * 0.18).toFixed(3)})`
    node.style.pointerEvents = visibility > 0.45 ? 'auto' : 'none'
  })

  return (
    <Html
      position={anchor.position}
      center
      zIndexRange={[24, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div ref={wrapper} className="pointer-events-none transition-none">
        <button
          type="button"
          onClick={onSelect}
          onPointerEnter={() => onHover(true)}
          onPointerLeave={() => onHover(false)}
          aria-pressed={active}
          className="group relative grid h-7 w-7 place-items-center"
          style={{ opacity: dimmed && !active ? 0.45 : 1 }}
        >
          {!active && (
            <>
              <span className="hotspot-ring absolute inset-0 rounded-full border border-copper/70" />
              <span className="hotspot-ring-delayed absolute inset-0 rounded-full border border-copper/40" />
            </>
          )}

          <span
            className={[
              'relative grid h-6 w-6 place-items-center rounded-full numeric text-[10px] font-medium',
              'ring-1 backdrop-blur-[2px] transition-[background-color,color,box-shadow] duration-300',
              active
                ? 'bg-copper text-linen ring-copper shadow-[0_0_0_5px_rgba(193,90,43,0.22)]'
                : 'bg-crema/92 text-stage ring-stage/20 group-hover:bg-linen group-hover:ring-copper/70 group-hover:shadow-[0_0_0_4px_rgba(193,90,43,0.16)]',
            ].join(' ')}
          >
            {index}
          </span>

          <span
            className={[
              'pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full',
              'px-2.5 py-1 label transition-[background-color,color,opacity] duration-300',
              active
                ? 'bg-copper text-linen opacity-100'
                : 'bg-stage/90 text-crema opacity-0 translate-x-[-4px] group-hover:translate-x-0 group-hover:opacity-100',
            ].join(' ')}
          >
            {label}
          </span>
        </button>
      </div>
    </Html>
  )
}
