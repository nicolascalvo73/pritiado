import { STAGES } from '../config/stages'
import { SECTIONS } from './Content'

interface Props {
  stageIndex: number
  scroll: number // 0 portada .. 1 contenido
  section: number
  onPrev: () => void
  onNext: () => void
  onDescend: () => void
  onTop: () => void
  onMenu: () => void
  onGoSection: (i: number) => void
  muted: boolean
  onToggleSound: () => void
  showHint: boolean
}

export function Overlay(p: Props) {
  const { stageIndex, scroll, section } = p
  const stage = STAGES[stageIndex]
  const total = STAGES.length
  const last = stageIndex === total - 1
  const heroOpacity = Math.max(0, 1 - scroll * 2.4)
  const inContent = scroll > 0.35
  return (
    <div className="ov">
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <div className="frame" aria-hidden="true" style={{ opacity: heroOpacity }}>
        <i /><i /><i /><i />
      </div>

      <header className="head">
        <button
          className={`iconbtn eq ${p.muted ? 'muted' : ''}`}
          aria-label={p.muted ? 'Activar música' : 'Silenciar música'}
          onClick={p.onToggleSound}
        >
          <span /><span /><span /><span />
        </button>
        <span className="d brand">Pritiado</span>
        <button className="iconbtn" aria-label="Abrir menú" onClick={p.onMenu}>
          <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true">
            <path d="M0 1h22M0 11h14" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </header>

      <div className="hero-ui" style={{ opacity: heroOpacity, pointerEvents: heroOpacity < 0.2 ? 'none' : undefined }}>
        <h1 className="d title">Que el pritiado sea Patrimonio Cultural Inmaterial de la Humanidad</h1>
        <footer className="foot">
          {p.showHint && (
            <div className="hint" aria-hidden="true">
              <svg className="swipe" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EDE23B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15c0 4-2.2 6.5-6 6.5-2.6 0-4-1-5-3l-2.5-4.5a1.5 1.5 0 0 1 2.4-1.7L9 14" />
              </svg>
              <span>Deslizá</span>
            </div>
          )}
          <p key={stage.id} className="d caption" aria-live="polite" style={last ? { color: 'var(--accent)' } : undefined}>
            {stage.caption}
          </p>
          <div className="nav">
            <button className="round ghost" aria-label="Etapa anterior" disabled={stageIndex === 0} onClick={p.onPrev}>
              <svg width="12" height="18" viewBox="0 0 12 18" aria-hidden="true"><path d="M10 1L2 9l8 8" stroke="currentColor" strokeWidth="2.2" fill="none" /></svg>
            </button>
            <div className="count">
              <span>{String(stageIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
              <div className="dots">
                {STAGES.map((s, i) => (
                  <i key={s.id} className={i === stageIndex ? 'on' : ''} />
                ))}
              </div>
            </div>
            <button
              className="round solid"
              aria-label={last ? 'Ver el dorso de la botella' : 'Etapa siguiente'}
              onClick={last ? p.onDescend : p.onNext}
            >
              <svg width="12" height="18" viewBox="0 0 12 18" aria-hidden="true"><path d="M2 1l8 8-8 8" stroke="currentColor" strokeWidth="2.2" fill="none" /></svg>
            </button>
          </div>
          <button className="down" onClick={p.onDescend}>
            Seguí bajando
            <svg className="nudge" width="14" height="10" viewBox="0 0 14 10" aria-hidden="true"><path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
          </button>
          <div className="progress" aria-hidden="true">
            <div style={{ width: `${((stageIndex + 1) / total) * 14}%` }} />
          </div>
        </footer>
      </div>

      {/* riel vertical: dónde estás en el contenido */}
      <nav className="rail" aria-label="Secciones" style={{ opacity: inContent ? 1 : 0, pointerEvents: inContent ? undefined : 'none' }}>
        <ul>
          {SECTIONS.map((s, i) => (
            <li key={s.id} className={i === section ? 'on' : ''}>
              <button onClick={() => p.onGoSection(i)} aria-label={s.name} aria-current={i === section}>
                <span className="lbl">{s.name}</span>
                <i />
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <button className="up" style={{ opacity: inContent ? 1 : 0, pointerEvents: inContent ? undefined : 'none' }} onClick={p.onTop} aria-label="Volver arriba">
        <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true"><path d="M1 9l6-6 6 6" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
        <span>Volver arriba</span>
      </button>
    </div>
  )
}
