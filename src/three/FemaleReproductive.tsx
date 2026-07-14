import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { FEMALE_REPRO } from '../data/terminology'
import { registerMeshes, meshRegistry } from './registry'
import { clipPlanes } from './clip'
import { sceneInfo } from './clip'
import { useStore } from '../store/useStore'

const NOOP_RAYCAST: THREE.Mesh['raycast'] = () => {}
const MESH_RAYCAST = THREE.Mesh.prototype.raycast

// Procedurally-built female reproductive set (uterus, cervix, vagina, two
// ovaries, two uterine tubes) placed in the pelvis. Shown only in female mode;
// integrates with selection / hover / per-organ hide like the loaded systems.
export default function FemaleReproductive() {
  const select = useStore((s) => s.select)
  const hover = useStore((s) => s.hover)
  const placed = useRef(false)

  const { group, meshes } = useMemo(() => buildOrgans(), [])

  // register meshes so "focus" framing can find them; clean up on unmount
  useEffect(() => {
    for (const { mesh, sid } of meshes) registerMeshes(sid, mesh)
    return () => { for (const o of FEMALE_REPRO) meshRegistry.delete(o.id) }
  }, [meshes])

  // reactive highlight / hover / hide — mirrors SystemModel's apply()
  useEffect(() => {
    const mats = MATERIALS
    const apply = (st: ReturnType<typeof useStore.getState>) => {
      const { selectedId, hoveredId, fadeOthers, isolateStructure, hidden } = st
      const anySel = !!selectedId
      for (const { mesh, sid, base } of meshes) {
        const userHidden = hidden.includes(sid)
        mesh.raycast = userHidden ? NOOP_RAYCAST : MESH_RAYCAST
        if (sid === selectedId && !userHidden) { mesh.material = mats.highlight; mesh.visible = true }
        else if (sid === hoveredId && !userHidden) { mesh.material = mats.hovered; mesh.visible = true }
        else {
          let vis = true
          if (userHidden) vis = false
          if (anySel && isolateStructure) vis = false
          mesh.visible = vis
          mesh.material = anySel && fadeOthers ? mats.faded : base
        }
      }
    }
    apply(useStore.getState())
    return useStore.subscribe(apply)
  }, [meshes])

  // place the group in the pelvis once the scene bounds are known
  useFrame(() => {
    if (placed.current || !sceneInfo.set) return
    const S = sceneInfo.size.y
    group.position.set(
      sceneInfo.center.x,
      sceneInfo.center.y - S * 0.11,
      sceneInfo.center.z + S * 0.015,
    )
    group.scale.setScalar(S)
    placed.current = true
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

// ---- materials (shared) ----------------------------------------------------
const common = { clippingPlanes: clipPlanes, side: THREE.DoubleSide as THREE.Side }
const tissue = (hex: string) =>
  new THREE.MeshPhysicalMaterial({ color: new THREE.Color(hex), roughness: 0.42, clearcoat: 0.34, clearcoatRoughness: 0.4, sheen: 0.3, sheenColor: new THREE.Color(hex).lerp(new THREE.Color('#fff'), 0.5), envMapIntensity: 1, ...common })
const MATERIALS = {
  uterus: tissue('#c37b86'),
  ovary: tissue('#e0b6a4'),
  tube: tissue('#cd8b93'),
  highlight: new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#ffb454'), emissive: new THREE.Color('#e8730c'), emissiveIntensity: 0.5, roughness: 0.33, clearcoat: 0.4, envMapIntensity: 1, ...common }),
  hovered: new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#e6b8bf'), emissive: new THREE.Color('#2f6ea5'), emissiveIntensity: 0.26, roughness: 0.4, clearcoat: 0.3, envMapIntensity: 1, ...common }),
  faded: new THREE.MeshStandardMaterial({ color: new THREE.Color('#c37b86'), roughness: 0.8, transparent: true, opacity: 0.06, depthWrite: false, ...common }),
}

// ---- geometry --------------------------------------------------------------
function buildOrgans() {
  const group = new THREE.Group()
  const meshes: { mesh: THREE.Mesh; sid: string; base: THREE.Material }[] = []
  const add = (geo: THREE.BufferGeometry, base: THREE.Material, sid: string) => {
    const mesh = new THREE.Mesh(geo, base)
    mesh.userData.sid = sid
    mesh.castShadow = false
    mesh.renderOrder = 2
    group.add(mesh)
    meshes.push({ mesh, sid, base })
    return mesh
  }

  // Uterus body — pear-shaped lathe profile (radius, height), anteverted.
  const prof: THREE.Vector2[] = [
    [0.001, 0.0], [0.010, 0.004], [0.013, 0.012], [0.0142, 0.022],
    [0.0125, 0.032], [0.0085, 0.039], [0.004, 0.0425], [0.0, 0.044],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const uterusPivot = new THREE.Group()
  uterusPivot.rotation.x = -0.35 // anteversion (fundus leans forward)
  group.add(uterusPivot)
  const uterus = add(new THREE.LatheGeometry(prof, 40), MATERIALS.uterus, FEMALE_REPRO[0].id)
  uterusPivot.add(uterus)

  // Cervix — short stem under the body
  const cervix = add(new THREE.CylinderGeometry(0.0075, 0.009, 0.014, 24), MATERIALS.uterus, FEMALE_REPRO[1].id)
  cervix.position.set(0, -0.007, 0)
  uterusPivot.add(cervix)

  // Vagina — canal below the cervix, angled slightly forward/down
  const vagina = add(new THREE.CylinderGeometry(0.009, 0.011, 0.032, 24, 1, true), MATERIALS.uterus, FEMALE_REPRO[2].id)
  vagina.position.set(0, -0.03, 0.006)
  vagina.rotation.x = 0.2
  group.add(vagina)

  // Ovaries + uterine tubes (right = +x, left = -x)
  const horn = (sign: number, ovarySid: string, tubeSid: string) => {
    const ovary = add(new THREE.SphereGeometry(0.008, 20, 16), MATERIALS.ovary, ovarySid)
    ovary.scale.set(1.5, 0.9, 0.9)
    ovary.position.set(sign * 0.05, 0.03, -0.006)
    group.add(ovary)

    const start = new THREE.Vector3(sign * 0.011, 0.05, 0.004) // uterine horn
    const end = new THREE.Vector3(sign * 0.043, 0.032, -0.005) // near ovary
    const curve = new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3(sign * 0.026, 0.056, 0.006),
      new THREE.Vector3(sign * 0.04, 0.045, 0.0),
      end,
    ])
    const tube = add(new THREE.TubeGeometry(curve, 40, 0.0026, 12, false), MATERIALS.tube, tubeSid)
    group.add(tube)
  }
  horn(1, FEMALE_REPRO[3].id, FEMALE_REPRO[5].id)
  horn(-1, FEMALE_REPRO[4].id, FEMALE_REPRO[6].id)

  return { group, meshes }
}
