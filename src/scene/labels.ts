import * as THREE from 'three'
import prittyUrl from '../assets/labels/pritty-etiqueta.jpg'
import toroFrontUrl from '../assets/labels/toro-frente.jpg'
import toroBackUrl from '../assets/labels/toro-dorso.jpg'
import toroSideUrl from '../assets/labels/toro-lateral.jpg'

/**
 * Etiquetas reales (fotos procesadas con scripts/make_labels.py desde labels-src/).
 * La textura se usa enseguida y se completa cuando termina de bajar la imagen.
 */
const loader = new THREE.TextureLoader()

function load(url: string) {
  const t = loader.load(url)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Banda envolvente 3:1 con el frente en el centro de la imagen. */
export function prittyLabel() {
  const t = load(prittyUrl)
  t.wrapS = THREE.RepeatWrapping
  // en LatheGeometry u = 0 mira a +Z (la cámara): se corre media vuelta para que el centro de la imagen quede al frente
  t.offset.x = 0.5
  return t
}

export const toroFaces = () => ({ front: load(toroFrontUrl), back: load(toroBackUrl), side: load(toroSideUrl) })
