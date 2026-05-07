import { useState } from 'react';
import type { Lesson, AppProgress } from '../../types';
import { getDueCards } from '../../lib/srs';
import { getAllVocabulary, getAllGrammar } from '../../data';

type DashTab = 'lessen' | 'themas' | 'grammatica';

const THEME_BUNDLES = [
  { id: 'uitstap',      label: 'Uitstap & Reizen',       emoji: '✈️', lessonIds: ['les1', 'les3'] },
  { id: 'tijden',       label: 'Tijden & Verhalen',       emoji: '📖', lessonIds: ['les2', 'les4'] },
  { id: 'communicatie', label: 'Klachten & Conjuncties',  emoji: '💬', lessonIds: ['les5', 'conjuncties'] },
  { id: 'opvoeding',    label: 'Kinderen Opvoeden',       emoji: '👶', lessonIds: ['les6', 'les7'] },
  { id: 'zorg',         label: 'Zorgen voor Elkaar',      emoji: '🤝', lessonIds: ['les8', 'les9', 'les10'] },
  { id: 'natuur',       label: 'Natuur & Milieu',         emoji: '🌿', lessonIds: ['les11'] },
];

const GRAMMAR_CATS = [
  { key: 'tense',       label: 'Tijden',        emoji: '⏱️' },
  { key: 'conjunctie',  label: 'Conjuncties',   emoji: '🔗' },
  { key: 'grammar',     label: 'Grammatica',    emoji: '🏗️' },
  { key: 'preposition', label: 'Voorzetsels',   emoji: '📍' },
  { key: 'spelling',    label: 'Spelling',      emoji: '✍️' },
] as const;

function getLessonMastery(lesson: Lesson, progress: AppProgress) {
  const total = lesson.vocabulary.length;
  let mastered = 0, learning = 0;
  for (const v of lesson.vocabulary) {
    const card = progress.cards[v.id];
    if (!card || card.repetitions === 0) continue;
    if (card.repetitions >= 3 && card.easeFactor >= 2.3) mastered++;
    else learning++;
  }
  return { total, mastered, learning };
}

interface Props {
  lessons: Lesson[];
  progress: AppProgress;
  onSelectLesson: (id: string) => void;
  onStartReview: () => void;
  onStartMix: (lessonIds?: string[]) => void;
  onStartWeakWords: () => void;
}

