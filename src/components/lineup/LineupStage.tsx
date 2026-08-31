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

const GAP = 0.085
const ROW_GAP = 0.58
const AZIMUTH = 11 * (Math.PI / 180)
const ELEVATION = 20 * (Math.PI / 180)

interface Entry {
  machine: Machine
  definition: MachineModelDefinition
}

interface Placed extends Entry {
  x: number
  z: number
  rank: 'back' | 'front'
}

/**
 * Arranges the whole catalogue into two ranks at true scale.
 *
 * The taller machines go at the back so nothing is hidden, and both ranks share
 * one ground plane and one camera — which is the only way a picture of eight
 * machines tells you anything a photograph of eight machines would not.
 */
function useLineupLayout(entries: Entry[]) {
  return useMemo(() => {
    const byHeight = [...entries].sort(
      (a, b) => b.definition.size.height - a.definition.size.height,
    )
    const backCount = Math.ceil(byHeight.length / 2)
    const back = byHeight.slice(0, backCount)
    const front = byHeight.slice(backCount)

    const layRow = (row: Entry[], z: number, rank: 'back' | 'front'): Placed[] => {
      const total =
        row.reduce((sum, e) => sum + e.definition.size.width, 0) + GAP * Math.max(0, row.length - 1)
      return row.map((entry, index) => {
        const offset = row
          .slice(0, index)
          .reduce((sum, prev) => sum + prev.definition.size.width + GAP, 0)
        return { ...entry, x: -total / 2 + offset + entry.definition.size.width / 2, z, rank }
      })
    }

    const maxDepth = Math.max(...entries.map((e) => e.definition.size.depth), 0.3)
    const placed = [...layRow(back, -ROW_GAP, 'back'), ...layRow(front, 0, 'front')]

    const widthOf = (row: Entry[]) =>
      row.reduce((sum, e) => sum + e.definition.size.width, 0) + GAP * Math.max(0, row.length - 1)

    return {
      placed,
      width: Math.max(widthOf(back), widthOf(front)),
      depth: ROW_GAP + maxDepth,
      height: Math.max(...entries.map((e) => e.definition.size.height), 0.3),
      centreZ: -ROW_GAP / 2,
    }
  }, [entries])
}

interface FitProps {
  width: number
  height: number
  depth: number
  target: [number, number, number]
}

/** Frames the whole group by its bounding sphere, so it fits at any aspect. */
function FitCamera({ width, height, depth, target }: FitProps) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const halfFov = (camera.fov * Math.PI) / 360
    const aspect = size.width / Math.max(size.height, 1)
    const radius = Math.hypot(width / 2, height / 2, depth / 2)

    const vertical = radius / Math.sin(halfFov)
    const horizontal = radius / Math.sin(Math.atan(Math.tan(halfFov) * aspect))
    const distance = Math.max(vertical, horizontal) * 0.66

    camera.position.set(
      target[0] + Math.sin(AZIMUTH) * Math.cos(ELEVATION) * distance,
      target[1] + Math.sin(ELEVATION) * distance,
      target[2] + Math.cos(AZIMUTH) * Math.cos(ELEVATION) * distance,
    )
    camera.lookAt(target[0], target[1], target[2])
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, width, height, depth, target])

  return null
}

export default function LineupStage({ entries }: { entries: Entry[] }) {
  const models = useRef<Group>(null)
  const [engaged, setEngaged] = useState(false)
  const layout = useLineupLayout(entries)

  const target = useMemo<[number, number, number]>(
    () => [0, layout.height * 0.42, layout.centreZ],
    [layout.height, layout.centreZ],
  )
  const reach = Math.max(layout.width, layout.depth)

  return (
    <Canvas
      dpr={[1, 2]}
      shadows="soft"
      onPointerDown={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.05, far: 80, position: [0.6, 1.2, 3.2] }}
      className="!absolute inset-0"
    >
      <FitCamera
        width={layout.width}
        height={layout.height}
        depth={layout.depth}
        target={target}
      />

      <Suspense fallback={null}>
        <Stage radius={reach * 0.72} />

        <PartInteractionContext.Provider value={INERT}>
          <group ref={models}>
            {layout.placed.map(({ machine, definition, x, z, rank }) => (
              <group key={machine.id} position={[x, 0.01, z]}>
                <MachineModel definition={definition} />
                {/* Back-rank captions go above their machine; front-rank below.
                    Putting them all underneath drops the back row's labels onto
                    the front row's lids. */}
                <Html
                  position={
                    rank === 'back'
                      ? [0, definition.size.height + 0.055, 0]
                      : [0, -0.055, definition.size.depth / 2 + 0.02]
                  }
                  center
                  zIndexRange={[12, 0]}
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="w-max text-center">
                    <p className="font-display text-[0.8rem] leading-tight text-crema">
                      {machine.name}
                    </p>
                    <p className="mt-0.5 numeric text-[10px] text-copper">
                      {formatPrice(machine.price)}
                    </p>
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
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.45}
        target={target}
        minDistance={reach * 0.5}
        maxDistance={reach * 4}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  )
}
