import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { SYSTEMS } from '../data/systems'
import SystemModel from './SystemModel'
import CameraRig from './CameraRig'
import { updateClip } from './clip'

function ClipUpdater() {
  const clip = useStore((s) => s.clip)
  useEffect(() => { updateClip(clip) }, [clip])
  return null
}

function Lights() {
  return (
    <>
      <hemisphereLight args={['#dfe8f2', '#20242c', 1.0]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 10, 8]} intensity={1.15} />
      <directionalLight position={[-8, 4, -6]} intensity={0.5} color="#9fb8d6" />
      <directionalLight position={[0, -6, 4]} intensity={0.25} color="#ffd9b0" />
    </>
  )
}

export default function Viewer() {
  const visibleSystems = useStore((s) => s.visibleSystems)
  const autoRotate = useStore((s) => s.autoRotate)
  const select = useStore((s) => s.select)
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
        gl.toneMappingExposure = 1.05
      }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={['#0b1220']} />
      <fog attach="fog" args={['#0b1220', 60, 260]} />
      <Lights />
      <Suspense fallback={null}>
        {active.map((s) => (
          <SystemModel key={s.id} system={s.id} />
        ))}
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
