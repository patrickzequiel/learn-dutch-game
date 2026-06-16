import { useState } from 'react';
import { SPEAK_PROMPTS, VERB_PREPS, CATEGORY_LABELS } from '../../data/mondeling/examen';
import type { ExamCategory } from '../../data/mondeling/examen';
import { SpeakStudio } from '../games/SpeakStudio';
import { VerbPrepGame } from '../games/VerbPrepGame';

interface Props {
  onBack: () => void;
}

type Screen =
  | { kind: 'menu' }
  | { kind: 'speak'; category: ExamCategory }
  | { kind: 'verbprep' };

const CATEGORY_ORDER: ExamCategory[] = ['kennismaking', 'reflexief', 'situatie', 'beschrijven', 'advies'];

export function ExamTrainer({ onBack }: Props) {
  const [screen, setScreen] = useState<Screen>({ kind: 'menu' });

  if (screen.kind === 'speak') {
    const prompts = SPEAK_PROMPTS.filter(p => p.category === screen.category);
    const meta = CATEGORY_LABELS[screen.category];
    return (
      <SpeakStudio
        prompts={prompts}
        title={`${meta.icon} ${meta.label}`}
        onBack={() => setScreen({ kind: 'menu' })}
      />
    );
  }

  if (screen.kind === 'verbprep') {
    return <VerbPrepGame pairs={VERB_PREPS} onBack={() => setScreen({ kind: 'menu' })} />;
  }

  // ── MENU ──────────────────────────────────────────────────────────
  return (
    <div className="screen examtrainer">
      <div className="et-header">
        <button className="btn-back" onClick={onBack}>← Terug</button>
      </div>

      <div className="et-hero">
        <div className="et-hero-icon">🎤</div>
        <h1>Spreekexamen-studio</h1>
        <p>Oefen hardop, neem jezelf op en luister terug. Train de zes rubrieken van het mondeling examen.</p>
      </div>

      <div className="et-section-label">🎮 Memorisatie-game</div>
      <button className="et-game-card et-game-card--game" onClick={() => setScreen({ kind: 'verbprep' })}>
        <div className="et-game-icon">🔗</div>
        <div className="et-game-body">
          <div className="et-game-title">Werkwoord + voorzetsel</div>
          <div className="et-game-sub">Klik en match · {VERB_PREPS.length} vaste combinaties</div>
        </div>
        <div className="et-game-arrow">▶</div>
      </button>

      <div className="et-section-label">🎙️ Spreken &amp; opnemen</div>
      <div className="et-cat-grid">
        {CATEGORY_ORDER.map(cat => {
          const meta = CATEGORY_LABELS[cat];
          const count = SPEAK_PROMPTS.filter(p => p.category === cat).length;
          return (
            <button key={cat} className="et-cat-card" onClick={() => setScreen({ kind: 'speak', category: cat })}>
              <div className="et-cat-icon">{meta.icon}</div>
              <div className="et-cat-title">{meta.label}</div>
              <div className="et-cat-sub">{meta.sub}</div>
              <div className="et-cat-count">{count} vragen</div>
            </button>
          );
        })}
      </div>

      <div className="et-tip">
        💡 <strong>Tip:</strong> lees eerst de vraag, neem jezelf op terwijl je hardop antwoordt,
        luister je opname terug en vergelijk daarna met het modelantwoord.
      </div>
    </div>
  );
}
