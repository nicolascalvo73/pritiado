interface Props {
  onEnter: (withSound: boolean) => void
  leaving: boolean
}

export function Entry({ onEnter, leaving }: Props) {
  return (
    <div className={`entry ${leaving ? 'leaving' : ''}`} role="dialog" aria-label="Entrada">
      <div className="entry-glow" aria-hidden="true" />
      <p className="kicker">Solicitud ciudadana</p>
      <h1 className="d entry-title">
        <span>Pritiado</span>
        <span className="alt">Patrimonio</span>
      </h1>
      <p className="entry-sub">Pedimos que el pritiado sea declarado Patrimonio Cultural Inmaterial de la Humanidad.</p>
      <div className="entry-actions">
        <button className="btn solid" onClick={() => onEnter(true)} autoFocus>
          <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true"><path d="M1 5h3l4-4v14l-4-4H1zM12 4.5a5 5 0 0 1 0 7M14.5 2a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Entrar con sonido
        </button>
        <button className="btn ghost" onClick={() => onEnter(false)}>Entrar sin sonido</button>
      </div>
      <p className="small">El tema de fondo es un cuarteto. Podés silenciarlo cuando quieras.</p>
    </div>
  )
}
