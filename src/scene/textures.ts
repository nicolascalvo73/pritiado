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

/** Etiqueta dorada metalizada con bordes verdes, lisa e intercambiable. */
export function makeLabelTexture() {
  const w = 1024
  const h = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const gr = g.createLinearGradient(0, 0, w, 0)
  const stops: [number, string][] = [
    [0, '#B08F36'],
    [0.08, '#D9B955'],
    [0.2, '#F4E7A6'],
    [0.34, '#D9B955'],
    [0.5, '#F0DE98'],
    [0.66, '#D4B04A'],
    [0.8, '#F0DE98'],
    [0.93, '#C4A042'],
    [1, '#B08F36'],
  ]
  stops.forEach(([o, col]) => gr.addColorStop(o, col))
  g.fillStyle = gr
  g.fillRect(0, 0, w, h)
  // cepillado fino
  const r = rng(3)
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? '255,245,200' : '90,70,20'},${0.03 + r() * 0.05})`
    g.fillRect(r() * w, r() * h, 60 + r() * 220, 1)
  }
  // bordes verdes
  const band = h * 0.075
  const green = g.createLinearGradient(0, 0, 0, band)
  green.addColorStop(0, '#5E9420')
  green.addColorStop(0.5, '#7DB02A')
  green.addColorStop(1, '#6AA023')
  g.fillStyle = green
  g.fillRect(0, 0, w, band)
  g.fillRect(0, h - band, w, band)
  g.fillStyle = 'rgba(255,255,255,0.35)'
  g.fillRect(0, band, w, 2)
  g.fillRect(0, h - band - 2, w, 2)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.wrapS = THREE.RepeatWrapping
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

/** Cara de la caja de vino (genérica, sin marca). kind = 'front' lleva uvas; 'back' queda lisa para el contenido. */
export function makeBoxFaceTexture(kind: 'front' | 'back') {
  const w = 640
  const h = 1152
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const paint = () => {
    const red = g.createLinearGradient(0, 0, w, 0)
    red.addColorStop(0, '#8E1C1A')
    red.addColorStop(0.25, '#BC2B28')
    red.addColorStop(0.55, '#A3201F')
    red.addColorStop(1, '#85181A')
    g.fillStyle = red
    g.fillRect(0, 0, w, h)
    // franja inferior más oscura
    const low = g.createLinearGradient(0, h * 0.9, 0, h)
    low.addColorStop(0, 'rgba(0,0,0,0)')
    low.addColorStop(1, 'rgba(0,0,0,0.28)')
    g.fillStyle = low
    g.fillRect(0, h * 0.9, w, h * 0.1)

    const r = rng(11)
    if (kind === 'front') {
      const leaf = (x: number, y: number, s: number, rot: number) => {
        g.save()
        g.translate(x, y)
        g.rotate(rot)
        g.scale(s, s)
        const lg = g.createLinearGradient(-20, 0, 20, 0)
        lg.addColorStop(0, '#2F6527')
        lg.addColorStop(0.5, '#4F9A40')
        lg.addColorStop(1, '#3F7A32')
        g.fillStyle = lg
        g.beginPath()
        g.moveTo(0, 0)
        g.bezierCurveTo(-60, -30, -80, -120, 0, -170)
        g.bezierCurveTo(80, -120, 60, -30, 0, 0)
        g.fill()
        g.strokeStyle = 'rgba(25,70,20,0.7)'
        g.lineWidth = 2.5
        g.beginPath()
        g.moveTo(0, -4)
        g.lineTo(0, -150)
        g.stroke()
        g.restore()
      }
      leaf(150, 250, 1.1, -0.7)
      leaf(490, 250, 1.1, 0.7)
      leaf(320, 215, 1.0, 0)
      const grape = (x: number, y: number, rad: number) => {
        const gr = g.createRadialGradient(x - rad * 0.35, y - rad * 0.4, rad * 0.1, x, y, rad)
        gr.addColorStop(0, '#7A8CD0')
        gr.addColorStop(0.5, '#2F3F7A')
        gr.addColorStop(1, '#161F4C')
        g.fillStyle = gr
        g.beginPath()
        g.arc(x, y, rad, 0, Math.PI * 2)
        g.fill()
        g.fillStyle = 'rgba(255,255,255,0.5)'
        g.beginPath()
        g.arc(x - rad * 0.35, y - rad * 0.4, rad * 0.22, 0, Math.PI * 2)
        g.fill()
      }
      // racimos a la izquierda, al centro y a la derecha, saliendo por detrás del panel
      const cluster = (cx: number, cy: number, n: number, rad: number) => {
        for (let row = 0; row < n; row++) {
          const cnt = n - row
          for (let i = 0; i < cnt; i++) {
            grape(cx + (i - (cnt - 1) / 2) * rad * 1.9 + (r() - 0.5) * 3, cy + row * rad * 1.65, rad)
          }
        }
      }
      cluster(320, 245, 6, 27)
      cluster(110, 300, 4, 22)
      cluster(530, 300, 4, 22)
    }

    // panel crema con arco superior y borde dorado
    const px = 38
    const pw = w - px * 2
    const top = kind === 'front' ? h * 0.3 : h * 0.1
    const bottom = h * 0.9
    const path = new Path2D()
    if (kind === 'front') {
      path.moveTo(px, top + 120)
      path.quadraticCurveTo(px, top, w / 2, top - 6)
      path.quadraticCurveTo(w - px, top, w - px, top + 120)
    } else {
      path.moveTo(px, top + 18)
      path.quadraticCurveTo(px, top, px + 18, top)
      path.lineTo(w - px - 18, top)
      path.quadraticCurveTo(w - px, top, w - px, top + 18)
    }
    path.lineTo(w - px, bottom - 14)
    path.quadraticCurveTo(w - px, bottom, w - px - 14, bottom)
    path.lineTo(px + 14, bottom)
    path.quadraticCurveTo(px, bottom, px, bottom - 14)
    path.closePath()
    const cream = g.createLinearGradient(0, 0, w, 0)
    cream.addColorStop(0, '#D9CC9F')
    cream.addColorStop(0.1, '#F1E5BD')
    cream.addColorStop(0.45, '#F8EFCB')
    cream.addColorStop(0.88, '#EADEB2')
    cream.addColorStop(1, '#D2C593')
    g.fillStyle = cream
    g.fill(path)
    g.lineWidth = 9
    g.strokeStyle = '#C79A3B'
    g.stroke(path)
    g.lineWidth = 2
    g.strokeStyle = 'rgba(199,154,59,0.6)'
    g.save()
    g.translate(w / 2, h / 2)
    g.scale(0.96, 0.975)
    g.translate(-w / 2, -h / 2)
    g.stroke(path)
    g.restore()
    drawBoxText(g, kind, w, h, top, bottom)
  }
  paint()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  // si Archivo todavía no cargó, se repinta cuando llega
  if (!document.fonts.check(BOX_FONT(40))) {
    document.fonts.load(BOX_FONT(40)).then(() => {
      paint()
      t.needsUpdate = true
    })
  }
  return t
}

const BOX_FONT = (px: number) => `italic 900 ${px}px Archivo, 'Arial Black', sans-serif`

/** Texto genérico del brik (sin marca): denominación al frente, letra chica y código de barras al dorso. */
function drawBoxText(g: CanvasRenderingContext2D, kind: 'front' | 'back', w: number, h: number, top: number, bottom: number) {
  const wine = '#7A1830'
  const cx = w / 2
  g.save()
  g.textAlign = 'center'
  g.textBaseline = 'alphabetic'
  if ('fontStretch' in g) (g as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = 'expanded'
  if (kind === 'front') {
    const mid = top + (bottom - top) * 0.47
    g.fillStyle = wine
    g.font = BOX_FONT(118)
    g.fillText('VINO', cx, mid - 20)
    g.fillText('TINTO', cx, mid + 92)
    g.fillStyle = '#C79A3B'
    g.fillRect(cx - 150, mid + 128, 300, 5)
    g.fillStyle = wine
    g.font = "700 34px 'Hanken Grotesk', system-ui, sans-serif"
    g.fillText('D E   M E S A', cx, mid + 186)
    g.font = BOX_FONT(46)
    g.fillText('1 LITRO', cx, bottom - 50)
  } else {
    const x0 = 86
    const x1 = w - 86
    g.fillStyle = wine
    g.font = BOX_FONT(44)
    g.fillText('VINO TINTO', cx, top + 90)
    g.font = "700 22px 'Hanken Grotesk', system-ui, sans-serif"
    g.fillText('D E   M E S A', cx, top + 128)
    // letra chica ilegible: renglones grises
    const r = rng(23)
    g.fillStyle = 'rgba(90, 40, 30, 0.32)'
    for (let y = top + 190; y < bottom - 260; y += 26) {
      const para = (y - top) % 182 < 26
      const len = para ? 0.55 + r() * 0.3 : 0.82 + r() * 0.18
      g.fillRect(x0, y, (x1 - x0) * len, 9)
    }
    // código de barras genérico
    const bw = 230
    const bh = 120
    const bx = cx - bw / 2
    const by = bottom - 210
    g.fillStyle = '#FFFFFF'
    g.fillRect(bx - 16, by - 14, bw + 32, bh + 50)
    g.fillStyle = '#1B0A12'
    let x = bx
    while (x < bx + bw) {
      const k = 2 + Math.floor(r() * 4)
      if (r() > 0.42) g.fillRect(x, by, k, bh)
      x += k + 1 + Math.floor(r() * 2)
    }
    g.font = "600 18px 'Hanken Grotesk', system-ui, sans-serif"
    g.fillText('7 790000 000000', cx, by + bh + 26)
  }
  g.restore()
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
