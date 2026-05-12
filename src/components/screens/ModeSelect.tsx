interface Props {
  onSelect: (mode: 'schriftelijk' | 'mondeling') => void;
}

export function ModeSelect({ onSelect }: Props) {
  return (
    <div className="screen mode-select-screen">
      <div className="mode-select-header">
        <h1 className="mode-select-title">Nederlands leren</h1>
        <p className="mode-select-sub">Kies je studierichting</p>
      </div>

      <div className="mode-cards">
        <button className="mode-card mode-card--schrijven" onClick={() => onSelect('schriftelijk')}>
          <div className="mode-card-icon">📝</div>
          <div className="mode-card-body">
            <h2 className="mode-card-title">Schriftelijk</h2>
            <p className="mode-card-desc">Lessen 1–11 · Vocabulaire · Grammatica · Oefeningen</p>
          </div>
          <div className="mode-card-arrow">→</div>
        </button>

        <button className="mode-card mode-card--spreken" onClick={() => onSelect('mondeling')}>
          <div className="mode-card-icon">🎙️</div>
          <div className="mode-card-body">
            <h2 className="mode-card-title">Mondeling</h2>
            <p className="mode-card-desc">Spreken · Luisteren · Zinnen · Examens</p>
          </div>
          <div className="mode-card-arrow">→</div>
        </button>
      </div>
    </div>
  );
}
