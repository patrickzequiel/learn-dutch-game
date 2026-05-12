import { useState } from 'react';
import type { Lesson, AppProgress, GameType } from '../../types';
import { getDueCards } from '../../lib/srs';
import { getAllMondelingVocabulary } from '../../data/mondeling';

const EXAM_DATE = '2026-05-12';
const EXAM_INFO = {
  date: 'Dinsdag 12 mei',
  time: '18:15 – 21:00 u',
  group: 'Groep A — Patrick om 19:05 u (Spreken)',
  listen: 'Luisteren: lokaal B 3.07',
  speak: 'Spreken: lokaal B 2.03 (met Daan)',
  topic: 'Natuur, milieu en omgeving',
};

const JUNE_EXAM = {
  listen: '9 juni 19:45 – 21:00 u (Luisterexamen)',
  speak: '16 juni 18:45 u (Spreekexamen — Patrick)',
};

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
  onStartGame: (lessonId: string, type: GameType) => void;
  onStartMix: (type: GameType) => void;
  onBack: () => void;
}

export function MondelingDashboard({ lessons, progress, onSelectLesson, onStartGame, onStartMix, onBack }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const isExamToday = today === EXAM_DATE;

  const allVocab = getAllMondelingVocabulary();
  const dueCount = getDueCards(progress.cards).length;

  const [tab, setTab] = useState<'lessen' | 'examen'>('lessen');

  return (
    <div className="screen">
      <div className="dash-header">
        <button className="btn-back" onClick={onBack}>← Modus</button>
        <div className="dash-header-badges">
          {dueCount > 0 && (
            <span className="badge badge-due">{dueCount} te herhalen</span>
          )}
        </div>
      </div>

      <div className="mode-banner mode-banner--mondeling">
        <span className="mode-banner-icon">🎙️</span>
        <div>
          <strong>Mondeling</strong>
          <span className="mode-banner-sub">Spreken & Luisteren</span>
        </div>
      </div>

      {isExamToday && (
        <div className="exam-alert">
          <div className="exam-alert-title">EXAMEN VANDAAG</div>
          <div className="exam-alert-info">
            <div>{EXAM_INFO.date} · {EXAM_INFO.time}</div>
            <div className="exam-alert-group">{EXAM_INFO.group}</div>
            <div className="exam-alert-rooms">
              <span>{EXAM_INFO.listen}</span>
              <span>{EXAM_INFO.speak}</span>
            </div>
            <div className="exam-alert-topic">Onderwerp: <strong>{EXAM_INFO.topic}</strong></div>
          </div>
          <button
            className="btn btn-primary exam-alert-btn"
            onClick={() => onSelectLesson('mond-natuur')}
          >
            Studeer nu: Natuur &amp; Milieu →
          </button>
        </div>
      )}

      <div className="quick-actions">
        <button className="quick-btn quick-btn--listen" onClick={() => onStartMix('listening')}>
          <span>🔊</span>
          <span>Mix Luisteren<br /><small>{allVocab.length} woorden</small></span>
        </button>
        <button className="quick-btn quick-btn--flash" onClick={() => onStartMix('flashcard')}>
          <span>📇</span>
          <span>Mix Flashcard<br /><small>alle lessen</small></span>
        </button>
      </div>

      <div className="dash-tabs">
        {(['lessen', 'examen'] as const).map(t => (
          <button
            key={t}
            className={`dash-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'lessen' ? 'Lessen' : 'Examens'}
          </button>
        ))}
      </div>

      {tab === 'lessen' && (
        <div className="lessons-list">
          {lessons.map(lesson => {
            const { total, mastered, learning } = getLessonMastery(lesson, progress);
            const unseen = total - mastered - learning;
            const masteredPct = total > 0 ? (mastered / total) * 100 : 0;
            const learningPct = total > 0 ? (learning / total) * 100 : 0;
            const isExam = lesson.id === 'mond-natuur' && isExamToday;

            return (
              <div key={lesson.id} className={`lcc ${isExam ? 'lcc--exam' : ''}`} onClick={() => onSelectLesson(lesson.id)}>
                <div className="lcc-top">
                  <div className="lcc-meta">
                    {isExam && <span className="lcc-exam-badge">EXAMEN</span>}
                    <span className="lcc-theme">{lesson.theme}</span>
                    {lesson.subtheme && <span className="lcc-date">{lesson.subtheme}</span>}
                  </div>
                  <div className="lcc-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="lcc-btn lcc-btn--listen"
                      title="Luisteren"
                      onClick={() => onStartGame(lesson.id, 'listening')}
                    >
                      🔊
                    </button>
                    <button
                      className="lcc-btn lcc-btn--flash"
                      title="Flashcard"
                      onClick={() => onStartGame(lesson.id, 'flashcard')}
                    >
                      📇
                    </button>
                  </div>
                </div>
                <div className="mastery-bar">
                  <div className="mastery-fill mastery-fill--done" style={{ width: `${masteredPct}%` }} />
                  <div className="mastery-fill mastery-fill--learning" style={{ width: `${learningPct}%` }} />
                </div>
                <div className="lcc-stats">
                  <span className="lcc-stat lcc-stat--done">{mastered} geleerd</span>
                  <span className="lcc-stat lcc-stat--learning">{learning} bezig</span>
                  <span className="lcc-stat lcc-stat--unseen">{unseen} nieuw</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'examen' && (
        <div className="exam-info-section">
          {isExamToday && (
            <div className="card exam-info-card exam-info-card--today">
              <div className="exam-info-badge">VANDAAG</div>
              <h3>Luisteren &amp; Spreken — {EXAM_INFO.date}</h3>
              <table className="exam-table">
                <tbody>
                  <tr><td>Tijd</td><td>{EXAM_INFO.time}</td></tr>
                  <tr><td>Patrick</td><td>{EXAM_INFO.group}</td></tr>
                  <tr><td>Luisteren</td><td>{EXAM_INFO.listen}</td></tr>
                  <tr><td>Spreken</td><td>{EXAM_INFO.speak}</td></tr>
                  <tr><td>Onderwerp</td><td><strong>{EXAM_INFO.topic}</strong></td></tr>
                </tbody>
              </table>
              <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => onSelectLesson('mond-natuur')}>
                Studeer Natuur &amp; Milieu →
              </button>
            </div>
          )}

          <div className="card exam-info-card">
            <h3>Examens juni 2026</h3>
            <table className="exam-table">
              <tbody>
                <tr><td>Luisterexamen</td><td>{JUNE_EXAM.listen}</td></tr>
                <tr><td>Spreekexamen</td><td>{JUNE_EXAM.speak}</td></tr>
              </tbody>
            </table>
            <p className="exam-info-note">
              Slagen vereist: ≥ 50% voor Luisteren EN ≥ 50% voor Spreken.<br />
              Voor Vantage Mondeling: ≥ 70%.
            </p>
          </div>

          <div className="card exam-info-card">
            <h3>Wat moet je studeren?</h3>
            <ul className="exam-topics-list">
              <li>Natuur, milieu en omgeving (bosbrand, overstroming, klimaatverandering...)</li>
              <li>Praten over ernstige gebeurtenissen (erg / vreselijk / verschrikkelijk)</li>
              <li>Opinie uitdrukken (Naar mijn mening... / Ik denk dat...)</li>
              <li>Conjuncties: zodat / zolang / voordat / zodra</li>
              <li>We zorgen voor elkaar (opvoeding, mantelzorg, dankbaarheid)</li>
              <li>Zinnen om tijd te winnen (Laat me even nadenken...)</li>
              <li>Emoties benoemen (goedgezind, opgelucht, ontgoocheld...)</li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setTab('lessen')}>
              Begin te studeren →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
