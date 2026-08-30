import { GltfMachineModel } from './GltfMachineModel'
import type { MachineModelDefinition } from './types'

/**
 * Resolves a model definition to geometry. The rest of the app never branches
 * on how a machine happens to be modelled.
 */
export function MachineModel({ definition }: { definition: MachineModelDefinition }) {
  if (definition.source.kind === 'gltf') {
    return <GltfMachineModel source={definition.source} />
  }
  const Component = definition.source.Component
  return <Component />
}
