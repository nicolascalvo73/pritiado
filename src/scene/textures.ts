import * as THREE from 'three'

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Gotas de condensación: sirve de alphaMap y de bumpMap. */
export function makeDropletTexture(size = 1024, count = 900, seed = 7) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = '#000'
  g.fillRect(0, 0, size, size)
  const r = rng(seed)
  for (let i = 0; i < count; i++) {
    const x = r() * size
    const y = r() * size
    const big = r() < 0.12
    const rad = big ? 5 + r() * 9 : 1.6 + r() * 4
    const stretch = big ? 1 + r() * 0.8 : 1 + r() * 0.2
    for (const ox of [-size, 0, size]) {
      const gr = g.createRadialGradient(x + ox - rad * 0.2, y - rad * 0.25, rad * 0.1, x + ox, y, rad)
      gr.addColorStop(0, 'rgba(255,255,255,1)')
      gr.addColorStop(0.7, 'rgba(210,210,210,0.85)')
      gr.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = gr
      g.save()
      g.translate(x + ox, y)
      g.scale(1, stretch)
      g.translate(-(x + ox), -y)
      g.beginPath()
      g.arc(x + ox, y, rad, 0, Math.PI * 2)
      g.fill()
      g.restore()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.NoColorSpace
  t.anisotropy = 4
  return t
}

/** Fondo: negro cálido con resplandor radial, palabra gigante y grano. */
export function makeBackgroundTexture(
  aspect: number,
  glow: string,
  word: string | null,
) {
  const h = 1536
  const w = Math.max(768, Math.round(h * Math.min(Math.max(aspect, 0.4), 2.4)))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = '#12060C'
  g.fillRect(0, 0, w, h)
  const cx = w / 2
  const cy = h * 0.5
  const rad = Math.min(w, h) * 0.78
  g.save()
  g.translate(cx, cy)
  g.scale(1, 0.95)
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, rad)
  rg.addColorStop(0, hexA(glow, 0.55))
  rg.addColorStop(0.45, hexA(glow, 0.2))
  rg.addColorStop(0.78, hexA(glow, 0))
  g.fillStyle = rg
  g.fillRect(-w, -h, w * 2, h * 2)
  g.restore()
  if (word) {
    g.save()
    g.font = `italic 900 ${Math.round(Math.min(w, h) * 0.34)}px Archivo, Impact, sans-serif`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillStyle = hexA(glow, 0.2)
    g.fillText(word, cx, cy)
    g.restore()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Relieve de puntos en columnas, como el cuerpo de una botella de 2 litros. */
export function makeDimpleTexture() {
  const size = 1024
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = '#000'
  g.fillRect(0, 0, size, size)
  const cols = 10
  for (let i = 0; i < cols; i++) {
    const x = ((i + 0.5) / cols) * size
    for (let y = size * 0.16; y < size * 0.8; y += 36) {
      const grd = g.createRadialGradient(x, y, 0, x, y, 11)
      grd.addColorStop(0, 'rgba(255,255,255,1)')
      grd.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grd
      g.save()
      g.translate(x, y)
      g.rotate(Math.PI / 4)
      g.scale(1, 1.3)
      g.beginPath()
      g.arc(0, 0, 11, 0, Math.PI * 2)
      g.fill()
      g.restore()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.NoColorSpace
  return t
}

/** Espuma fina: burbujitas sobre la superficie del trago. */
export function makeFoamTexture() {
  const size = 512
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = '#d9b3bf'
  g.fillRect(0, 0, size, size)
  const r = rng(21)
  for (let i = 0; i < 700; i++) {
    const x = r() * size
    const y = r() * size
    const rad = 2 + r() * 8
    const gr = g.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 0, x, y, rad)
    gr.addColorStop(0, 'rgba(255,245,248,0.95)')
    gr.addColorStop(0.8, 'rgba(240,205,215,0.7)')
    gr.addColorStop(1, 'rgba(160,100,120,0.5)')
    g.fillStyle = gr
    g.beginPath()
    g.arc(x, y, rad, 0, Math.PI * 2)
    g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Círculo suave para el bokeh del fondo. */
export function makeSoftDot(ring = false) {
  const s = 128
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')!
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  if (ring) {
    gr.addColorStop(0, 'rgba(255,255,255,0.08)')
    gr.addColorStop(0.7, 'rgba(255,255,255,0.18)')
    gr.addColorStop(0.9, 'rgba(255,255,255,0.9)')
    gr.addColorStop(1, 'rgba(255,255,255,0)')
  } else {
    gr.addColorStop(0, 'rgba(255,255,255,0.9)')
    gr.addColorStop(0.5, 'rgba(255,255,255,0.35)')
    gr.addColorStop(1, 'rgba(255,255,255,0)')
  }
  g.fillStyle = gr
  g.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
