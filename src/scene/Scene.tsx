import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { Bottle } from './Bottle'
import { Box } from './Box'
import { Ice } from './Ice'
import { Jar } from './Jar'
import { Bubbles } from './Bubbles'
import { StageObject } from './Model'
import { STAGES, SHOW_BRAND_WORDS } from '../config/stages'
import { yOf } from './profile'

/** Estado compartido entre la interfaz (DOM) y la escena (WebGL). Se muta sin re-render. */
export interface Ctl {
  target: number // etapa hacia la que va el carrusel (0..3)
  dragPx: number // desplazamiento del dedo mientras se arrastra
  scroll: number // 0 = portada, 1 = en el contenido
  rotBack: boolean // mostrar el objeto de espaldas (leer el dorso)
  tiltX: number
}

export function viewMetrics(w: number, h: number) {
  const portrait = h >= w
  const frac = portrait ? 0.45 : 0.5
  const fov = 30
  const visibleH = 3.9 / frac
  const dist = visibleH / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)))
  const halfW = (visibleH * (w / h)) / 2
  const spacing = THREE.MathUtils.clamp(halfW * 0.95, 2.1, 3.7)
  const yOff = portrait ? -0.3 : -0.55
  return { portrait, fov, visibleH, dist, halfW, spacing, yOff, pxPerUnit: h / visibleH }
}

const ease = (x: number) => x * x * (3 - 2 * x)

function Camera() {
  const { camera, size, scene } = useThree()
  useEffect(() => {
    const vm = viewMetrics(size.width, size.height)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = vm.fov
    cam.position.set(0, vm.yOff, vm.dist)
    cam.lookAt(0, vm.yOff, 0)
    cam.updateProjectionMatrix()
    // los objetos vecinos se pierden en la oscuridad con la distancia
    scene.fog = new THREE.Fog('#12060C', vm.dist + 2, vm.dist + 14)
  }, [camera, size.width, size.height, scene])
  return null
}

const hex = (h: string) => new THREE.Color(h)
const GLOWS = STAGES.map((s) => hex(s.glow))

function Backdrop({ posRef }: { posRef: MutableRefObject<number> }) {
  const { scene, size } = useThree()
  const st = useMemo(() => {
    const h = 768
    const w = Math.max(384, Math.round(h * THREE.MathUtils.clamp(size.width / size.height, 0.4, 2.4)))
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return { c, tex, w, h, last: -1, portrait: size.height >= size.width }
  }, [size.width, size.height])

  useEffect(() => {
    scene.background = st.tex
    return () => {
      scene.background = null
      st.tex.dispose()
    }
  }, [scene, st])

  const tmp = useMemo(() => new THREE.Color(), [])
  useFrame(() => {
    const p = posRef.current
    if (Math.abs(p - st.last) < 0.0008) return
    st.last = p
    const i = Math.min(2, Math.max(0, Math.floor(p)))
    const f = THREE.MathUtils.clamp(p - i, 0, 1)
    tmp.copy(GLOWS[i]).lerp(GLOWS[Math.min(3, i + 1)], f)
    const g = st.c.getContext('2d')!
    g.fillStyle = '#12060C'
    g.fillRect(0, 0, st.w, st.h)
    g.save()
    g.translate(st.w / 2, st.h * 0.5)
    g.scale(1, 0.95)
    const rad = Math.min(st.w, st.h) * 0.78
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, rad)
    const rgb = `${Math.round(tmp.r * 255)},${Math.round(tmp.g * 255)},${Math.round(tmp.b * 255)}`
    rg.addColorStop(0, `rgba(${rgb},0.55)`)
    rg.addColorStop(0.45, `rgba(${rgb},0.2)`)
    rg.addColorStop(0.78, `rgba(${rgb},0)`)
    g.fillStyle = rg
    g.fillRect(-st.w, -st.h, st.w * 2, st.h * 2)
    g.restore()
    if (SHOW_BRAND_WORDS) {
      const { portrait } = st
      g.save()
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      STAGES.forEach((stg, k) => {
        const a = Math.max(0, 1 - Math.abs(p - k) * 1.5) * 0.2
        if (a < 0.004) return
        let fs = st.h * 0.3
        g.font = `italic 900 ${fs}px Archivo, Arial Black, sans-serif`
        const tw = g.measureText(stg.word).width
        fs *= Math.min(1, (st.w * 0.94) / tw)
        g.font = `italic 900 ${fs}px Archivo, Arial Black, sans-serif`
        g.fillStyle = `rgba(244,234,236,${a})`
        // en vertical la caja, el hielo y la jarra son más anchos que la botella: la palabra sube para asomar por encima
        g.fillText(stg.word, st.w / 2 + (k - p) * st.w * 0.35, st.h * (portrait ? 0.215 : 0.27))
      })
      g.restore()
    }
    st.tex.needsUpdate = true
  })
  return null
}

function Pedestal({ radius, color }: { radius: number; color: string }) {
  const y = yOf(1) - 0.04
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={y}>
        <circleGeometry args={[radius, 96]} />
        <meshStandardMaterial color="#1c1116" metalness={0.85} roughness={0.34} envMapIntensity={1.2} />
      </mesh>
      <mesh position-y={y - 0.09}>
        <cylinderGeometry args={[radius, radius + 0.06, 0.18, 96]} />
        <meshStandardMaterial color="#26191e" metalness={0.9} roughness={0.28} envMapIntensity={1.4} />
      </mesh>
      <mesh position-y={y + 0.003} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[radius - 0.045, radius, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} />
      </mesh>
    </group>
  )
}

