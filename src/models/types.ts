import type { ComponentType } from 'react'
import type { PartId } from '@/data/types'

export type Vec3 = [number, number, number]

/** Structural geometry has no part id — it is dimmed and x-rayed, never clicked. */
export type SurfaceKey = PartId | 'chassis'

/**
 * Where a hotspot lives on a model and how the camera should frame it.
 *
 * Anchors are model metadata, not catalogue content, which is why they sit
 * beside the geometry rather than in `data/*.json`. Swapping a primitive model
 * for a real `.glb` means re-measuring these numbers against the new asset and
 * changing nothing else in the app.
 */
export interface PartAnchor {
  partId: PartId
  /** Position on the model in metres, model-local space. */
  position: Vec3
  /**
   * Outward surface normal. The viewer fades a hotspot out as this turns away
   * from the camera, which is a cheap and flicker-free stand-in for occlusion
   * testing against the mesh.
   */
  normal: Vec3
  /** Camera placement used when this part is focused. */
  camera: { position: Vec3; target: Vec3 }
  /** Component lives inside the case; selecting it makes the shell go x-ray. */
  internal?: boolean
}

/** Every model component reads its highlight state from context, so primitive
 *  and glTF-backed models are interchangeable without prop plumbing. */
export type MachineModelComponent = ComponentType<Record<string, never>>

export type ModelSource =
  | { kind: 'primitive'; Component: MachineModelComponent }
  | {
      kind: 'gltf'
      /** Served from /public or a CDN; loaded with drei's useGLTF. */
      url: string
      scale?: number
      position?: Vec3
      rotation?: Vec3
      /**
       * Maps node names inside the .glb onto part ids. Nodes not listed here
       * are treated as structural chassis.
       */
      partNodes: Record<string, PartId>
    }

export interface MachineModelDefinition {
  machineId: string
  source: ModelSource
  /** Overall bounding size in metres — drives camera framing and the
   *  side-by-side layout on the comparison page. */
  size: { width: number; height: number; depth: number }
  anchors: PartAnchor[]
  /** Resting camera for the machine's own detail page. */
  home: { position: Vec3; target: Vec3 }
}
