import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { PerspectiveCamera, type Group } from 'three'
import type { Machine } from '@/data/types'
import { MachineModel, PartInteractionContext } from '@/models'
import type { MachineModelDefinition } from '@/models/types'
import { formatPrice } from '@/lib/format'
import { CastShadows } from '@/components/viewer/CastShadows'
import { Stage } from '@/components/viewer/Stage'

const INERT = {
  activePart: null,
  hoveredPart: null,
  setHoveredPart: () => {},
  selectPart: () => {},
  xray: false,
  interactive: false,
}

const GAP = 0.075

/** Direction the line-up is viewed from: slightly right of centre, slightly above. */
const AZIMUTH = 20 * (Math.PI / 180)
const ELEVATION = 14 * (Math.PI / 180)

interface FitCameraProps {
  width: number
  height: number
  target: [number, number, number]
}

/**
 * Frames the whole line-up to fit the canvas.
 *
 * A fixed camera position cannot work here: the group is 15 cm wide with one
 * machine selected and nearly a metre with three, and `<Canvas camera>` only
 * applies on mount. So the distance is solved from the actual field of view
 * and aspect ratio every time the selection or the viewport changes.
 */
function FitCamera({ width, height, target }: FitCameraProps) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const halfFov = (camera.fov * Math.PI) / 360
    const aspect = size.width / Math.max(size.height, 1)

    const forHeight = (height * 1.72) / (2 * Math.tan(halfFov))
    const forWidth = (width * 1.24) / (2 * Math.tan(halfFov) * aspect)
    const distance = Math.max(forHeight, forWidth, 0.45)

    camera.position.set(
      target[0] + Math.sin(AZIMUTH) * Math.cos(ELEVATION) * distance,
      target[1] + Math.sin(ELEVATION) * distance,
      target[2] + Math.cos(AZIMUTH) * Math.cos(ELEVATION) * distance,
    )
    camera.lookAt(target[0], target[1], target[2])
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, width, height, target])

  return null
}

interface CompareStageProps {
  entries: Array<{ machine: Machine; definition: MachineModelDefinition }>
}

/**
 * All selected machines in a single scene, laid out at true relative scale and
 * sharing one camera.
 *
 * Three separate canvases would each normalise their own framing and quietly
 * destroy the only thing this view is for: seeing that the Dedica is half the
 * width of the Barista Pro.
 */
export default function CompareStage({ entries }: CompareStageProps) {
  const models = useRef<Group>(null)
  const [engaged, setEngaged] = useState(false)
  const layout = useMemo(() => {
    const totalWidth =
      entries.reduce((sum, e) => sum + e.definition.size.width, 0) + GAP * Math.max(0, entries.length - 1)

    const placed = entries.map((entry, index) => {
      const offset = entries
        .slice(0, index)
        .reduce((sum, previous) => sum + previous.definition.size.width + GAP, 0)
      return { ...entry, x: -totalWidth / 2 + offset + entry.definition.size.width / 2 }
    })

    const maxHeight = Math.max(...entries.map((e) => e.definition.size.height), 0.3)
    const maxDepth = Math.max(...entries.map((e) => e.definition.size.depth), 0.3)

    return { placed, totalWidth, maxHeight, maxDepth }
  }, [entries])

  const target = useMemo<[number, number, number]>(
    () => [0, layout.maxHeight * 0.42, 0],
    [layout.maxHeight],
  )
  const reach = Math.max(layout.totalWidth, layout.maxHeight)

  return (
    <Canvas
      dpr={[1, 2]}
      shadows="soft"
      onPointerDown={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.03, far: 60, position: [0.4, 0.4, 1.2] }}
      className="!absolute inset-0"
    >
      <FitCamera width={layout.totalWidth} height={layout.maxHeight} target={target} />

      <Suspense fallback={null}>
        <Stage radius={Math.max(layout.totalWidth, layout.maxDepth)} />

        <PartInteractionContext.Provider value={INERT}>
          <group ref={models}>
          {layout.placed.map(({ machine, definition, x }) => (
            <group key={machine.id} position={[x, 0.01, 0]}>
              <MachineModel definition={definition} />

              {/* Labels share one baseline taken from the deepest machine, so
                  the caption row reads as a row rather than a stagger. */}
              <Html
                position={[0, -0.075, layout.maxDepth / 2 + 0.06]}
                center
                zIndexRange={[12, 0]}
                style={{ pointerEvents: 'none' }}
              >
                <div className="w-max text-center">
                  <p className="label text-mist/60">
                    {machine.brand}
                  </p>
                  <p className="mt-1 font-display text-[0.95rem] leading-tight text-crema">
                    {machine.name}
                  </p>
                  <p className="mt-1 numeric text-[10px] text-copper">{formatPrice(machine.price)}</p>
                </div>
              </Html>
            </group>
          ))}
          </group>
        </PartInteractionContext.Provider>

        <CastShadows target={models} token={entries.map((e) => e.machine.id).join(',')} />
      </Suspense>

      <OrbitControls
        makeDefault
        enableZoom={engaged}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.6}
        target={target}
        minDistance={reach * 0.4}
        maxDistance={reach * 5}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 - 0.03}
      />
    </Canvas>
  )
}
