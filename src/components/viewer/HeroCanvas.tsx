import { Suspense, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Group } from 'three'
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
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <Stage radius={span} />
        <PartInteractionContext.Provider value={INERT}>
          <Turntable innerRef={model}>
            <MachineModel definition={definition} />
          </Turntable>
        </PartInteractionContext.Provider>
        <CastShadows target={model} token={machineId} />
      </Suspense>
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
    </Canvas>
  )
}
