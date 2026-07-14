import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { CHAKRAS, type Chakra } from '../data/chakras'
import { registerMeshes, meshRegistry } from './registry'
import { sceneInfo } from './clip'
import { useStore } from '../store/useStore'

const NOOP_RAYCAST: THREE.Mesh['raycast'] = () => {}
const MESH_RAYCAST = THREE.Mesh.prototype.raycast
const WHITE = new THREE.Color('#ffffff')

// One shared cone geometry: apex at the origin (body surface), opening along +Z.
// Built in unit space (fractions of body height); each chakra container is
// scaled to the measured body size.
function makeConeGeo(baseR: number, height: number) {
  const g = new THREE.ConeGeometry(baseR, height, 24, 1, true)
  g.rotateX(-Math.PI / 2) // apex -> -Z, base -> +Z
  g.translate(0, 0, height / 2) // apex to origin, base at +Z
  return g
}

interface Node {
  cont: THREE.Group
  outer: THREE.Mesh; inner: THREE.Mesh; core: THREE.Mesh
  om: THREE.MeshBasicMaterial; im: THREE.MeshBasicMaterial; cm: THREE.MeshBasicMaterial
  c: Chakra; phase: number
}

// Animated chakra (energy-center) overlay: spinning translucent cone vortices at
// anatomical positions. Selectable / hideable like the anatomy, and gated by the
// "chakras" layer toggle (rendered only when that layer is on).
export default function ChakraLayer() {
  const select = useStore((s) => s.select)
  const hover = useStore((s) => s.hover)
  const placed = useRef(false)

  const { group, nodes, meshes } = useMemo(() => build(), [])

  useEffect(() => {
    for (const { mesh, sid } of meshes) registerMeshes(sid, mesh)
    return () => { for (const c of CHAKRAS) meshRegistry.delete(c.id) }
  }, [meshes])

  // selection / hover / hide
  useEffect(() => {
    const apply = (st: ReturnType<typeof useStore.getState>) => {
      const { selectedId, hoveredId, hidden } = st
      for (const n of nodes) {
        const userHidden = hidden.includes(n.c.id)
        n.cont.visible = !userHidden
        for (const m of [n.outer, n.inner, n.core]) m.raycast = userHidden ? NOOP_RAYCAST : MESH_RAYCAST
        const boost = n.c.id === selectedId ? 1.9 : n.c.id === hoveredId ? 1.35 : 1
        n.om.userData.boost = boost
        n.im.userData.boost = boost
        n.cm.userData.boost = boost
      }
    }
    apply(useStore.getState())
    return useStore.subscribe(apply)
  }, [nodes])

  // place at pelvis-relative anatomical points once bounds are known
  useFrame((state, delta) => {
    if (!placed.current && sceneInfo.set) {
      const S = sceneInfo.size.y
      const c = sceneInfo.center
      const depthF = Math.max(sceneInfo.size.z * 0.42, S * 0.055)
      for (const n of nodes) {
        const cont = n.cont
        const zSurf = n.c.dir === 'back' ? -depthF : n.c.dir === 'front' ? depthF : 0
        cont.position.set(c.x + n.c.x * S, c.y + n.c.y * S, c.z + zSurf)
        cont.scale.setScalar(S)
      }
      placed.current = true
    }
    if (!placed.current) return
    // animate: spin the vortices, gentle pulse, selection glow
    const t = state.clock.elapsedTime
    for (const n of nodes) {
      n.outer.rotation.z += delta * 0.7
      n.inner.rotation.z -= delta * 1.15
      const pulse = 1 + 0.06 * Math.sin(t * 1.8 + n.phase)
      n.cont.scale.setScalar(sceneInfo.size.y * (0.9 + 0.1 * n.c.size) * pulse)
      const b = (n.om.userData.boost as number) || 1
      n.om.opacity = 0.3 * b
      n.im.opacity = 0.5 * b
      n.cm.opacity = Math.min(1, 0.85 * b)
      const cs = (0.9 + 0.15 * Math.sin(t * 2.4 + n.phase)) * (b > 1.5 ? 1.5 : 1)
      n.core.scale.setScalar(cs)
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const sid = (e.object as THREE.Mesh).userData?.sid as string | undefined
    if (sid) select(sid, false)
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const sid = (e.object as THREE.Mesh).userData?.sid as string | undefined
    if (sid && useStore.getState().hoveredId !== sid) hover(sid)
  }
  const onOut = () => hover(null)

  return <primitive object={group} onClick={onClick} onPointerMove={onMove} onPointerOut={onOut} />
}

const OUTER_GEO = makeConeGeo(0.055, 0.16)
const INNER_GEO = makeConeGeo(0.032, 0.15)
const CORE_GEO = new THREE.SphereGeometry(0.02, 16, 12)
const PICK_GEO = new THREE.SphereGeometry(0.075, 8, 6)

function build() {
  const group = new THREE.Group()
  const nodes: Node[] = []
  const meshes: { mesh: THREE.Mesh; sid: string }[] = []

  CHAKRAS.forEach((c, i) => {
    const cont = new THREE.Group()
    if (c.dir === 'back') cont.rotation.y = Math.PI
    else if (c.dir === 'up') cont.rotation.x = -Math.PI / 2
    else if (c.dir === 'down') cont.rotation.x = Math.PI / 2

    const col = new THREE.Color(c.color)
    const glow = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide as THREE.Side }
    const om = new THREE.MeshBasicMaterial({ color: col, opacity: 0.3, ...glow })
    const im = new THREE.MeshBasicMaterial({ color: col.clone().lerp(WHITE, 0.35), opacity: 0.5, ...glow })
    const cm = new THREE.MeshBasicMaterial({ color: col.clone().lerp(WHITE, 0.55), opacity: 0.85, ...glow })

    const outer = new THREE.Mesh(OUTER_GEO, om)
    const inner = new THREE.Mesh(INNER_GEO, im)
    const core = new THREE.Mesh(CORE_GEO, cm)
    const s = c.size
    outer.scale.setScalar(s); inner.scale.setScalar(s); core.scale.setScalar(1)
    for (const m of [outer, inner, core]) { m.userData.sid = c.id; m.renderOrder = 6; m.frustumCulled = false }

    // invisible but raycastable pick target for easy tapping
    const pick = new THREE.Mesh(PICK_GEO, new THREE.MeshBasicMaterial({ visible: false }))
    pick.userData.sid = c.id
    pick.position.z = 0.06
    pick.scale.setScalar(s)

    cont.add(outer, inner, core, pick)
    group.add(cont)
    nodes.push({ cont, outer, inner, core, om, im, cm, c, phase: i * 0.7 })
    meshes.push({ mesh: outer, sid: c.id }, { mesh: inner, sid: c.id }, { mesh: core, sid: c.id }, { mesh: pick, sid: c.id })
  })
  return { group, nodes, meshes }
}
