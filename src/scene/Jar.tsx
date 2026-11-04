import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { applyPetals, smoothProfile } from './profile'
import { makeDimpleTexture, makeDropletTexture, makeFoamTexture } from './textures'
import { iceMaterialProps } from './Ice'

/** Parte baja de una botella de 2 litros cortada: 2 de alto por 1 de ancho, con cintura y base de pétalos. */
export const JAR_D = 1.7
export const JAR_H = 3.4
const yJ = (t: number) => (0.5 - t) * JAR_H

const JAR_T_W: [number, number][] = [
  [0.0, 1.0],
  [0.03, 0.99],
  [0.15, 0.955],
  [0.3, 0.93],
  [0.5, 0.92],
  [0.7, 0.945],
  [0.82, 0.98],
  [0.9, 1.0],
  [0.95, 0.96],
  [0.98, 0.85],
  [0.995, 0.68],
  [1.0, 0.5],
]

const SEG = 160

/** Cubitos asomando por el borde; y es relativa a la boca de la jarra. */
const ICE: { p: [number, number, number]; s: number; r: [number, number, number] }[] = [
  { p: [-0.3, 0.05, 0.12], s: 0.52, r: [0.4, 0.5, 0.2] },
  { p: [0.22, 0.12, -0.2], s: 0.46, r: [0.7, 0.2, 0.6] },
  { p: [0.18, -0.02, 0.32], s: 0.4, r: [0.2, 0.9, 0.3] },
  { p: [-0.1, 0.2, -0.3], s: 0.36, r: [0.9, 0.3, 0.8] },
]

const petals = { yStart: yJ(0.8), yBase: yJ(1), lobes: 5, amp: 0.2, pinch: 0.09 }

function lathe(points: THREE.Vector2[]) {
  const g = new THREE.LatheGeometry([...points].reverse(), SEG)
  applyPetals(g, petals)
  return g
}

function profile(inset: number, fromT = 0) {
  const pts = JAR_T_W.filter(([t]) => t >= fromT)
  const v = smoothProfile(pts, inset, 200, JAR_D, JAR_H)
  v.push(new THREE.Vector2(0.0001, yJ(0.972)))
  return v
}

export function Jar() {
  const m = useMemo(() => {
    const shell = lathe(profile(0))
    const outer = lathe(profile(-0.012))
    const liquidPts = profile(0.025, 0.07)
    liquidPts.unshift(new THREE.Vector2(0.0001, liquidPts[0].y))
    const liquid = lathe(liquidPts)
    // aro esmerilado del corte
    const band = new THREE.CylinderGeometry(JAR_D / 2 + 0.012, JAR_D / 2 + 0.004, JAR_H * 0.07, 128, 1, true)
    const foam = new THREE.CircleGeometry(JAR_D / 2 - 0.03, 96)
    const dimple = makeDimpleTexture()
    dimple.repeat.set(1, 1)
    const drops = makeDropletTexture(1024, 700, 19)
    drops.repeat.set(3, 3)
    // geometrías del hielo creadas una sola vez (antes se recreaban en cada render)
    const iceGeos = ICE.map((c) => new RoundedBoxGeometry(c.s, c.s, c.s, 4, c.s * 0.13))
    return { shell, outer, liquid, band, foam, dimple, drops, foamTex: makeFoamTexture(), iceGeos }
  }, [])

  const top = yJ(0.0)

  return (
    <group>
      {/* trago: granate oscuro, casi opaco */}
      <mesh geometry={m.liquid}>
        <meshPhysicalMaterial
          color="#5A1226"
          roughness={0.32}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
          emissive="#4A0E1E"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* espuma */}
      <mesh geometry={m.foam} rotation-x={-Math.PI / 2} position-y={yJ(0.07) + 0.005}>
        <meshStandardMaterial map={m.foamTex} bumpMap={m.foamTex} bumpScale={1.5} roughness={0.55} color="#f3d8e0" />
      </mesh>
      {/* plástico con relieve de puntos */}
      <mesh geometry={m.shell}>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          thickness={0.06}
          ior={1.45}
          roughness={0.07}
          clearcoat={0.5}
          clearcoatRoughness={0.08}
          bumpMap={m.dimple}
          bumpScale={2.6}
          envMapIntensity={1.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* condensación */}
      <mesh geometry={m.outer}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          alphaMap={m.drops}
          bumpMap={m.drops}
          bumpScale={2}
          roughness={0.03}
          clearcoat={1}
          opacity={0.7}
          depthWrite={false}
          envMapIntensity={1.6}
        />
      </mesh>
      {/* aro del corte, esmerilado */}
      <mesh geometry={m.band} position-y={top - JAR_H * 0.035}>
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.5} roughness={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* hielo asomando */}
      {ICE.map((c, i) => (
        <mesh key={i} geometry={m.iceGeos[i]} position={[c.p[0], top + c.p[1], c.p[2]]} rotation={c.r}>
          <meshPhysicalMaterial {...iceMaterialProps} thickness={c.s * 1.1} />
        </mesh>
      ))}
    </group>
  )
}
