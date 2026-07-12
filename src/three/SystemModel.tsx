import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { SYSTEM_BY_ID, type SystemId } from '../data/systems'
import { NODE_TO_ID, BY_ID } from '../data/terminology'
import { registerMeshes, unregisterSystem } from './registry'
import { clipPlanes } from './clip'
import { useStore } from '../store/useStore'

const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`

interface Props { system: SystemId }

export default function SystemModel({ system }: Props) {
  const meta = SYSTEM_BY_ID[system]
  const url = `${import.meta.env.BASE_URL}models/${meta.file}`
  const { scene } = useGLTF(url, DRACO_PATH)

  const select = useStore((s) => s.select)
  const hover = useStore((s) => s.hover)

  // four shared materials per system; all reference the same clip-plane array
  const mats = useMemo(() => {
    const color = new THREE.Color(meta.color)
    const common = { clippingPlanes: clipPlanes, clipShadows: true, side: THREE.DoubleSide as THREE.Side }
    const base = new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.02, ...common })
    const faded = new THREE.MeshStandardMaterial({ color, roughness: 0.7, transparent: true, opacity: 0.08, depthWrite: false, ...common })
    const highlight = new THREE.MeshStandardMaterial({ color: new THREE.Color('#ffb454'), emissive: new THREE.Color('#e8730c'), emissiveIntensity: 0.55, roughness: 0.4, metalness: 0.05, ...common })
    const hovered = new THREE.MeshStandardMaterial({ color: color.clone().lerp(new THREE.Color('#ffffff'), 0.35), emissive: new THREE.Color('#3a6ea5'), emissiveIntensity: 0.25, roughness: 0.5, ...common })
    return { base, faded, highlight, hovered }
  }, [meta.color])

  const meshesRef = useRef<{ mesh: THREE.Mesh; sid: string | null }[]>([])

  // prepare meshes once per loaded scene
  useEffect(() => {
    const collected: { mesh: THREE.Mesh; sid: string | null }[] = []
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!(m as any).isMesh) return
      // GLTFLoader sanitizes .name but preserves the original glTF node name in
      // userData.name; walk up to the nearest named node to match the manifest.
      let named: THREE.Object3D | null = m
      while (named && !named.userData?.name) named = named.parent
      const original = named?.userData?.name as string | undefined
      const sid = original ? NODE_TO_ID.get(original) ?? null : null
      m.userData.sid = sid
      m.userData.feature = sid ? !!BY_ID.get(sid)?.feature : true
      m.material = mats.base
      m.frustumCulled = true
      m.castShadow = false
      m.receiveShadow = false
      if (sid) registerMeshes(sid, m)
      collected.push({ mesh: m, sid })
    })
    meshesRef.current = collected
    return () => {
      unregisterSystem(`${system}#`)
      meshesRef.current = []
    }
  }, [scene, mats, system])

  // reactive highlight / fade / isolate
  useEffect(() => {
    const apply = (st: ReturnType<typeof useStore.getState>) => {
      const { selectedId, hoveredId, fadeOthers, isolateStructure, showFeatures } = st
      const anySel = !!selectedId
      for (const { mesh, sid } of meshesRef.current) {
        if (sid && sid === selectedId) {
          mesh.material = mats.highlight
          mesh.visible = true
        } else if (sid && sid === hoveredId) {
          mesh.material = mats.hovered
          mesh.visible = true
        } else {
          let vis = true
          if (mesh.userData.feature && !showFeatures) vis = false
          if (anySel && isolateStructure) vis = false
          mesh.visible = vis
          mesh.material = anySel && fadeOthers ? mats.faded : mats.base
        }
      }
    }
    apply(useStore.getState())
    return useStore.subscribe(apply)
  }, [mats])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const sid = (e.object as THREE.Mesh).userData?.sid as string | undefined
    if (sid) select(sid, false) // highlight + info, but don't yank the camera
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const sid = (e.object as THREE.Mesh).userData?.sid as string | undefined
    if (sid && useStore.getState().hoveredId !== sid) hover(sid)
  }
  const onOut = () => hover(null)

  return <primitive object={scene} onClick={onClick} onPointerMove={onMove} onPointerOut={onOut} />
}
