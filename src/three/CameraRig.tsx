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
  // snapshot the persisted view once, so later saves don't retrigger framing
  const savedView = useRef(useStore.getState().camera)

  const focusNonce = useStore((s) => s.focusNonce)
  const resetNonce = useStore((s) => s.resetNonce)

  // persist the camera whenever the user finishes moving it (drag / zoom / pan),
  // so the exact view is restored on the next visit
  useEffect(() => {
    if (!controls) return
    const onEnd = () => {
      const t = controls.target
      useStore.getState().saveCamera({
        pos: [camera.position.x, camera.position.y, camera.position.z],
        target: [t.x, t.y, t.z],
      })
    }
    controls.addEventListener('end', onEnd)
    return () => controls.removeEventListener('end', onEnd)
  }, [controls, camera])

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
        if (controls) {
          controls.minDistance = radius * 0.15
          controls.maxDistance = radius * 8
        }
        const v = savedView.current
        if (v && controls) {
          // resume the persisted view immediately (no fly-in)
          camera.position.set(v.pos[0], v.pos[1], v.pos[2])
          controls.target.set(v.target[0], v.target[1], v.target[2])
          controls.update()
        } else {
          frame(sceneInfo.center.clone(), radius, false)
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
