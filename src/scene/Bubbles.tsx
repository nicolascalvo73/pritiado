import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeSoftDot } from './textures'

interface Layer {
  count: number
  size: number
  speed: number
  zMin: number
  zMax: number
  ring: boolean
  color: string
  opacity: number
}

const LAYERS: Layer[] = [
  { count: 14, size: 3.2, speed: 0.18, zMin: -7, zMax: -4, ring: false, color: '#C2506A', opacity: 0.38 },
  { count: 10, size: 2.6, speed: 0.22, zMin: -6, zMax: -3.5, ring: false, color: '#E8B4C2', opacity: 0.3 },
  { count: 36, size: 0.62, speed: 0.34, zMin: -5, zMax: -2.5, ring: true, color: '#F4D6DE', opacity: 0.8 },
]

function Layer({ def, strength }: { def: Layer; strength: React.MutableRefObject<number> }) {
  const pts = useRef<THREE.Points>(null)
  const { geo, tex, seeds } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(def.count * 3)
    const seeds: number[] = []
    for (let i = 0; i < def.count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 11
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11
      pos[i * 3 + 2] = def.zMin + Math.random() * (def.zMax - def.zMin)
      seeds.push(Math.random() * 6.28)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geo, tex: makeSoftDot(def.ring), seeds }
  }, [def])
  useEffect(() => () => tex.dispose(), [tex])

  useFrame((st, dt) => {
    const p = pts.current
    if (!p) return
    const k = strength.current
    p.visible = k > 0.01
    if (!p.visible) return
    ;(p.material as THREE.PointsMaterial).opacity = def.opacity * k
    const a = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < def.count; i++) {
      let y = a.getY(i) + def.speed * dt * (0.6 + (seeds[i] % 1))
      if (y > 5.6) y = -5.6
      a.setY(i, y)
      a.setX(i, a.getX(i) + Math.sin(st.clock.elapsedTime * 0.6 + seeds[i]) * 0.0016)
    }
    a.needsUpdate = true
  })

  return (
    <points ref={pts} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        map={tex}
        size={def.size}
        sizeAttenuation
        transparent
        depthWrite={false}
        color={def.color}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Burbujas de fondo para la jarra: bokeh grande y burbujas chicas con borde. */
export function Bubbles({ strength }: { strength: React.MutableRefObject<number> }) {
  return (
    <group>
      {LAYERS.map((l, i) => (
        <Layer key={i} def={l} strength={strength} />
      ))}
    </group>
  )
}
