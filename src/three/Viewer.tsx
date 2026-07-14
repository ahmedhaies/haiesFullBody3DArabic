import { Suspense, useEffect, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useStore } from '../store/useStore'
import { SYSTEMS } from '../data/systems'
import { useIsMobile } from '../hooks'
import SystemModel from './SystemModel'
import FemaleReproductive from './FemaleReproductive'
import CameraRig from './CameraRig'
import { updateClip } from './clip'
import { sceneInfo } from './clip'

function ClipUpdater() {
  const clip = useStore((s) => s.clip)
  useEffect(() => { updateClip(clip) }, [clip])
  return null
}

// Image-based lighting from a procedural studio room (no network assets). Gives
// organs a soft, realistic sheen and grounds every material in reflections.
function EnvLight() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const rt = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = rt.texture
    return () => { rt.texture.dispose(); pmrem.dispose(); scene.environment = null }
  }, [gl, scene])
  return null
}

function Lights() {
  return (
    <>
      <hemisphereLight args={['#eaf0f7', '#181c22', 0.55]} />
      <directionalLight position={[6, 12, 8]} intensity={1.35} color="#fff6ea" />
      <directionalLight position={[-9, 5, -7]} intensity={0.5} color="#a8c4e6" />
      <directionalLight position={[0, -7, 5]} intensity={0.28} color="#ffd3ad" />
    </>
  )
}

// soft grounding shadow under the model, positioned from the measured bounds
function GroundShadow({ mobile }: { mobile: boolean }) {
  const [cfg, setCfg] = useState<{ x: number; y: number; z: number; scale: number; far: number } | null>(null)
  useFrame(() => {
    if (!cfg && sceneInfo.set) {
      setCfg({
        x: sceneInfo.center.x,
        y: sceneInfo.center.y - sceneInfo.size.y / 2 - sceneInfo.size.y * 0.03,
        z: sceneInfo.center.z,
        scale: Math.max(sceneInfo.size.x, sceneInfo.size.z) * 1.6,
        far: sceneInfo.size.y * 1.05,
      })
    }
  })
  if (!cfg) return null
  return (
    <ContactShadows
      position={[cfg.x, cfg.y, cfg.z]}
      scale={cfg.scale}
      far={cfg.far}
      resolution={mobile ? 512 : 1024}
      blur={2.8}
      opacity={0.5}
      color="#04060b"
      frames={mobile ? 1 : undefined}
    />
  )
}

export default function Viewer() {
  const visibleSystems = useStore((s) => s.visibleSystems)
  const autoRotate = useStore((s) => s.autoRotate)
  const select = useStore((s) => s.select)
  const sex = useStore((s) => s.sex)
  const mobile = useIsMobile()
  // keep a stable render order matching SYSTEMS
  const active = SYSTEMS.filter((s) => visibleSystems.includes(s.id))

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 42, near: 0.01, far: 5000, position: [0, 2, 20] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1
      }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={['#0a0f18']} />
      <fog attach="fog" args={['#0a0f18', 70, 300]} />
      <EnvLight />
      <Lights />
      <Suspense fallback={null}>
        {active.map((s) => (
          <SystemModel key={s.id} system={s.id} />
        ))}
        {sex === 'female' && <FemaleReproductive />}
        <GroundShadow mobile={mobile} />
      </Suspense>
      <CameraRig />
      <ClipUpdater />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.09}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        panSpeed={0.8}
        rotateSpeed={0.85}
        zoomSpeed={0.9}
        enablePan
      />
    </Canvas>
  )
}
