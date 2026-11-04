import { useCallback, useEffect, useRef, useState } from 'react'
import { Scene, type Ctl } from './scene/Scene'
import { Overlay } from './ui/Overlay'
import { Entry } from './ui/Entry'
import { Menu } from './ui/Menu'
import { Content } from './ui/Content'
import { AUDIO_URL, SECTION_BACK, SECTION_STAGE, STAGES } from './config/stages'

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x))

export default function App() {
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const [showHint, setShowHint] = useState(true)
  const [scroll, setScroll] = useState(0)
  const [section, setSection] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const ctl = useRef<Ctl>({ target: 0, dragPx: 0, scroll: 0, rotBack: false, tiltX: 0 })
  const scroller = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const stageRef = useRef(0)
  const audio = useRef<HTMLAudioElement | null>(null)
  const drag = useRef({ id: -1, x0: 0, y0: 0, x: 0, t0: 0, locked: false })
  const wheelAt = useRef(0)

  const setStage = useCallback((i: number) => {
    const n = clamp(i, 0, STAGES.length - 1)
    stageRef.current = n
    setStageIndex(n)
    if (ctl.current.scroll < 0.05) ctl.current.target = n
  }, [])
  const go = useCallback((d: number) => setStage(stageRef.current + d), [setStage])

  // ---- música ----
  useEffect(() => {
    const a = new Audio(AUDIO_URL)
    a.loop = true
    a.volume = 0.6
    a.preload = 'auto'
    audio.current = a
    return () => {
      a.pause()
      audio.current = null
    }
  }, [])
  useEffect(() => {
    const a = audio.current
    if (!a) return
    if (muted) a.pause()
    else a.play().catch(() => {})
  }, [muted])

  const enter = (withSound: boolean) => {
    setMuted(!withSound)
    setLeaving(true)
    window.setTimeout(() => setEntered(true), 700)
  }

  // ---- teclado ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!entered || ctl.current.scroll > 0.05) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, entered])

  // ---- scroll vertical: portada -> contenido ----
  const onScroll = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const vh = el.clientHeight
    const s = clamp(el.scrollTop / (vh * 0.85), 0, 1)
    // sección activa: la última cuyo borde superior pasó el 60 % de la pantalla
    let sec = 0
    content.current?.querySelectorAll<HTMLElement>('[data-sec]').forEach((n, i) => {
      if (n.getBoundingClientRect().top < vh * 0.6) sec = i
    })
    const c = ctl.current
    c.scroll = s
    c.target = s > 0.05 ? SECTION_STAGE[sec] : stageRef.current
    c.rotBack = s > 0.3 && SECTION_BACK[sec]
    setScroll((prev) => (Math.abs(prev - s) > 0.01 ? s : prev))
    setSection(sec)
  }, [])

  const toSection = (i: number) => {
    const el = content.current?.querySelector<HTMLElement>(`[data-sec="${i}"]`)
    const sc = scroller.current
    if (!el || !sc) return
    sc.scrollTo({ top: sc.scrollTop + el.getBoundingClientRect().top - sc.clientHeight * 0.38, behavior: 'smooth' })
  }
  const descend = () => toSection(0)
  const top = () => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })

  // ---- carrusel horizontal: arrastre, flick y rueda ----
  const onDown = (e: React.PointerEvent) => {
    if (!entered || ctl.current.scroll > 0.05) return
    if ((e.target as HTMLElement).closest('button, a')) return
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, t0: performance.now(), locked: false }
  }
  const onMove = (e: React.PointerEvent) => {
    ctl.current.tiltX = (e.clientY / window.innerHeight - 0.5) * 2
    const d = drag.current
    if (d.id !== e.pointerId) return
    const dx = e.clientX - d.x0
    const dy = e.clientY - d.y0
    if (!d.locked) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        d.locked = true
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        setShowHint(false)
      } else return
    }
    d.x = e.clientX
    // resistencia en los extremos
    const atEdge = (stageRef.current === 0 && dx > 0) || (stageRef.current === STAGES.length - 1 && dx < 0)
    ctl.current.dragPx = atEdge ? dx * 0.3 : dx
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    if (d.id !== e.pointerId) return
    d.id = -1
    if (!d.locked) return
    const dx = d.x - d.x0
    const v = dx / Math.max(1, performance.now() - d.t0) // px/ms
    ctl.current.dragPx = 0
    if (Math.abs(dx) > 50 || Math.abs(v) > 0.45) go(dx < 0 ? 1 : -1)
  }
  const onWheel = (e: React.WheelEvent) => {
    if (!entered || ctl.current.scroll > 0.05) return
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 24) {
      const now = performance.now()
      if (now - wheelAt.current > 650) {
        wheelAt.current = now
        go(e.deltaX > 0 ? 1 : -1)
        setShowHint(false)
      }
    }
  }

  return (
    <div className="stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onWheel={onWheel}>
      <div className="canvas">
        <Scene ctl={ctl} />
      </div>
      <div className="scroller" ref={scroller} onScroll={onScroll} data-ready={entered}>
        <Content ref={content} />
      </div>
      <Overlay
        stageIndex={stageIndex}
        scroll={scroll}
        section={section}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onDescend={descend}
        onTop={top}
        onMenu={() => setMenuOpen(true)}
        onGoSection={toSection}
        muted={muted}
        onToggleSound={() => setMuted((m) => !m)}
        showHint={showHint}
      />
      <Menu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onGoStage={(i) => {
          top()
          setStage(i)
        }}
        onGoSection={toSection}
      />
      {!entered && <Entry onEnter={enter} leaving={leaving} />}
    </div>
  )
}
