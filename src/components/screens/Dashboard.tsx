import { Lesson, AppProgress } from '../../types';
import { getDueCards } from '../../lib/srs';

interface Props {
  lessons: Lesson[];
  progress: AppProgress;
  onSelectLesson: (id: string) => void;
  onStartReview: () => void;
}

export function Dashboard({ lessons, progress, onSelectLesson, onStartReview }: Props) {
  const dueCount = getDueCards(progress.cards).length;

  return (
    <div className="screen">
      <header className="dashboard-header">
        <div>
          <h1 className="app-title">🇳🇱 Leer Nederlands</h1>
          <p className="app-subtitle">CVO Groeipunt 2.4 schriftelijk</p>
        </div>
        <div className="header-badges">
          <span className="badge badge-streak">🔥 {progress.streak}</span>
          <span className="badge badge-xp">⭐ {progress.totalXP} XP</span>
        </div>
      </header>

      {dueCount > 0 && (
        <div className="review-card card">
          <div className="review-card-content">
            <div>
              <h2 className="review-title">Tijd om te herhalen!</h2>
              <p className="review-subtitle">{dueCount} kaart{dueCount !== 1 ? 'en' : ''} wacht{dueCount === 1 ? '' : 'en} op herhaling'}</p>
            </div>
            <button className="btn btn-primary" onClick={onStartReview}>
              Herhalen →
            </button>
          </div>
        </div>
      )}

      <section>
        <h2 className="section-title">Lessen</h2>
        <div className="lessons-list">
          {lessons.map(lesson => {
            const done = progress.completedLessons.includes(lesson.id);
            return (
              <button key={lesson.id} className="lesson-card card" onClick={() => onSelectLesson(lesson.id)}>
                <div className="lesson-card-top">
                  <div className="lesson-number">{lesson.number > 0 ? `Les ${lesson.number}` : 'Extra'}</div>
                  {done && <span className="done-badge">✓ Klaar</span>}
                </div>
                <div className="lesson-date">{lesson.dateDisplay}</div>
                <div className="lesson-theme">{lesson.theme}</div>
                {lesson.subtheme && <div className="lesson-subtheme">{lesson.subtheme}</div>}
                <div className="lesson-topics">
                  {lesson.topics.slice(0, 3).map(t => (
                    <span key={t} className="topic-chip">{t}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
