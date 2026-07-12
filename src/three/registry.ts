import * as THREE from 'three'

// Global registry mapping a structure id -> the meshes that represent it,
// populated by SystemModel on load and read by search/focus/highlight logic
// without threading refs through the React tree.
export const meshRegistry = new Map<string, THREE.Mesh[]>()

export function registerMeshes(id: string, mesh: THREE.Mesh) {
  const arr = meshRegistry.get(id)
  if (arr) arr.push(mesh)
  else meshRegistry.set(id, [mesh])
}

export function unregisterSystem(prefix: string) {
  for (const key of [...meshRegistry.keys()]) {
    if (key.startsWith(prefix)) meshRegistry.delete(key)
  }
}

// world-space bounding box covering all meshes of the given structure ids
export function boundsOf(ids: string[]): THREE.Box3 | null {
  const box = new THREE.Box3()
  let has = false
  for (const id of ids) {
    const arr = meshRegistry.get(id)
    if (!arr) continue
    for (const m of arr) {
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
      const b = m.geometry.boundingBox!.clone().applyMatrix4(m.matrixWorld)
      box.union(b)
      has = true
    }
  }
  return has ? box : null
}
