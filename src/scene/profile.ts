import * as THREE from 'three'

/**
 * Silueta de la botella de 500 cc, medida sobre la foto de referencia.
 * t = posición vertical (0 = tope de la tapa, 1 = base), w = ancho / ancho máximo del cuerpo.
 * El alto total es 3,68 veces el ancho del cuerpo.
 */
export const BODY_D = 1 // diámetro máximo del cuerpo (unidad de escala)
export const BOTTLE_H = 3.68

/** Perfil del plástico (desde el cuello hasta la base). */
export const SHELL_T_W: [number, number][] = [
  [0.1, 0.4],
  [0.119, 0.39],
  [0.143, 0.44],
  [0.167, 0.53],
  [0.19, 0.61],
  [0.214, 0.68],
  [0.238, 0.74],
  [0.262, 0.8],
  [0.286, 0.86],
  [0.31, 0.91],
  [0.333, 0.96],
  [0.357, 0.99],
  [0.381, 1.0],
  [0.405, 0.975],
  [0.5, 0.97],
  [0.62, 0.96],
  [0.667, 0.97],
  [0.714, 0.98],
  [0.738, 0.96],
  [0.786, 0.94],
  [0.81, 0.96],
  [0.857, 1.0],
  [0.88, 1.0],
  [0.905, 0.99],
  [0.929, 0.96],
  [0.952, 0.91],
  [0.972, 0.8],
  [0.99, 0.6],
  [1.0, 0.4],
]

/** Convierte t (0..1) a la coordenada Y del mundo, centrada en el origen. */
export const yOf = (t: number) => (0.5 - t) * BOTTLE_H

/** Curva suave que pasa por los puntos medidos. D = diámetro máximo, H = alto total. */
export function smoothProfile(
  pts: [number, number][],
  inset = 0,
  samples = 220,
  D = BODY_D,
  H = BOTTLE_H,
): THREE.Vector2[] {
  const v = pts.map(
    ([t, w]) => new THREE.Vector2(Math.max(0.001, (w * D) / 2 - inset), (0.5 - t) * H),
  )
  const curve = new THREE.SplineCurve(v)
  // muestreo por longitud de arco: las UV quedan proporcionales al alto real
  return curve.getSpacedPoints(samples)
}

export interface PetalOpts {
  yStart?: number
  yBase?: number
  lobes?: number
  amp?: number
  pinch?: number
}

/** Lóbulos tipo pétalo de la base: sube el plástico entre patitas. */
export function applyPetals(geo: THREE.BufferGeometry, o: PetalOpts = {}) {
  const { yStart = yOf(0.9), yBase = yOf(1), lobes = 5, amp = 0.16, pinch = 0.07 } = o
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    if (y > yStart) continue
    const k = THREE.MathUtils.smoothstep(yStart - y, 0, yStart - yBase)
    const theta = Math.atan2(z, x)
    const lobe = Math.pow(0.5 + 0.5 * Math.cos(lobes * theta), 0.55)
    const lift = amp * (1 - lobe) * k
    const p = 1 - pinch * (1 - lobe) * k
    pos.setY(i, y + lift)
    pos.setX(i, x * p)
    pos.setZ(i, z * p)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
}
