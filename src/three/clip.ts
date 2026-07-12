import * as THREE from 'three'
import { meshRegistry } from './registry'

export type Axis = 'x' | 'y' | 'z'
export interface ClipConfig { enabled: boolean; axis: Axis; value: number; flip: boolean }

// One shared plane + array; all system materials reference this same array so a
// single update reflects everywhere without per-material bookkeeping.
const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)
export const clipPlanes: THREE.Plane[] = []

export const sceneInfo = {
  center: new THREE.Vector3(),
  size: new THREE.Vector3(1, 1, 1),
  set: false,
}

export function recomputeSceneInfo() {
  const box = new THREE.Box3()
  let has = false
  for (const arr of meshRegistry.values()) {
    for (const m of arr) {
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
      box.union(m.geometry.boundingBox!.clone().applyMatrix4(m.matrixWorld))
      has = true
    }
  }
  if (has) {
    box.getCenter(sceneInfo.center)
    box.getSize(sceneInfo.size)
    sceneInfo.set = true
  }
}

export function updateClip(clip: ClipConfig) {
  if (!clip.enabled) {
    clipPlanes.length = 0
    return
  }
  if (!sceneInfo.set) recomputeSceneInfo()
  const unit = new THREE.Vector3(clip.axis === 'x' ? 1 : 0, clip.axis === 'y' ? 1 : 0, clip.axis === 'z' ? 1 : 0)
  const half = (clip.axis === 'x' ? sceneInfo.size.x : clip.axis === 'y' ? sceneInfo.size.y : sceneInfo.size.z) / 2
  const centerCoord = clip.axis === 'x' ? sceneInfo.center.x : clip.axis === 'y' ? sceneInfo.center.y : sceneInfo.center.z
  const coord = centerCoord + clip.value * half * 1.05
  const P = unit.clone().multiplyScalar(coord)
  const n = unit.clone().multiplyScalar(clip.flip ? -1 : 1)
  plane.set(n, -n.dot(P))
  clipPlanes.length = 0
  clipPlanes.push(plane)
}
