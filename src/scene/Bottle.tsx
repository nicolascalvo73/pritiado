import { useMemo } from 'react'
import * as THREE from 'three'
import { SHELL_T_W, applyPetals, smoothProfile, yOf } from './profile'
import { makeDropletTexture, makeLabelTexture } from './textures'

/** Franja de la etiqueta (t = 0.40 .. 0.68 del alto, medido desde la tapa). */
const LABEL_PTS: [number, number][] = [
  [0.4, 0.985],
  [0.405, 0.975],
  [0.5, 0.97],
  [0.62, 0.96],
  [0.667, 0.97],
  [0.68, 0.975],
]

const SEG = 160

function lathe(points: THREE.Vector2[], petals = false) {
  // LatheGeometry espera los puntos de abajo hacia arriba
  const g = new THREE.LatheGeometry([...points].reverse(), SEG)
  if (petals) applyPetals(g)
  return g
}

/** Perfil del plástico cerrado en la base (centro empujado hacia adentro). */
function shellPoints(inset: number, fromT = 0.1, closeTop = false) {
  const pts = SHELL_T_W.filter(([t]) => t >= fromT)
  const v = smoothProfile(pts, inset)
  v.push(new THREE.Vector2(0.0001, yOf(0.968)))
  if (closeTop) v.unshift(new THREE.Vector2(0.0001, v[0].y))
  return v
}

function capGeometry() {
  const top = yOf(0)
  const bot = yOf(0.1)
  const pts = [
    new THREE.Vector2(0.212, bot),
    new THREE.Vector2(0.222, bot + 0.035),
    new THREE.Vector2(0.214, bot + 0.06),
    new THREE.Vector2(0.232, bot + 0.085),
    new THREE.Vector2(0.236, bot + 0.12),
    new THREE.Vector2(0.236, top - 0.1),
    new THREE.Vector2(0.232, top - 0.045),
    new THREE.Vector2(0.215, top - 0.014),
    new THREE.Vector2(0.17, top - 0.003),
    new THREE.Vector2(0.09, top),
    new THREE.Vector2(0.0001, top),
  ]
  const curve = new THREE.SplineCurve(pts)
  const smooth = curve.getPoints(60)
  const g = new THREE.LatheGeometry(smooth, 192)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    if (y > bot + 0.1 && y < top - 0.09) {
      const th = Math.atan2(z, x)
      const k = 1 + 0.014 * Math.max(0, Math.cos(th * 56)) // estrías
      pos.setX(i, x * k)
      pos.setZ(i, z * k)
    }
  }
  g.computeVertexNormals()
  return g
}

export function Bottle() {
  const m = useMemo(() => {
    const shell = lathe(shellPoints(0), true)
    const liquid = lathe(shellPoints(0.02, 0.146, true), true)
    const drops = lathe(shellPoints(-0.011, 0.14), true)
    const label = lathe(smoothProfile(LABEL_PTS, -0.005, 40))
    // cierre superior de la etiqueta no necesario: es una banda abierta
    const cap = capGeometry()
    const ring = new THREE.TorusGeometry(0.262, 0.016, 12, 96)
    const dropTex = makeDropletTexture()
    dropTex.repeat.set(3, 3)
    const labelTex = makeLabelTexture()
    return { shell, liquid, drops, label, cap, ring, dropTex, labelTex }
  }, [])

  return (
    <group>
      {/* líquido: amarillo limón turbio, opaco */}
      <mesh geometry={m.liquid}>
        <meshPhysicalMaterial
          color="#EBE02A"
          roughness={0.3}
          clearcoat={0.5}
          clearcoatRoughness={0.25}
          emissive="#A09A10"
          emissiveIntensity={0.26}
        />
      </mesh>

      {/* plástico PET transparente */}
      <mesh geometry={m.shell}>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          thickness={0.05}
          ior={1.45}
          roughness={0.05}
          clearcoat={0.4}
          clearcoatRoughness={0.05}
          envMapIntensity={1.3}
        />
      </mesh>

      {/* etiqueta dorada metalizada, lisa e intercambiable */}
      <mesh geometry={m.label}>
        <meshStandardMaterial
          map={m.labelTex}
          metalness={0.55}
          roughness={0.38}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* condensación */}
      <mesh geometry={m.drops}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          alphaMap={m.dropTex}
          bumpMap={m.dropTex}
          bumpScale={2.2}
          roughness={0.03}
          metalness={0}
          clearcoat={1}
          opacity={0.75}
          depthWrite={false}
          envMapIntensity={1.6}
        />
      </mesh>

      {/* anillo del cuello */}
      <mesh geometry={m.ring} position={[0, yOf(0.107), 0]} rotation-x={Math.PI / 2}>
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.55} roughness={0.15} clearcoat={0.6} />
      </mesh>

      {/* tapa amarilla con estrías */}
      <mesh geometry={m.cap}>
        <meshPhysicalMaterial
          color="#F2D50F"
          roughness={0.34}
          clearcoat={0.85}
          clearcoatRoughness={0.18}
          envMapIntensity={1.2}
        />
      </mesh>
    </group>
  )
}
