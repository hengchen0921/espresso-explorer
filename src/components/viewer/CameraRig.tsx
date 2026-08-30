import { useRef, type ComponentRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Vec3 } from '@/models/types'

export interface Framing {
  position: Vec3
  target: Vec3
}

interface CameraRigProps {
  /** Where the camera should be. Changing this animates; it does not snap. */
  framing: Framing
  /** Changes whenever a *new* framing is requested, including re-selecting the
   *  same part after the user has orbited away. */
  framingKey: string
  minDistance: number
  maxDistance: number
  instant?: boolean
  enabled?: boolean
  /**
   * Wheel zoom. Off until the viewer has been engaged, because a canvas this
   * tall would otherwise swallow the page's scroll and trap the reader.
   */
  zoom?: boolean
  onUserInteract?: () => void
}

const DURATION = 0.85

/** Symmetric ease — slow out of the old position, slow into the new one. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function CameraRig({
  framing,
  framingKey,
  minDistance,
  maxDistance,
  instant = false,
  enabled = true,
  zoom = false,
  onUserInteract,
}: CameraRigProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const camera = useThree((state) => state.camera)

  const progress = useRef(1)
  const activeKey = useRef<string | null>(null)
  const fromPosition = useRef(new Vector3())
  const fromTarget = useRef(new Vector3())
  const toPosition = useRef(new Vector3())
  const toTarget = useRef(new Vector3())

  useFrame((_, delta) => {
    const orbit = controls.current
    // Transitions start here rather than in an effect. Driving them from the
    // frame loop guarantees the OrbitControls instance exists before any
    // framing is applied, so a first paint can never leave the camera at its
    // initial position with the target still at the origin.
    if (!orbit) return

    if (activeKey.current !== framingKey) {
      activeKey.current = framingKey
      toPosition.current.set(...framing.position)
      toTarget.current.set(...framing.target)

      if (instant) {
        camera.position.copy(toPosition.current)
        orbit.target.copy(toTarget.current)
        orbit.update()
        progress.current = 1
      } else {
        fromPosition.current.copy(camera.position)
        fromTarget.current.copy(orbit.target)
        progress.current = 0
      }
    }

    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / DURATION)
      const t = easeInOutCubic(progress.current)
      camera.position.lerpVectors(fromPosition.current, toPosition.current, t)
      orbit.target.lerpVectors(fromTarget.current, toTarget.current, t)
      orbit.update()
    }
  })

  // Grabbing the model cancels the flight rather than fighting it, so the
  // controls never have to be disabled and the interaction never feels stuck.
  const handleStart = () => {
    progress.current = 1
    onUserInteract?.()
  }

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={enabled}
      enableZoom={zoom}
      enableDamping
      dampingFactor={0.075}
      rotateSpeed={0.62}
      zoomSpeed={0.65}
      panSpeed={0.5}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI / 2 - 0.02}
      onStart={handleStart}
    />
  )
}
