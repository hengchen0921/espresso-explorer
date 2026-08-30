import { useLayoutEffect, type RefObject } from 'react'
import { Mesh, type Object3D } from 'three'

/**
 * Turns on shadow casting and receiving for every mesh under `target`.
 *
 * Setting the flags per mesh across five machine files would be hundreds of
 * props to keep in sync; scoping a traverse to the model group instead means
 * the ground plane and the light gizmos are left alone. Runs after the subtree
 * has been committed, and re-runs when the machine changes.
 */
export function CastShadows({
  target,
  token,
}: {
  target: RefObject<Object3D | null>
  token: string
}) {
  useLayoutEffect(() => {
    target.current?.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
  }, [target, token])

  return null
}
