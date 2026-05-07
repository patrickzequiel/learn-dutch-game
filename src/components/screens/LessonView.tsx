import { useState } from 'react';
import { Lesson, LessonTab, GameType } from '../../types';

interface Props {
  lesson: Lesson;
  onBack: () => void;
  onStartGame: (type: GameType, lessonId: string) => void;
}

export function LessonView({ lesson, onBack, onStartGame }: Props) {
  const [tab, setTab] = useState<LessonTab>('concepten');
  const [showTranslations, setShowTranslations] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const hasMatching = lesson.exercises.some(e => e.type === 'matching');
  const hasMultiple = lesson.exercises.some(e => e.type === 'multiple-choice');
  const hasFillIn = lesson.exercises.some(e => e.type === 'fill-in-blank');

  return (
    <div className="screen">
      <div className="lesson-header">
        <button className="btn-back" onClick={onBack}>← Terug</button>
        <div>
          <h2 className="lesson-title">{lesson.number > 0 ? `Les ${lesson.number}` : 'Extra'} — {lesson.dateDisplay}</h2>
          <p className="lesson-theme-title">{lesson.theme}</p>
        </div>
      </div>

      <div className="tabs">
        {(['concepten', 'woordenschat', 'oefenen'] as LessonTab[]).map(t => (
          <button key={t} className={`tab ${tab === t ? 'tab-active' : ''}`} onClick={() => setTab(t)}>
            {t === 'concepten' ? '📖 Concepten' : t === 'woordenschat' ? '📝 Woordenschat' : '🎮 Oefenen'}
          </button>
        ))}
      </div>

      {tab === 'concepten' && (
        <div className="tab-content">
          {lesson.grammar.length === 0 && <p className="empty-msg">Geen grammatica voor deze les.</p>}
          {lesson.grammar.map(rule => (
            <div key={rule.id} className="grammar-card card">
              <button className="grammar-header" onClick={() => setExpanded(expanded === rule.id ? null : rule.id)}>
                <span className="grammar-title">{rule.title}</span>
                <span>{expanded === rule.id ? '▲' : '▼'}</span>
              </button>
              {expanded === rule.id && (
                <div className="grammar-body">
                  <p className="grammar-explanation">{rule.explanation}</p>
                  <div className="rule-box">{rule.rule}</div>
                  <div className="examples-list">
                    {rule.examples.map((ex, i) => (
                      <div key={i} className="example-item">
                        <div className="example-dutch">{ex.dutch}</div>
                        <div className="example-translation">{ex.translation}</div>
                        {ex.highlight && <div className="example-highlight">→ {ex.highlight}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'woordenschat' && (
        <div className="tab-content">
          <div className="vocab-toolbar">
            <span>{lesson.vocabulary.length} woorden</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowTranslations(s => !s)}>
              {showTranslations ? '🙈 Verberg vertalingen' : '👁 Toon vertalingen'}
            </button>
          </div>
          <div className="vocab-grid">
            {lesson.vocabulary.map(v => (
              <div key={v.id} className="vocab-card card">
                <div className="vocab-dutch">{v.dutch}</div>
                {showTranslations && (
                  <>
                    <div className="vocab-translation">{v.translation}</div>
                    <div className="vocab-example"><em>{v.example}</em></div>
                    <div className="vocab-example-tr">{v.exampleTranslation}</div>
                  </>
                )}
                <span className="vocab-category">{v.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'oefenen' && (
        <div className="tab-content">
          <div className="games-list">
            <div className="game-option card" onClick={() => onStartGame('flashcard', lesson.id)}>
              <div className="game-icon">🃏</div>
              <div>
                <div className="game-name">Flashcards</div>
                <div className="game-desc">Studeer alle {lesson.vocabulary.length} woorden met herhaling</div>
              </div>
            </div>
            {hasMultiple && (
              <div className="game-option card" onClick={() => onStartGame('multiple-choice', lesson.id)}>
                <div className="game-icon">🔤</div>
                <div>
                  <div className="game-name">Meerkeuze</div>
                  <div className="game-desc">Kies het juiste antwoord</div>
                </div>
              </div>
            )}
            {hasFillIn && (
              <div className="game-option card" onClick={() => onStartGame('fill-in-blank', lesson.id)}>
                <div className="game-icon">✏️</div>
                <div>
                  <div className="game-name">Invullen</div>
                  <div className="game-desc">Vul het ontbrekende woord in</div>
                </div>
              </div>
            )}
            {hasMatching && (
              <div className="game-option card" onClick={() => onStartGame('matching', lesson.id)}>
                <div className="game-icon">🔗</div>
                <div>
                  <div className="game-name">Koppelen</div>
                  <div className="game-desc">Koppel woorden aan vertalingen</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