export function Dashboard({ lessons, progress, onSelectLesson, onStartReview, onStartMix, onStartWeakWords }: Props) {
  const [tab, setTab] = useState<DashTab>('lessen');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openGramCat, setOpenGramCat] = useState<string | null>(null);

  const dueCount = getDueCards(progress.cards).length;
  const weakCount = getAllVocabulary().filter(v => {
    const card = progress.cards[v.id];
    return card && (card.lapses >= 2 || card.easeFactor < 2.0);
  }).length;

  const allGrammar = getAllGrammar();

  const lessonLabel = (lessonId: string) => {
    const l = lessons.find(x => x.id === lessonId);
    return l && l.number > 0 ? `Les ${l.number}` : 'Extra';
  };

  const searchResults = searchQuery.trim().length >= 2 ? (() => {
    const q = searchQuery.toLowerCase();
    return {
      vocab: getAllVocabulary().filter(v =>
        v.dutch.toLowerCase().includes(q) || v.translation.toLowerCase().includes(q)
      ).slice(0, 8),
      grammar: allGrammar.filter(g =>
        g.title.toLowerCase().includes(q) || g.explanation.toLowerCase().includes(q)
      ).slice(0, 4),
    };
  })() : null;

  return (
    <div className="screen">
      <header className="dashboard-header">
        <div>
          <h1 className="app-title">🇳🇱 Leer Nederlands</h1>
          <p className="app-subtitle">CVO Groeipunt 2.4 schriftelijk</p>
        </div>
        <div className="header-right">
          <div className="header-badges">
            <span className="badge badge-streak">🔥 {progress.streak}</span>
            <span className="badge badge-xp">⭐ {progress.totalXP} XP</span>
          </div>
          <button className="search-toggle" onClick={() => { setSearchOpen(o => !o); setSearchQuery(''); }}>
            {searchOpen ? '✕' : '🔍'}
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="search-bar">
          <input className="search-input" type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Zoek woorden of grammatica…" autoFocus />
        </div>
      )}

      {searchResults && (
        <div className="search-results">
          {searchResults.vocab.length === 0 && searchResults.grammar.length === 0 && (
            <p className="search-empty">Geen resultaten voor "{searchQuery}"</p>
          )}
          {searchResults.vocab.length > 0 && <>
            <div className="search-section-label">Woordenschat</div>
            {searchResults.vocab.map(v => (
              <button key={v.id} className="search-result-item" onClick={() => { onSelectLesson(v.lessonId); setSearchOpen(false); }}>
                <span className="search-result-dutch">{v.dutch}</span>
                <span className="search-result-translation">{v.translation}</span>
                <span className="search-result-lesson">{lessonLabel(v.lessonId)}</span>
              </button>
            ))}
          </>}
          {searchResults.grammar.length > 0 && <>
            <div className="search-section-label">Grammatica</div>
            {searchResults.grammar.map(g => (
              <button key={g.id} className="search-result-item" onClick={() => { onSelectLesson(g.lessonId); setSearchOpen(false); }}>
                <span className="search-result-dutch">{g.title}</span>
                <span className="search-result-lesson">{lessonLabel(g.lessonId)}</span>
              </button>
            ))}
          </>}
        </div>
      )}

      {!searchResults && <>
        {dueCount > 0 && (
          <div className="review-card card">
            <div className="review-card-content">
              <div>
                <h2 className="review-title">Tijd om te herhalen!</h2>
                <p className="review-subtitle">{dueCount} kaart{dueCount !== 1 ? 'en' : ''} wacht{dueCount === 1 ? '' : 'en'}</p>
              </div>
              <button className="btn btn-primary" onClick={onStartReview}>Herhalen →</button>
            </div>
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${tab === 'lessen' ? 'tab-active' : ''}`} onClick={() => setTab('lessen')}>📚 Lessen</button>
          <button className={`tab ${tab === 'themas' ? 'tab-active' : ''}`} onClick={() => setTab('themas')}>🗂️ Thema's</button>
          <button className={`tab ${tab === 'grammatica' ? 'tab-active' : ''}`} onClick={() => setTab('grammatica')}>📐 Grammatica</button>
        </div>

        {/* ── LESSEN ── */}
        {tab === 'lessen' && <>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => onStartMix()}>
              <span className="quick-action-icon">🔀</span>
              <span className="quick-action-label">Mix alle lessen</span>
            </button>
            <button className="quick-action-btn" onClick={onStartWeakWords} disabled={weakCount === 0}>
              <span className="quick-action-icon">⚠️</span>
              <span className="quick-action-label">Zwakke woorden{weakCount > 0 ? ` (${weakCount})` : ''}</span>
            </button>
          </div>

          <div className="lessons-grid">
            {lessons.map((lesson, i) => {
              const { total, mastered, learning } = getLessonMastery(lesson, progress);
              const masteredPct = total > 0 ? (mastered / total) * 100 : 0;
              const learningPct = total > 0 ? (learning / total) * 100 : 0;
              const allDone = mastered === total && total > 0;
              return (
                <button key={lesson.id} className="lesson-card-compact" onClick={() => onSelectLesson(lesson.id)}
                  style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className={`lcc-number ${allDone ? 'lcc-number-done' : ''}`}>
                    {allDone ? '✓' : lesson.number > 0 ? lesson.number : '★'}
                  </div>
                  <div className="lcc-theme">{lesson.theme}</div>
                  {total > 0 && (
                    <div className="mastery-bar lcc-bar">
                      <div className="mastery-mastered" style={{ width: `${masteredPct}%` }} />
                      <div className="mastery-learning" style={{ width: `${learningPct}%` }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>}

        {/* ── THEMA'S ── */}
        {tab === 'themas' && (
          <div className="theme-bundles">
            {THEME_BUNDLES.map((bundle, i) => {
              const bundleLessons = bundle.lessonIds
                .map(id => lessons.find(l => l.id === id))
                .filter(Boolean) as Lesson[];
              const allVocab = bundleLessons.flatMap(l => l.vocabulary);
              const mastered = allVocab.filter(v => {
                const c = progress.cards[v.id];
                return c && c.repetitions >= 3 && c.easeFactor >= 2.3;
              }).length;
              const pct = allVocab.length > 0 ? Math.round((mastered / allVocab.length) * 100) : 0;

              return (
                <button key={bundle.id} className="theme-bundle-card card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => onStartMix(bundle.lessonIds)}>
                  <div className="tbc-top">
                    <span className="tbc-emoji">{bundle.emoji}</span>
                    <div className="tbc-info">
                      <div className="tbc-label">{bundle.label}</div>
                      <div className="tbc-meta">{allVocab.length} woorden · {pct}% geleerd</div>
                    </div>
                    {pct === 100
                      ? <span className="tbc-done">✓</span>
                      : <span className="tbc-arrow">▶</span>}
                  </div>
                  <div className="mastery-bar tbc-bar">
                    <div className="mastery-mastered" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── GRAMMATICA ── */}
        {tab === 'grammatica' && (
          <div className="grammar-tab">
            {GRAMMAR_CATS.map(cat => {
              const rules = allGrammar.filter(g => g.category === cat.key);
              if (rules.length === 0) return null;
              const open = openGramCat === cat.key;
              return (
                <div key={cat.key} className="gram-cat-section card">
                  <button className="gram-cat-header" onClick={() => setOpenGramCat(open ? null : cat.key)}>
                    <span className="gram-cat-emoji">{cat.emoji}</span>
                    <span className="gram-cat-label">{cat.label}</span>
                    <span className="gram-cat-count">{rules.length}</span>
                    <span className="gram-cat-chevron">{open ? '▲' : '▼'}</span>
                  </button>
                  {open && (
                    <div className="gram-cat-rules">
                      {rules.map(rule => (
                        <button key={rule.id} className="gram-rule-item" onClick={() => onSelectLesson(rule.lessonId)}>
                          <span className="gram-rule-title">{rule.title}</span>
                          <span className="gram-rule-lesson">{lessonLabel(rule.lessonId)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </>}
    </div>
  );
}
