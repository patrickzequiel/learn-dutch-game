// Shared text-to-speech helper that selects the best Dutch voice available.
//
// Setting only `utterance.lang` is NOT enough: most browsers keep their default
// (often English) voice unless you explicitly assign a matching `voice` object.
// So we look up the installed voices and pick the best Dutch one, preferring
// Flemish (nl-BE) over Netherlands Dutch (nl-NL).
//
// Note: this can only use voices the browser actually exposes. Microsoft Edge
// ships free online Flemish neural voices (nl-BE) out of the box; Chrome and the
// embedded VS Code browser rely on voices installed in the OS. If no Dutch voice
// exists, the browser substitutes an English one — there is no reliable, free,
// purely client-side way to synthesize Dutch without an installed/online voice.

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesRequested = false;

function scoreVoice(v: SpeechSynthesisVoice): number {
  const lang = (v.lang || '').toLowerCase().replace('_', '-');
  const name = (v.name || '').toLowerCase();
  // Highest priority: explicit Belgian/Flemish Dutch.
  if (lang === 'nl-be') return 100;
  if (name.includes('vlaams') || name.includes('flemish') || name.includes('belg')) return 95;
  // Next: any other Dutch voice (Netherlands).
  if (lang === 'nl-nl' || lang === 'nl') return 60;
  if (lang.startsWith('nl')) return 55;
  if (name.includes('dutch') || name.includes('nederlands')) return 50;
  return 0;
}

function pickDutchVoice(): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = 0;
  for (const v of voices) {
    const s = scoreVoice(v);
    if (s > bestScore) { bestScore = s; best = v; }
  }
  return bestScore > 0 ? best : null;
}

function ensureVoiceLoaded() {
  if (cachedVoice || voicesRequested || !window.speechSynthesis) return;
  voicesRequested = true;
  cachedVoice = pickDutchVoice();
  // Voices often load asynchronously; refresh the cache when they arrive.
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoice = pickDutchVoice();
  });
}

// Warm up the voice list as soon as the module is imported.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  ensureVoiceLoaded();
}

/** True when a real Dutch voice is installed on this device. */
export function hasDutchVoice(): boolean {
  ensureVoiceLoaded();
  return (cachedVoice ?? pickDutchVoice()) != null;
}

/** Speak Dutch text using the best available Dutch voice (Flemish preferred). */
export function speakDutch(text: string, rate = 0.85) {
  if (!window.speechSynthesis) return;
  ensureVoiceLoaded();
  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(text);
  const voice = cachedVoice ?? pickDutchVoice();
  if (voice) {
    cachedVoice = voice;
    utt.voice = voice;
    utt.lang = voice.lang;
  } else {
    // No Dutch voice installed — request Flemish so a capable browser (Edge)
    // can still use an online Dutch voice instead of the default English one.
    utt.lang = 'nl-BE';
  }
  utt.rate = rate;
  window.speechSynthesis.speak(utt);
}
