import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useStore } from '../store/useStore'
import { boundsOf, meshRegistry } from './registry'
import { recomputeSceneInfo, sceneInfo } from './clip'

export default function CameraRig() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as any

  const desiredPos = useRef<THREE.Vector3 | null>(null)
  const desiredTarget = useRef<THREE.Vector3 | null>(null)
  const initialized = useRef(false)

  const focusNonce = useStore((s) => s.focusNonce)
  const resetNonce = useStore((s) => s.resetNonce)

  const frame = (center: THREE.Vector3, radius: number, keepDir: boolean) => {
    const dir = new THREE.Vector3()
    if (keepDir && controls) dir.copy(camera.position).sub(controls.target).normalize()
    else dir.set(0.25, 0.12, 1).normalize()
    const dist = Math.max(radius * (keepDir ? 2.4 : 2.75), 0.4)
    desiredTarget.current = center.clone()
    desiredPos.current = center.clone().add(dir.multiplyScalar(dist))
  }

  // focus on selected structure
  useEffect(() => {
    if (!focusNonce) return
    const sel = useStore.getState().selectedId
    if (!sel) return
    const box = boundsOf([sel])
    if (!box) return
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)
    frame(center, Math.max(size.length() / 2, 0.05), true)
  }, [focusNonce])

  // reset to whole-body view
  useEffect(() => {
    if (!resetNonce) return
    recomputeSceneInfo()
    frame(sceneInfo.center.clone(), sceneInfo.size.length() / 2, false)
  }, [resetNonce])

  useFrame(() => {
    // one-time initial framing once meshes exist
    if (!initialized.current && meshRegistry.size > 0) {
      recomputeSceneInfo()
      if (sceneInfo.set) {
        const radius = sceneInfo.size.length() / 2
        frame(sceneInfo.center.clone(), radius, false)
        if (controls) {
          controls.minDistance = radius * 0.15
          controls.maxDistance = radius * 8
        }
        initialized.current = true
      }
    }
    if (desiredPos.current && desiredTarget.current && controls) {
      camera.position.lerp(desiredPos.current, 0.14)
      controls.target.lerp(desiredTarget.current, 0.14)
      controls.update()
      if (camera.position.distanceTo(desiredPos.current) < 0.02) {
        camera.position.copy(desiredPos.current)
        controls.target.copy(desiredTarget.current)
        controls.update()
        desiredPos.current = null
        desiredTarget.current = null
      }
    }
  })

  return null
}
