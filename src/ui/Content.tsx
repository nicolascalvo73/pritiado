import { forwardRef } from 'react'
import { PETITION_URL } from '../config/stages'

export const SECTIONS = [
  { id: 'botella', name: 'Qué es el pritiado' },
  { id: 'caja', name: 'Cómo se arma' },
  { id: 'firma', name: 'Firmá' },
] as const

const STEPS = [
  { t: 'Cortá la botella', d: 'Una botella de gaseosa de 2 litros, cortada a la altura del hombro. Esa es la jarra.' },
  { t: 'Hielo hasta arriba', d: 'Mucho hielo. Sin hielo no hay pritiado.' },
  { t: 'El vino Toro', d: 'Vino Toro de mesa, el de todos los días, de caja.' },
  { t: 'Pritty Limón', d: 'Se completa con Pritty Limón y se pasa de mano en mano.' },
]

const REASONS = [
  { t: 'Lo hace la gente', d: 'No tiene marca, ni dueño, ni fábrica. Cada mesa lo prepara a su manera.' },
  { t: 'Se aprende mirando', d: 'Pasa de familia en familia y entre amigos, de boca en boca y sin manual.' },
  { t: 'Es de Córdoba', d: 'Junta a varias generaciones: lo toman abuelos, hijos y nietos.' },
]

const PATH = [
  { t: 'Reconocimiento local', d: 'La comunidad, el municipio y la provincia reconocen la práctica como propia.' },
  { t: 'Registro nacional', d: 'Se la inscribe en el inventario de patrimonio cultural inmaterial del país.' },
  { t: 'Candidatura', d: 'Solo el Estado argentino puede presentarla ante la UNESCO.' },
]

export const Content = forwardRef<HTMLDivElement>(function Content(_, ref) {
  return (
    <div className="content" ref={ref}>
      <div className="spacer" aria-hidden="true" />

      <section className="sec" data-sec="0" id="botella">
        <h2 className="d h2">Qué es el pritiado</h2>
        <p className="lead">
          Es la bebida de Córdoba: vino Toro, Pritty Limón y mucho hielo, preparados y servidos en una botella de
          plástico cortada. Se toma en juntadas, en el río, en los asados y en los días de calor.
        </p>

        <h3 className="h3">Cómo se escribe</h3>
        <p>
          Se dice y se escribe de muchas formas: <em>pritiado</em>, <em>pritiao</em>, <em>pritiáu</em>, <em>priteado</em>,{' '}
          <em>priteao</em>, <em>priteáu</em>. En esta solicitud usamos <strong>pritiado</strong>, con una sola t, porque
          sigue la terminación -ado del español.
        </p>

        <h3 className="h3">Lo que dice el diccionario</h3>
        <p>
          En 2021 la Real Academia Española sumó «tinto de verano» al diccionario. El pritiado todavía no figura.
        </p>

        <dl className="facts" aria-label="Información cultural">
          <div><dt>Origen</dt><dd>Córdoba, Argentina</dd></div>
          <div><dt>Transmisión</dt><dd>Oral, de una persona a otra</dd></div>
          <div><dt>Titular</dt><dd>Nadie: es de todos</dd></div>
        </dl>
      </section>

      <section className="sec" data-sec="1" id="caja">
        <h2 className="d h2">Cómo se arma</h2>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <span className="n" aria-hidden="true">{i + 1}</span>
              <div>
                <h3 className="h3">{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="d h2 sp">Por qué merece ser patrimonio</h2>
        <p className="lead">
          La UNESCO llama patrimonio cultural inmaterial a las prácticas, saberes y tradiciones que una comunidad
          reconoce como propias y transmite de generación en generación (Convención de 2003).
        </p>
        <ul className="reasons">
          {REASONS.map((r) => (
            <li key={r.t}>
              <h3 className="h3">{r.t}</h3>
              <p>{r.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sec last" data-sec="2" id="firma">
        <p className="kicker">El camino a la UNESCO</p>
        <h2 className="d h2">Un primer paso</h2>
        <ol className="path">
          {PATH.map((s, i) => (
            <li key={s.t}>
              <span className="n" aria-hidden="true">{i + 1}</span>
              <div>
                <h3 className="h3">{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="small">Es un esquema general: los pasos exactos los define cada Estado.</p>
        <p className="lead">
          Esta solicitud pide el primer paso: que el pritiado sea reconocido como patrimonio cultural inmaterial.
        </p>
        <a className="cta" href={PETITION_URL} target="_blank" rel="noopener noreferrer">
          Firmar la solicitud
          <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M1 7h15M10 1l6 6-6 6" stroke="currentColor" strokeWidth="2.2" fill="none" /></svg>
        </a>
        <p className="small">La firma se hace en change.org y se abre en otra pestaña.</p>

        <footer className="legal">
          <p>El consumo excesivo de alcohol es perjudicial para la salud. Prohibida su venta a menores de 18 años.</p>
          <p>
            Fuentes: <a href="https://dle.rae.es/" target="_blank" rel="noopener noreferrer">Diccionario de la lengua española</a>{' '}
            · <a href="https://ich.unesco.org/es/" target="_blank" rel="noopener noreferrer">UNESCO, patrimonio inmaterial</a>
          </p>
          <p>Un proyecto de Mondi Studio.</p>
        </footer>
      </section>
    </div>
  )
})
