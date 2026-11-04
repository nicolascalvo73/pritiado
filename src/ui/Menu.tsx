import { SECTIONS } from './Content'

interface Props {
  open: boolean
  onClose: () => void
  onGoStage: (i: number) => void
  onGoSection: (i: number) => void
}

const STAGE_LINKS = ['Pritty de limón', 'Vino Toro', 'Hielo', 'El pritiado']

export function Menu({ open, onClose, onGoStage, onGoSection }: Props) {
  return (
    <div className={`menu ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button className="iconbtn close" aria-label="Cerrar menú" onClick={onClose}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" /></svg>
      </button>
      <nav aria-label="Menú">
        <p className="kicker">Los cuatro pasos</p>
        <ul>
          {STAGE_LINKS.map((n, i) => (
            <li key={n}>
              <button onClick={() => { onGoStage(i); onClose() }}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <span className="d">{n}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="kicker">Leer y firmar</p>
        <ul>
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <button onClick={() => { onGoSection(i); onClose() }}>
                <span className="num">→</span>
                <span className="d">{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
