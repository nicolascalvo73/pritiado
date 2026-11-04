import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export const iceMaterialProps = {
  color: '#FAFDFF',
  emissive: new THREE.Color('#9CC6DA'),
  emissiveIntensity: 0.24,
  transmission: 0.88,
  ior: 1.31,
  roughness: 0.12,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  attenuationColor: new THREE.Color('#D6EEF8'),
  attenuationDistance: 1.8,
  envMapIntensity: 2,
} as const

/** Núcleo turbio: el aire atrapado que vuelve blanco el centro del cubito. */
const coreMaterial = new THREE.MeshStandardMaterial({
  color: '#F4FAFF',
  emissive: '#B9D8E8',
  emissiveIntensity: 0.35,
  roughness: 0.9,
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
})

interface CubeDef {
  p: [number, number, number]
  s: number
  r: [number, number, number]
  spin: number
}

const CUBES: CubeDef[] = [
  { p: [0.05, 0.9, 0], s: 0.95, r: [0.4, 0.6, 0.2], spin: 0.25 },
  { p: [-0.85, 0.1, 0.25], s: 0.78, r: [0.8, 0.2, 0.5], spin: -0.2 },
  { p: [0.9, -0.1, -0.1], s: 0.85, r: [0.2, 0.9, 0.7], spin: 0.3 },
  { p: [-0.1, -0.95, 0.15], s: 0.9, r: [0.6, 0.3, 0.1], spin: -0.28 },
  { p: [0.75, 1.35, 0.3], s: 0.5, r: [0.9, 0.4, 0.3], spin: 0.4 },
  { p: [-0.8, 1.25, -0.2], s: 0.45, r: [0.1, 0.7, 0.9], spin: -0.35 },
  { p: [0.95, -1.3, 0.2], s: 0.48, r: [0.5, 0.1, 0.6], spin: 0.33 },
  { p: [-0.95, -1.1, -0.1], s: 0.55, r: [0.3, 0.8, 0.2], spin: -0.3 },
  { p: [0.1, 0.05, 0.55], s: 0.6, r: [0.7, 0.5, 0.4], spin: 0.22 },
]

function Cube({ def, i }: { def: CubeDef; i: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => new RoundedBoxGeometry(def.s, def.s, def.s, 5, def.s * 0.13), [def.s])
  const core = useMemo(() => new RoundedBoxGeometry(def.s * 0.5, def.s * 0.62, def.s * 0.46, 3, def.s * 0.2), [def.s])
  useFrame((st) => {
    const m = ref.current
    if (!m) return
    const t = st.clock.elapsedTime
    m.rotation.set(def.r[0] + t * def.spin * 0.6, def.r[1] + t * def.spin, def.r[2] + t * def.spin * 0.4)
    m.position.y = def.p[1] + Math.sin(t * 0.8 + i * 1.7) * 0.07
  })
  return (
    <mesh ref={ref} geometry={geo} position={def.p}>
      <meshPhysicalMaterial {...iceMaterialProps} thickness={def.s * 1.3} />
      <mesh geometry={core} material={coreMaterial} rotation={[0.3, 0.5, 0.1]} />
    </mesh>
  )
}

export function Ice() {
  return (
    <group>
      {CUBES.map((c, i) => (
        <Cube key={i} def={c} i={i} />
      ))}
    </group>
  )
}
