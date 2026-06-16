import { useEffect, useRef, useState } from 'react';
import type { SpeakPrompt } from '../../data/mondeling/examen';
import { speakDutch, hasDutchVoice } from '../../lib/speech';

interface Props {
  prompts: SpeakPrompt[];
  title: string;
  onBack: () => void;
}

function speak(text: string) {
  speakDutch(text, 0.85);
}

type RecState = 'idle' | 'recording' | 'recorded';

export function SpeakStudio({ prompts, title, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [showModel, setShowModel] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [recState, setRecState] = useState<RecState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const prompt = prompts[index];

  // reset per-card recording when navigating
  function resetRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecState('idle');
    setSeconds(0);
    setMicError(null);
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecState('recorded');
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecState('recording');
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      setMicError('Geen toegang tot de microfoon. Sta microfoongebruik toe in je browser.');
      setRecState('idle');
    }
  }

  function stopRecording() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    mediaRecorderRef.current?.stop();
  }

  function playRecording() {
    if (!audioUrl) return;
    if (!audioRef.current) audioRef.current = new Audio(audioUrl);
    audioRef.current.src = audioUrl;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  }

  function go(delta: number) {
    const next = index + delta;
    if (next < 0 || next >= prompts.length) return;
    if (recState === 'recording') stopRecording();
    window.speechSynthesis?.cancel();
    resetRecording();
    setShowModel(false);
    setShowHint(false);
    setIndex(next);
  }

  function markDone() {
    setDone(prev => new Set(prev).add(index));
    if (index < prompts.length - 1) go(1);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(1, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const dutchVoice = hasDutchVoice();

  return (
    <div className="screen speakstudio">
      <div className="ss-header">
        <button className="btn-back" onClick={onBack}>← Terug</button>
        <div className="ss-title">{title}</div>
        <div className="ss-count">{index + 1}/{prompts.length}</div>
      </div>

      {!dutchVoice && (
        <div className="ss-voice-warn">
          🔊 <strong>Engelse uitspraak?</strong> Dit toestel heeft geen Nederlandse stem.
          Open de app in <strong>Microsoft Edge</strong> voor een echte Vlaamse stem (nl-BE) —
          werkt meteen, niets te installeren. Of installeer in Windows een
          <strong> Nederlands (België)</strong>-stem via Instellingen → Tijd &amp; taal → Spraak → Stemmen beheren.
        </div>
      )}

      <div className="ss-progress">
        <div className="ss-progress-fill" style={{ width: `${((index + 1) / prompts.length) * 100}%` }} />
      </div>

      <div className="ss-card">
        <div className="ss-card-top">
          <span className="ss-theme-chip">{prompt.theme}</span>
          {prompt.focus && <span className="ss-focus-chip">{prompt.focus}</span>}
          {done.has(index) && <span className="ss-done-chip">✓ geoefend</span>}
        </div>

        <div className="ss-prompt-label">Vraag / situatie</div>
        <div className="ss-prompt">{prompt.prompt}</div>

        <div className="ss-prompt-actions">
          <button className="ss-mini-btn" onClick={() => speak(prompt.prompt)}>🔊 Lees voor</button>
          {prompt.promptHint && (
            <button className="ss-mini-btn" onClick={() => setShowHint(h => !h)}>
              {showHint ? '🙈 Verberg' : '🇬🇧 Vertaling'}
            </button>
          )}
        </div>
        {showHint && prompt.promptHint && <div className="ss-hint">{prompt.promptHint}</div>}

        {/* ── RECORD STUDIO ─────────────────────────────── */}
        <div className="ss-studio">
          <div className="ss-studio-label">🎙️ Neem jezelf op</div>

          {recState === 'idle' && (
            <button className="ss-rec-btn" onClick={startRecording}>
              <span className="ss-rec-dot" /> Start opname
            </button>
          )}

          {recState === 'recording' && (
            <button className="ss-rec-btn ss-rec-btn--active" onClick={stopRecording}>
              <span className="ss-rec-pulse" /> Stop · {mm}:{ss}
            </button>
          )}

          {recState === 'recorded' && (
            <div className="ss-playback">
              <button className="ss-play-btn" onClick={playRecording}>▶︎ Speel mijn opname</button>
              <button className="ss-redo-btn" onClick={() => { resetRecording(); }}>↺ Opnieuw</button>
            </div>
          )}

          {micError && <div className="ss-mic-error">{micError}</div>}
        </div>

        {/* ── MODEL ANSWER ──────────────────────────────── */}
        {!showModel ? (
          <button className="ss-model-toggle" onClick={() => setShowModel(true)}>
            👀 Toon modelantwoord
          </button>
        ) : (
          <div className="ss-model">
            <div className="ss-model-label">Modelantwoord</div>
            <div className="ss-model-text">{prompt.model}</div>
            <div className="ss-model-actions">
              <button className="ss-mini-btn ss-mini-btn--accent" onClick={() => speak(prompt.model)}>🔊 Beluister</button>
            </div>
            {prompt.modelHint && <div className="ss-model-hint">{prompt.modelHint}</div>}
          </div>
        )}
      </div>

      <div className="ss-nav">
        <button className="ss-nav-btn" onClick={() => go(-1)} disabled={index === 0}>← Vorige</button>
        <button className="ss-nav-btn ss-nav-btn--done" onClick={markDone}>
          {index === prompts.length - 1 ? 'Klaar ✓' : 'Volgende →'}
        </button>
      </div>
    </div>
  );
}
