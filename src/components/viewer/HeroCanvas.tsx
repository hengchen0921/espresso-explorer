import { Suspense, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Group, PerspectiveCamera } from 'three'
import { MachineModel, PartInteractionContext } from '@/models'
import { getModelDefinition } from '@/models/registry'
import { CastShadows } from './CastShadows'
import { Stage } from './Stage'

/** Non-interactive context: the hero shows the machine, it does not explain it. */
const INERT = {
  activePart: null,
  hoveredPart: null,
  setHoveredPart: () => {},
  selectPart: () => {},
  xray: false,
  interactive: false,
}

function Turntable({ innerRef, children }: { innerRef: React.RefObject<Group | null>; children: ReactNode }) {
  const spin = useRef<Group>(null)

  useFrame((state, delta) => {
    if (!spin.current) return
    spin.current.rotation.y += delta * 0.16
    // A breath of vertical drift keeps it from reading as a rigid turntable.
    spin.current.position.y = 0.01 + Math.sin(state.clock.elapsedTime * 0.6) * 0.004
  })

  return (
    <group ref={innerRef}>
      <group ref={spin}>{children}</group>
    </group>
  )
}

/**
 * Frames the model against the live canvas aspect.
 *
 * `<Canvas camera={{ position }}>` is applied once at mount and never again, so
 * a hard-coded position crops the moment the stage changes shape — which it now
 * does, being a full-height column rather than a fixed 660px box. Distance is
 * solved from the model bounds, the fov and the actual aspect instead.
 *
 * Because the hero turns, the widest silhouette it ever presents is its
 * footprint *diagonal*, not its width — fitting to width alone clips the
 * corners halfway through every rotation.
 */
function HeroFit({ size }: { size: { width: number; height: number; depth: number } }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const viewport = useThree((s) => s.size)
  const fitted = useRef('')

  useFrame(({ controls }) => {
    const key = `${Math.round(viewport.width)}x${Math.round(viewport.height)}`
    if (fitted.current === key || viewport.height === 0) return

    const aspect = viewport.width / viewport.height
    const vFov = (camera.fov * Math.PI) / 180
    const spread = Math.hypot(size.width, size.depth)
    const distV = size.height / 2 / Math.tan(vFov / 2)
    const distH = spread / 2 / (Math.tan(vFov / 2) * aspect)
    // 1.95 is breathing room: a hero that exactly fills its frame reads cramped,
    // and the turntable needs slack for the corners it swings through.
    const distance = Math.max(distV, distH) * 1.95

    const pivot = size.height * 0.5 + 0.01
    const azimuth = (26 * Math.PI) / 180
    const elevation = (12 * Math.PI) / 180
    camera.position.set(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      pivot + Math.sin(elevation) * distance,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    )
    camera.lookAt(0, pivot, 0)
    camera.updateProjectionMatrix()

    const orbit = controls as { target?: { set: (x: number, y: number, z: number) => void }; update?: () => void } | null
    orbit?.target?.set(0, pivot, 0)
    orbit?.update?.()

    fitted.current = key
  })

  return null
}

/**
 * The homepage hero model. Loaded lazily so the landing page's first paint
 * never waits on three.js.
 */
export default function HeroCanvas({ machineId }: { machineId: string }) {
  const [ready, setReady] = useState(false)
  const model = useRef<Group>(null)
  const definition = getModelDefinition(machineId)
  if (!definition) return null

  const span = Math.max(definition.size.width, definition.size.depth, definition.size.height)

  return (
    <Canvas
      shadows="soft"
      onCreated={() => setReady(true)}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 900ms cubic-bezier(0.16,1,0.3,1)' }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.03, far: 40, position: [0.5, 0.34, 0.78] }}
      className="absolute! inset-0"
    >
      <Suspense fallback={null}>
        <HeroFit size={definition.size} />
        <Stage radius={span} />
        <PartInteractionContext.Provider value={INERT}>
          <Turntable innerRef={model}>
            <MachineModel definition={definition} />
          </Turntable>
        </PartInteractionContext.Provider>
        <CastShadows target={model} token={machineId} />
        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.5}
          target={[0, 0.19, 0]}
          minPolarAngle={0.5}
            maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Suspense>
    </Canvas>
  )
}
