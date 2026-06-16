import { useEffect, useMemo, useState } from 'react';
import type { VerbPrep } from '../../data/mondeling/examen';
import { speakDutch } from '../../lib/speech';

interface Props {
  pairs: VerbPrep[];
  onBack: () => void;
}

const ROUND_SIZE = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(text: string) {
  speakDutch(text, 0.9);
}

// A "prep token" combines the preposition text with the pair id it belongs to,
// so duplicate prepositions (op, aan, ...) stay distinguishable.
interface PrepToken {
  key: string;
  pairId: string;
  prep: string;
}

export function VerbPrepGame({ pairs, onBack }: Props) {
  const [roundPairs, setRoundPairs] = useState<VerbPrep[]>([]);
  const [prepTokens, setPrepTokens] = useState<PrepToken[]>([]);
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);
  const [selectedPrep, setSelectedPrep] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [roundNo, setRoundNo] = useState(0);

  const allPool = useMemo(() => pairs, [pairs]);

  function newRound(scoreReset = false) {
    const selection = shuffle(allPool).slice(0, ROUND_SIZE);
    setRoundPairs(selection);
    setPrepTokens(shuffle(selection.map(p => ({ key: `tok-${p.id}`, pairId: p.id, prep: p.prep }))));
    setMatched(new Set());
    setSelectedVerb(null);
    setSelectedPrep(null);
    setWrongShake(null);
    setRoundNo(n => n + 1);
    if (scoreReset) { setScore(0); setStreak(0); setMistakes(0); }
  }

  useEffect(() => { newRound(true); /* eslint-disable-next-line */ }, []);

  const roundComplete = roundPairs.length > 0 && matched.size === roundPairs.length;

  function tryMatch(verbId: string, prepToken: PrepToken) {
    if (verbId === prepToken.pairId) {
      const next = new Set(matched).add(verbId);
      setMatched(next);
      setSelectedVerb(null);
      setSelectedPrep(null);
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      const pair = roundPairs.find(p => p.id === verbId);
      if (pair) speak(pair.example);
    } else {
      setWrongShake(prepToken.key);
      setMistakes(m => m + 1);
      setStreak(0);
      window.setTimeout(() => {
        setWrongShake(null);
        setSelectedVerb(null);
        setSelectedPrep(null);
      }, 500);
    }
  }

  function pickVerb(id: string) {
    if (matched.has(id)) return;
    const newSel = selectedVerb === id ? null : id;
    setSelectedVerb(newSel);
    if (newSel && selectedPrep) {
      const tok = prepTokens.find(t => t.key === selectedPrep);
      if (tok) tryMatch(newSel, tok);
    }
  }

  function pickPrep(token: PrepToken) {
    if (matched.has(token.pairId)) return;
    const newSel = selectedPrep === token.key ? null : token.key;
    setSelectedPrep(newSel);
    if (newSel && selectedVerb) {
      tryMatch(selectedVerb, token);
    }
  }

  return (
    <div className="screen vpgame">
      <div className="vp-header">
        <button className="btn-back" onClick={onBack}>← Terug</button>
        <div className="vp-scoreboard">
          <span className="vp-score">⭐ {score}</span>
          {streak > 1 && <span className="vp-streak">🔥 {streak}</span>}
        </div>
      </div>

      <div className="vp-intro">
        <h2>Werkwoord + voorzetsel</h2>
        <p>Tik op een werkwoord en daarna op het juiste voorzetsel. Memoriseer de vaste combinaties!</p>
      </div>

      {!roundComplete ? (
        <div className="vp-board">
          <div className="vp-col">
            <div className="vp-col-head">Werkwoord</div>
            {roundPairs.map(p => (
              <button
                key={p.id}
                className={`vp-chip vp-verb ${matched.has(p.id) ? 'vp-matched' : ''} ${selectedVerb === p.id ? 'vp-selected' : ''}`}
                onClick={() => pickVerb(p.id)}
                disabled={matched.has(p.id)}
              >
                <span className="vp-chip-text">{p.verb}</span>
                <span className="vp-chip-meaning">{p.meaning}</span>
              </button>
            ))}
          </div>

          <div className="vp-col">
            <div className="vp-col-head">Voorzetsel</div>
            {prepTokens.map(tok => (
              <button
                key={tok.key}
                className={`vp-chip vp-prep ${matched.has(tok.pairId) ? 'vp-matched' : ''} ${selectedPrep === tok.key ? 'vp-selected' : ''} ${wrongShake === tok.key ? 'vp-wrong' : ''}`}
                onClick={() => pickPrep(tok)}
                disabled={matched.has(tok.pairId)}
              >
                {tok.prep}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="vp-complete">
          <div className="vp-complete-emoji">🎉</div>
          <h2>Ronde {roundNo} voltooid!</h2>
          <div className="vp-complete-stats">
            <div><strong>{score}</strong><span>punten</span></div>
            <div><strong>{mistakes}</strong><span>fouten</span></div>
          </div>
          <div className="vp-recap">
            {roundPairs.map(p => (
              <div key={p.id} className="vp-recap-row" onClick={() => speak(p.example)}>
                <span className="vp-recap-combo">{p.verb} <strong>{p.prep}</strong></span>
                <span className="vp-recap-ex">🔊 {p.example}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary vp-again" onClick={() => newRound(false)}>Nog een ronde →</button>
        </div>
      )}
    </div>
  );
}
