import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Group } from 'three'
import type { PartId, ResolvedPart } from '@/data/types'
import { MachineModel, PartInteractionContext } from '@/models'
import { scaleFraming } from '@/models/framing'
import type { MachineModelDefinition } from '@/models/types'
import { useIsCompact, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { useElementSize } from '@/hooks/useElementSize'
import { cx } from '@/lib/format'
import { CameraRig } from './CameraRig'
import { CastShadows } from './CastShadows'
import { Hotspot } from './Hotspot'
import { Stage } from './Stage'

interface MachineViewerProps {
  definition: MachineModelDefinition
  /** Drives hotspot labels and numbering; order matches the list beside it. */
  parts: ResolvedPart[]
  activePart: PartId | null
  onSelectPart: (part: PartId | null) => void
  /** Controlled so the component list beside the viewer can highlight geometry. */
  hoveredPart: PartId | null
  onHoverPart: (part: PartId | null) => void
  className?: string
}

/** Lifts the model so its feet rest on the shadow plane rather than through it. */
const GROUND_OFFSET = 0.01

const FOV = 32
const HALF_FOV = (FOV * Math.PI) / 360

/**
 * Distance at which a box of this size fills the frame with a little air.
 *
 * Authoring a fixed camera distance per machine cannot survive a resize: the
 * same 0.82 m that frames the Barista Express on a wide desktop crops its bean
 * hopper on a tall phone. So the authored `home` supplies the *angle*, and the
 * distance is solved here from the model's own bounds and the live aspect
 * ratio. Focused part cameras are then scaled by the same ratio, which keeps
 * their intended closeness relative to the home shot.
 */
function fitDistance(size: { width: number; height: number; depth: number }, aspect: number) {
  const reach = Math.max(size.width, size.depth)
  const forHeight = (size.height * 1.35) / (2 * Math.tan(HALF_FOV))
  const forWidth = (reach * 1.55) / (2 * Math.tan(HALF_FOV) * Math.max(aspect, 0.2))
  return Math.max(forHeight, forWidth)
}

function lengthOf(from: readonly [number, number, number], to: readonly [number, number, number]) {
  return Math.hypot(from[0] - to[0], from[1] - to[1], from[2] - to[2])
}

export function MachineViewer({
  definition,
  parts,
  activePart,
  onSelectPart,
  hoveredPart,
  onHoverPart,
  className,
}: MachineViewerProps) {
  const model = useRef<Group>(null)
  const [resetNonce, setResetNonce] = useState(0)
  const [hasOrbited, setHasOrbited] = useState(false)
  // Wheel zoom stays off until the reader deliberately grabs the model, so a
  // 78vh canvas never hijacks the page scroll on the way past it.
  const [engaged, setEngaged] = useState(false)
  const [ready, setReady] = useState(false)

  const compact = useIsCompact()
  const reducedMotion = usePrefersReducedMotion()
  const { ref: frameRef, size: frameSize } = useElementSize<HTMLDivElement>()

  // Ratio between the distance that actually fits this canvas and the distance
  // the model was authored against. Everything else is derived from it.
  const distanceScale = useMemo(() => {
    if (frameSize.width === 0 || frameSize.height === 0) return compact ? 1.34 : 1
    const authored = lengthOf(definition.home.position, definition.home.target)
    const needed = fitDistance(definition.size, frameSize.width / frameSize.height)
    return needed / authored
  }, [compact, definition.home, definition.size, frameSize])

  // Hotspots follow the order of the machine's own part list, so the numbered
  // badges line up with the index beside the viewer.
  const hotspots = useMemo(() => {
    const anchors = new Map(definition.anchors.map((a) => [a.partId, a]))
    return parts.flatMap((part, i) => {
      const anchor = anchors.get(part.id)
      return anchor ? [{ anchor, part, index: i + 1 }] : []
    })
  }, [definition.anchors, parts])

  const activeAnchor = useMemo(
    () => (activePart ? definition.anchors.find((a) => a.partId === activePart) : undefined),
    [activePart, definition.anchors],
  )

  // The resting shot keeps the machine's authored viewing *angle* but takes
  // its target from the model's own bounds and its distance from the canvas,
  // so nothing is ever cropped at an unexpected aspect ratio.
  const homeFraming = useMemo(() => {
    const [px, py, pz] = definition.home.position
    const [tx, ty, tz] = definition.home.target
    const dx = px - tx
    const dy = py - ty
    const dz = pz - tz
    const length = Math.hypot(dx, dy, dz) || 1
    const distance = lengthOf(definition.home.position, definition.home.target) * distanceScale
    const target: [number, number, number] = [0, definition.size.height * 0.5 + GROUND_OFFSET, 0]
    return {
      position: [
        target[0] + (dx / length) * distance,
        target[1] + (dy / length) * distance,
        target[2] + (dz / length) * distance,
      ] as [number, number, number],
      target,
    }
  }, [definition.home, definition.size.height, distanceScale])

  const framing = useMemo(
    () => (activeAnchor ? scaleFraming(activeAnchor.camera, distanceScale) : homeFraming),
    [activeAnchor, distanceScale, homeFraming],
  )
  const framingKey = `${activePart ?? 'home'}#${resetNonce}#${distanceScale.toFixed(2)}`

  // Mount one step further out than the resting shot, so the first thing the
  // page does is settle gently onto the machine.
  const initialFraming = useMemo(
    () => scaleFraming(homeFraming, 1.35),
    [homeFraming],
  )

  const xray = Boolean(activeAnchor?.internal)

  const interaction = useMemo(
    () => ({
      activePart,
      hoveredPart,
      setHoveredPart: onHoverPart,
      selectPart: onSelectPart,
      xray,
      interactive: true,
    }),
    [activePart, hoveredPart, onHoverPart, onSelectPart, xray],
  )

  useEffect(() => {
    document.body.style.cursor = hoveredPart ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hoveredPart])

  const span = Math.max(definition.size.width, definition.size.depth, definition.size.height)

  return (
    <div
      ref={frameRef}
      onPointerDown={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      className={cx('relative isolate overflow-hidden', className)}
    >
      <div className="absolute inset-0 stage-vignette" aria-hidden />

      {/* Registration marks — a quiet nod to a product shot on a light table */}
      {(
        [
          'left-5 top-5 border-l border-t',
          'right-5 top-5 border-r border-t',
          'left-5 bottom-5 border-b border-l',
          'right-5 bottom-5 border-b border-r',
        ] as const
      ).map((position) => (
        <span
          key={position}
          aria-hidden
          className={cx('pointer-events-none absolute h-4 w-4 border-crema/18', position)}
        />
      ))}

      <Canvas
        dpr={[1, 2]}
        shadows="soft"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: FOV, near: 0.03, far: 40, position: initialFraming.position }}
        onCreated={() => setReady(true)}
        className="!absolute inset-0"
      >
        <Suspense fallback={null}>
          <Stage radius={span} />

          <PartInteractionContext.Provider value={interaction}>
            <group ref={model} position={[0, GROUND_OFFSET, 0]}>
              <MachineModel definition={definition} />

              {hotspots.map(({ anchor, part, index }) => (
                <Hotspot
                  key={part.id}
                  anchor={anchor}
                  index={index}
                  label={part.shortName}
                  active={activePart === part.id}
                  dimmed={activePart !== null}
                  onSelect={() => onSelectPart(activePart === part.id ? null : part.id)}
                  onHover={(hovering) => onHoverPart(hovering ? part.id : null)}
                />
              ))}
            </group>
          </PartInteractionContext.Provider>

          <CastShadows target={model} token={definition.machineId} />

          {/* Kept inside the boundary deliberately — see HeroCanvas. */}
          <CameraRig
            framing={framing}
            framingKey={framingKey}
            minDistance={span * 0.75}
            maxDistance={span * 6}
            instant={reducedMotion}
            zoom={engaged}
            onUserInteract={() => setHasOrbited(true)}
          />
        </Suspense>
      </Canvas>

      {/* Loading veil — the canvas fades up once the first frame is on screen */}
      <div
        aria-hidden
        className={cx(
          'pointer-events-none absolute inset-0 grid place-items-center bg-stage transition-opacity duration-700',
          ready ? 'opacity-0' : 'opacity-100',
        )}
      >
        <span className="eyebrow text-mist/70">Building model</span>
      </div>

      <p
        className={cx(
          'pointer-events-none absolute bottom-5 left-6 label text-crema/45',
          'transition-opacity duration-700',
          hasOrbited || activePart ? 'opacity-0' : 'opacity-100',
        )}
      >
        Drag to rotate · scroll to zoom · tap a marker
      </p>

      <button
        type="button"
        onClick={() => {
          onSelectPart(null)
          setResetNonce((n) => n + 1)
          setHasOrbited(false)
          setEngaged(false)
        }}
        className={cx(
          'absolute bottom-5 right-6 rounded-full border border-crema/20 px-3.5 py-1.5',
          'label text-crema/70 backdrop-blur-sm',
          'transition-colors duration-500 hover:border-copper hover:text-copper',
          hasOrbited || activePart ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        Reset view
      </button>
    </div>
  )
}
