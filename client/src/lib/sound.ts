/*
 * Effets sonores du jeu — entièrement générés par code (Web Audio API).
 * Aucun fichier audio à télécharger : les sons sont synthétisés à la volée,
 * donc ça fonctionne hors-ligne et sans dépendance externe.
 *
 * Un réglage "muet" est mémorisé dans le localStorage (voir l'écran Options).
 */

const MUTE_KEY = 'roi-du-carton-muted';

let muted = (() => {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
})();

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Contexte partagé avec le module d'ambiances (lib/ambience.ts).
export function getAudio(): AudioContext | null {
  return audio();
}

export function isMuted(): boolean {
  return muted;
}

// Les ambiances continues doivent démarrer/s'arrêter quand on (dé)coupe le
// son : elles s'abonnent ici plutôt que d'interroger isMuted() en boucle.
const muteListeners: Array<(m: boolean) => void> = [];
export function onMuteChange(fn: (m: boolean) => void): void {
  muteListeners.push(fn);
}

export function setMuted(v: boolean): void {
  muted = v;
  try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch { /* silent */ }
  muteListeners.forEach(f => { try { f(v); } catch { /* silent */ } });
}

// Une note synthétisée avec enveloppe simple.
function tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Un bref souffle de bruit (impact). Le buffer est généré UNE fois puis
// réutilisé : ces sons partent en rafale (martèlement, taps), allouer un
// buffer neuf à chaque appel provoquait des saccades.
let noiseBuffer: AudioBuffer | null = null;
function noise(dur: number, gain: number, hp = 800) {
  const ac = audio();
  if (!ac) return;
  if (!noiseBuffer || noiseBuffer.sampleRate !== ac.sampleRate) {
    const frames = Math.floor(ac.sampleRate * 0.25);
    noiseBuffer = ac.createBuffer(1, frames, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const t0 = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = hp;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/** Coup normal porté : petit "thud" sourd + impact. */
export function playHit(): void {
  if (muted) return;
  tone(150, 0.13, 'triangle', 0.14, 70);
  noise(0.09, 0.09, 600);
}

/** Coup critique : impact plus vif et brillant. */
export function playCrit(): void {
  if (muted) return;
  noise(0.14, 0.16, 900);
  tone(320, 0.16, 'square', 0.1, 640);
  tone(180, 0.2, 'triangle', 0.14, 90);
  vibrate([0, 40, 30, 60]);
}

/** Le joueur encaisse un coup : tonalité descendante. */
export function playHurt(): void {
  if (muted) return;
  tone(300, 0.18, 'sawtooth', 0.08, 110);
}

/** Petite fanfare de victoire. */
export function playWin(): void {
  if (muted) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => setTimeout(() => tone(f, 0.16, 'triangle', 0.12), i * 90));
}

/** Petit clic d'interface (boutons d'action). */
export function playClick(): void {
  if (muted) return;
  tone(880, 0.045, 'triangle', 0.045);
}

/** Résultat positif : deux notes ascendantes. */
export function playSuccess(): void {
  if (muted) return;
  tone(523, 0.12, 'triangle', 0.09);
  setTimeout(() => tone(784, 0.16, 'triangle', 0.09), 110);
}

/** Résultat négatif : deux notes descendantes. */
export function playFail(): void {
  if (muted) return;
  tone(330, 0.14, 'triangle', 0.08);
  setTimeout(() => tone(220, 0.2, 'triangle', 0.08), 120);
}

/** Tintement de pièces : achat, gain d'argent. */
export function playCoin(): void {
  if (muted) return;
  tone(1180, 0.06, 'triangle', 0.08);
  setTimeout(() => tone(1560, 0.09, 'triangle', 0.07), 55);
}

/** Passage au jour suivant : cloche douce qui descend. */
export function playNextDay(): void {
  if (muted) return;
  tone(660, 0.18, 'sine', 0.09, 440);
  setTimeout(() => tone(440, 0.32, 'sine', 0.08, 300), 120);
}

/** Succès débloqué : petite cascade scintillante. */
export function playUnlock(): void {
  if (muted) return;
  const notes = [784, 988, 1319, 1568];
  notes.forEach((f, i) => setTimeout(() => tone(f, 0.14, 'triangle', 0.09), i * 70));
  vibrate([0, 30, 40, 30]);
}

/** Pas feutré sur la grille (mini-jeu de vol). */
export function playStep(): void {
  if (muted) return;
  tone(190, 0.03, 'sine', 0.05);
}

/** Alerte : repéré par un gardien (mini-jeu de vol). */
export function playSpotted(): void {
  if (muted) return;
  tone(440, 0.1, 'square', 0.08, 680);
  setTimeout(() => tone(440, 0.12, 'square', 0.08, 680), 130);
  vibrate(60);
}

/** Départ en voyage : petit souffle. */
export function playWhoosh(): void {
  if (muted) return;
  noise(0.32, 0.05, 400);
  tone(300, 0.28, 'sine', 0.05, 700);
}

/**
 * Cri de l'ennemi à son entrée en combat, selon sa silhouette (le « pattern »
 * de projectiles sert aussi de famille sonore) : criaillement d'oiseau,
 * feulement de chat, grognement de bête, clink d'ivrogne, grognement humain.
 */
export function playEnemyCry(pattern: string): void {
  if (muted) return;
  switch (pattern) {
    case 'bird': // criaillement : trois chirps stridents descendants
      [1900, 2300, 1500].forEach((f, i) => setTimeout(() => tone(f, 0.09, 'square', 0.045, f * 0.55), i * 95));
      break;
    case 'small': // feulement de chat : sirène râpeuse qui monte puis retombe
      tone(480, 0.4, 'sawtooth', 0.04, 950);
      setTimeout(() => tone(900, 0.3, 'sawtooth', 0.035, 380), 300);
      break;
    case 'beast': // grognement grave qui gronde, puis claquement sec
      tone(85, 0.5, 'sawtooth', 0.08, 65);
      setTimeout(() => tone(230, 0.1, 'square', 0.07, 130), 430);
      break;
    case 'drunk': // clink de bouteilles + rot grave, évidemment
      tone(1650, 0.06, 'triangle', 0.055);
      setTimeout(() => tone(1240, 0.08, 'triangle', 0.05), 85);
      setTimeout(() => tone(150, 0.3, 'sawtooth', 0.05, 80), 250);
      break;
    default: // brute : souffle + grognement humain sourd
      noise(0.2, 0.05, 300);
      tone(135, 0.32, 'sawtooth', 0.065, 85);
      break;
  }
  vibrate(35);
}

/** Vibration haptique (Android / app native). Sans effet si non supporté. */
export function vibrate(pattern: number | number[]): void {
  if (muted) return;
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch { /* silent */ }
}
