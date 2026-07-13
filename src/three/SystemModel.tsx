import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { SYSTEM_BY_ID, type SystemId } from '../data/systems'
import { NODE_TO_ID, BY_ID, organColor } from '../data/terminology'
import { registerMeshes, unregisterSystem } from './registry'
import { clipPlanes } from './clip'
import { useStore } from '../store/useStore'

const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`

// Per-system physically-based material tuning for a naturalistic look: wet sheen
// on organs/vessels, matte bone, translucent skin regions.
type Tune = { rough: number; metal?: number; clearcoat?: number; sheen?: number; env?: number; opacity?: number }
const MAT_TUNE: Record<string, Tune> = {
  skeletal: { rough: 0.68, clearcoat: 0.06, env: 0.75 },
  joints: { rough: 0.5, clearcoat: 0.28, env: 0.95 },
  muscular: { rough: 0.5, clearcoat: 0.16, sheen: 0.35, env: 0.9 },
  cardiovascular: { rough: 0.36, clearcoat: 0.38, env: 1.0 },
  visceral: { rough: 0.4, clearcoat: 0.36, sheen: 0.25, env: 1.0 },
  nervous: { rough: 0.48, clearcoat: 0.12, env: 0.85 },
  lymphatic: { rough: 0.48, clearcoat: 0.22, env: 0.9 },
  regions: { rough: 0.85, clearcoat: 0.02, env: 0.5, opacity: 0.5 },
  references: { rough: 0.6, env: 0.5 },
  default: { rough: 0.55, clearcoat: 0.1, env: 0.8 },
}

interface Props { system: SystemId }

export default function SystemModel({ system }: Props) {
  const meta = SYSTEM_BY_ID[system]
  const url = `${import.meta.env.BASE_URL}models/${meta.file}`
  const { scene } = useGLTF(url, DRACO_PATH)

  const select = useStore((s) => s.select)
  const hover = useStore((s) => s.hover)

  // materials per system; base materials are cached per structure colour so
  // organs read as real tissue. All reference the same shared clip-plane array.
  const mats = useMemo(() => {
    const t = MAT_TUNE[system] || MAT_TUNE.default
    const common = { clippingPlanes: clipPlanes, clipShadows: true, side: THREE.DoubleSide as THREE.Side }
    const cache = new Map<string, THREE.MeshPhysicalMaterial>()
    const makeBase = (hex: string) => {
      let m = cache.get(hex)
      if (!m) {
        const color = new THREE.Color(hex)
        m = new THREE.MeshPhysicalMaterial({
          color, roughness: t.rough, metalness: t.metal ?? 0.0,
          clearcoat: t.clearcoat ?? 0, clearcoatRoughness: 0.4,
          sheen: t.sheen ?? 0, sheenColor: color.clone().lerp(new THREE.Color('#ffffff'), 0.5),
          envMapIntensity: t.env ?? 0.85,
          transparent: t.opacity != null, opacity: t.opacity ?? 1, depthWrite: t.opacity == null,
          ...common,
        })
        cache.set(hex, m)
      }
      return m
    }
    const faded = new THREE.MeshStandardMaterial({ color: new THREE.Color(meta.color), roughness: 0.8, metalness: 0, transparent: true, opacity: 0.06, depthWrite: false, envMapIntensity: 0.35, ...common })
    const highlight = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#ffb454'), emissive: new THREE.Color('#e8730c'), emissiveIntensity: 0.5, roughness: 0.33, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 1.0, ...common })
    const hovered = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(meta.color).lerp(new THREE.Color('#ffffff'), 0.4), emissive: new THREE.Color('#2f6ea5'), emissiveIntensity: 0.26, roughness: 0.4, clearcoat: 0.3, envMapIntensity: 1.0, ...common })
    return { makeBase, faded, highlight, hovered }
  }, [meta.color, system])

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
      const st = sid ? BY_ID.get(sid) : null
      m.userData.sid = sid
      m.userData.feature = st ? !!st.feature : true
      m.userData.sex = st ? st.sex : undefined
      const baseMat = mats.makeBase((st && organColor(st)) || meta.color)
      m.userData.baseMat = baseMat
      m.material = baseMat
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
      const { selectedId, hoveredId, fadeOthers, isolateStructure, showFeatures, sex, hidden } = st
      const anySel = !!selectedId
      const wantSex = sex === 'male' ? 'm' : 'f'
      for (const { mesh, sid } of meshesRef.current) {
        // sex-specific structures only show in the matching body
        const sexHidden = mesh.userData.sex && mesh.userData.sex !== wantSex
        // user-hidden structures stay hidden (persisted) until restored
        const userHidden = !!(sid && hidden.includes(sid))
        if (sid && sid === selectedId && !sexHidden && !userHidden) {
          mesh.material = mats.highlight
          mesh.visible = true
        } else if (sid && sid === hoveredId && !sexHidden && !userHidden) {
          mesh.material = mats.hovered
          mesh.visible = true
        } else {
          let vis = true
          if (sexHidden) vis = false
          if (userHidden) vis = false
          if (mesh.userData.feature && !showFeatures) vis = false
          if (anySel && isolateStructure) vis = false
          mesh.visible = vis
          mesh.material = anySel && fadeOthers ? mats.faded : (mesh.userData.baseMat || mats.makeBase(meta.color))
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
