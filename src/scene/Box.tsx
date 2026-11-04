import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { toroFaces } from './labels'

/** Envase de 1 litro tipo brik. Medidas reales aprox. 9,5 × 6,4 × 16,4 cm; 1 unidad = 6 cm. */
export const BOX_W = 1.58
export const BOX_D = 1.07
export const BOX_H = 2.73
const R = 0.07

export function Box() {
  const m = useMemo(() => {
    const body = new RoundedBoxGeometry(BOX_W, BOX_H, BOX_D, 6, R)
    const fin = new RoundedBoxGeometry(BOX_W - 0.04, 0.09, 0.1, 3, 0.03)
    const panel = new THREE.PlaneGeometry(BOX_W - R * 2, BOX_H - R * 2)
    const sidePanel = new THREE.PlaneGeometry(BOX_D - R * 2, BOX_H - R * 2)
    return { body, fin, panel, sidePanel, ...toroFaces() }
  }, [])

  const ribs = useMemo(() => Array.from({ length: 14 }, (_, i) => -BOX_W / 2 + 0.1 + (i * (BOX_W - 0.2)) / 13), [])

  return (
    <group>
      {/* cuerpo de cartón laminado, satinado */}
      <mesh geometry={m.body}>
        <meshPhysicalMaterial color="#A3201F" roughness={0.55} clearcoat={0.2} clearcoatRoughness={0.5} envMapIntensity={0.7} />
      </mesh>
      {/* frente y dorso */}
      <mesh geometry={m.panel} position={[0, 0, BOX_D / 2 + 0.003]}>
        <meshPhysicalMaterial map={m.front} roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.4} envMapIntensity={0.8} />
      </mesh>
      <mesh geometry={m.panel} position={[0, 0, -BOX_D / 2 - 0.003]} rotation-y={Math.PI}>
        <meshPhysicalMaterial map={m.back} roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.4} envMapIntensity={0.8} />
      </mesh>
      {/* laterales */}
      {[1, -1].map((s) => (
        <mesh key={s} geometry={m.sidePanel} position={[s * (BOX_W / 2 + 0.003), 0, 0]} rotation-y={(s * Math.PI) / 2}>
          <meshPhysicalMaterial map={m.side} roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.4} envMapIntensity={0.8} />
        </mesh>
      ))}
      {/* aleta de sellado con estrías */}
      <group position={[0, BOX_H / 2 + 0.04, 0]}>
        <mesh geometry={m.fin}>
          <meshPhysicalMaterial color="#B72A27" roughness={0.45} clearcoat={0.4} />
        </mesh>
        {ribs.map((x) => (
          <mesh key={x} position={[x, 0, 0.052]}>
            <boxGeometry args={[0.012, 0.075, 0.006]} />
            <meshStandardMaterial color="#7E1816" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