const ITEMS = [
  { id: 'bottle', C: Bottle, s: 1, y: 0, radius: 1.35 },
  { id: 'box', C: Box, s: 3.68 / 2.73, y: 0, radius: 1.75 },
  { id: 'ice', C: Ice, s: 1, y: 0, radius: 1.6 },
  { id: 'jar', C: Jar, s: 1, y: -0.14, radius: 1.5 },
] as const

function Carousel({
  ctl,
  posRef,
  bubbles,
}: {
  ctl: MutableRefObject<Ctl>
  posRef: MutableRefObject<number>
  bubbles: MutableRefObject<number>
}) {
  const { size } = useThree()
  const root = useRef<THREE.Group>(null)
  const slots = useRef<(THREE.Group | null)[]>([])
  const spins = useRef<(THREE.Group | null)[]>([])
  const rots = useRef([0, 0, 0, 0])

  useFrame((state, dt) => {
    const c = ctl.current
    const vm = viewMetrics(size.width, size.height)
    const t = state.clock.elapsedTime
    const target = c.target - c.dragPx / vm.pxPerUnit / vm.spacing
    // en el contenido el salto puede ser de dos etapas (caja → jarra): con tope de velocidad, para que el paso
    // por el hielo se lea como un recorrido (~2 s) y no como un salto
    const inContent = c.scroll > 0.05
    let step = (target - posRef.current) * (1 - Math.exp(-dt * (inContent ? 3 : 7)))
    if (inContent) step = THREE.MathUtils.clamp(step, -1.15 * dt, 1.15 * dt)
    const p = posRef.current + step
    posRef.current = p
    bubbles.current = THREE.MathUtils.smoothstep(p, 1.9, 2.9)

    const s = ease(THREE.MathUtils.clamp(c.scroll, 0, 1))
    const r = root.current
    if (r) {
      if (vm.portrait) {
        r.position.set(0, s * 0.27 * vm.visibleH, 0)
        r.scale.setScalar(1 - 0.5 * s)
      } else {
        r.position.set(-s * vm.halfW * 0.42, 0, 0)
        r.scale.setScalar(1 - 0.12 * s)
      }
    }

    const active = Math.round(THREE.MathUtils.clamp(p, 0, 3))
    ITEMS.forEach((_, i) => {
      const slot = slots.current[i]
      const spin = spins.current[i]
      if (!slot || !spin) return
      const o = i - p
      const a = Math.abs(o)
      slot.position.set(o * vm.spacing, 0, -Math.min(a, 1.3) * 5)
      // vecinos: más chicos y se esconden al entrar al contenido
      const hide = 1 - Math.min(1, s * 4) * THREE.MathUtils.smoothstep(a, 0.3, 0.8)
      slot.scale.setScalar(Math.max(0.0001, (1 - 0.16 * Math.min(a, 1)) * hide))
      slot.visible = a < 2.2
      const isActive = i === active
      const want = isActive && c.rotBack ? Math.PI : 0
      rots.current[i] += (want - rots.current[i]) * (1 - Math.exp(-dt * 4))
      const sway = isActive ? Math.sin(t * 0.55 + i) * 0.22 * (1 - 0.6 * s) : -o * 0.5
      spin.rotation.y = rots.current[i] + sway
      spin.rotation.x = THREE.MathUtils.lerp(spin.rotation.x, isActive ? c.tiltX * 0.1 : 0, Math.min(1, dt * 4))
      spin.position.y = isActive ? Math.sin(t * 0.9) * 0.05 : 0
    })
  })

  return (
    <group ref={root}>
      {ITEMS.map(({ id, C, s, y, radius }, i) => (
        <group key={id} ref={(g) => void (slots.current[i] = g)}>
          <Pedestal radius={radius} color={STAGES[i].glow} />
          <group ref={(g) => void (spins.current[i] = g)}>
            <group scale={s} position-y={y}>
              <StageObject Generic={C} url={STAGES[i].modelUrl} />
            </group>
          </group>
        </group>
      ))}
    </group>
  )
}

/**
 * Resolución: los materiales con transmission (botella, hielo, jarra) suman un segundo render de la escena
 * a tamaño completo, así que en celulares el dpr se limita a 1,5 y baja a 1 si el FPS no alcanza.
 */
const MAX_DPR = Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio, Math.min(screen.width, screen.height) < 600 ? 1.5 : 2)

export function Scene({ ctl }: { ctl: MutableRefObject<Ctl> }) {
  const posRef = useRef(0)
  const bubbles = useRef(0)
  const [dpr, setDpr] = useState(MAX_DPR)
  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.95
      }}
      camera={{ fov: 30, near: 0.1, far: 100, position: [0, 0, 16] }}
    >
      <PerformanceMonitor flipflops={3} onDecline={() => setDpr(1)} onIncline={() => setDpr(MAX_DPR)} onFallback={() => setDpr(1)} />
      <Camera />
      <Backdrop posRef={posRef} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 5, 6]} intensity={1.4} />
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={4.5} color="#fff6e6" position={[-5, 2, 3]} scale={[3.5, 7, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={3.2} color="#ffe9c4" position={[5.5, 1, 2]} scale={[2.5, 7, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 6, 1]} scale={[8, 2, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={5} color="#f6ffc0" position={[-3.2, 0, -4]} scale={[0.8, 8, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={5} color="#fff2c8" position={[3.2, 0, -4]} scale={[0.8, 8, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={0.8} color="#4b1a2a" position={[0, -5, 0]} scale={[10, 3, 1]} target={[0, 0, 0]} />
        </Environment>
        <Bubbles strength={bubbles} />
        <Carousel ctl={ctl} posRef={posRef} bubbles={bubbles} />
      </Suspense>
    </Canvas>
  )
}
