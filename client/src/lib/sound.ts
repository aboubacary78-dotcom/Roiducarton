/*
 * Effets sonores du jeu, entièrement générés par code (Web Audio API).
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
 * Voix propre à chaque ESPÈCE d'ennemi, déduite de son emoji (et de son nom
 * pour les humains). Renvoie null si on ne connaît pas : on retombe alors sur
 * la famille générique du pattern de projectiles.
 */
function speciesVoice(emoji?: string, name?: string): (() => void) | null {
  switch (emoji) {
    case '🦅': // mouette : deux criaillements rauques qui descendent
      return () => { [2100, 1750].forEach((f, i) => setTimeout(() => { tone(f, 0.16, 'sawtooth', 0.05, f * 0.45); }, i * 210)); };
    case '🐦': // pigeon : roucoulement doux et bête
      return () => { [420, 360, 330].forEach((f, i) => setTimeout(() => tone(f, 0.17, 'sine', 0.06, f * 0.82), i * 150)); };
    case '🐦‍⬛': // corbeau : croassement râpeux, trois fois
      return () => { [0, 190, 380].forEach((d) => setTimeout(() => { tone(320, 0.13, 'sawtooth', 0.06, 210); noise(0.09, 0.04, 900); }, d)); };
    case '🦆': // canard : coin-coin nasillard
      return () => { [0, 160, 320].forEach((d) => setTimeout(() => tone(560, 0.11, 'square', 0.05, 430), d)); };
    case '🪿': // oie : klaxon agressif, plus grave
      return () => { [0, 230].forEach((d) => setTimeout(() => { tone(300, 0.22, 'square', 0.07, 240); noise(0.06, 0.03, 700); }, d)); };
    case '🦢': // cygne : long sifflement menaçant + battement d'ailes
      return () => { noise(0.42, 0.05, 2600); setTimeout(() => { noise(0.12, 0.06, 300); noise(0.12, 0.05, 300); }, 380); };
    case '🐓': // coq : cocorico qui monte puis casse
      return () => { tone(620, 0.16, 'square', 0.055, 880); setTimeout(() => tone(880, 0.14, 'square', 0.05), 170); setTimeout(() => tone(700, 0.26, 'sawtooth', 0.05, 420), 320); };
    case '🐱': case '😾': case '🐈': // chat : miaulement qui vire au feulement
      return () => { tone(700, 0.26, 'sawtooth', 0.05, 1050); setTimeout(() => noise(0.34, 0.05, 3000), 260); };
    case '🐕': // chien : deux aboiements secs puis grondement
      return () => { [0, 190].forEach((d) => setTimeout(() => { tone(280, 0.09, 'square', 0.08, 150); noise(0.07, 0.06, 500); }, d)); setTimeout(() => tone(110, 0.34, 'sawtooth', 0.06, 80), 380); };
    case '🐀': // rat : couinements suraigus et rapides
      return () => { [0, 90, 180].forEach((d, i) => setTimeout(() => tone(2500 + i * 250, 0.06, 'square', 0.035, 1900), d)); };
    case '🐿️': // écureuil : mitraillette de petits cris
      return () => { for (let i = 0; i < 5; i++) setTimeout(() => tone(2000 + Math.random() * 700, 0.04, 'square', 0.03), i * 65); };
    case '🦝': // raton laveur : trille grognon
      return () => { [0, 120, 240].forEach((d, i) => setTimeout(() => tone(520 - i * 60, 0.12, 'sawtooth', 0.05, 700), d)); };
    case '🤡': // clown : klaxon de nez + rire descendant, très inquiétant
      return () => { tone(420, 0.12, 'square', 0.08, 300); setTimeout(() => tone(300, 0.12, 'square', 0.07, 210), 130); [0, 1, 2, 3].forEach((i) => setTimeout(() => tone(700 - i * 90, 0.1, 'triangle', 0.05), 320 + i * 110)); };
    case '👮': case '🔦': // vigile / agent : coup de sifflet strident
      return () => { tone(2300, 0.3, 'square', 0.045, 2500); setTimeout(() => tone(2400, 0.18, 'square', 0.04), 340); };
    case '🦺': // vigile de choc : souffle lourd + cervicales qui craquent
      return () => { noise(0.3, 0.06, 200); tone(90, 0.5, 'sawtooth', 0.09, 62); setTimeout(() => { noise(0.04, 0.09, 1800); noise(0.04, 0.08, 1500); }, 420); };
    case '😡': // commerçant furieux : gueulante humaine
      return () => { tone(240, 0.3, 'sawtooth', 0.075, 380); setTimeout(() => tone(300, 0.22, 'sawtooth', 0.07, 200), 300); };
    case '🧔': // voyou : grognement sourd + craquement de doigts
      return () => { tone(130, 0.34, 'sawtooth', 0.07, 90); setTimeout(() => noise(0.05, 0.07, 1600), 320); };
    case '🍺': case '🍾': // ivrogne : bouteilles + rot, évidemment
      return () => { tone(1650, 0.06, 'triangle', 0.055); setTimeout(() => tone(1240, 0.08, 'triangle', 0.05), 85); setTimeout(() => tone(150, 0.34, 'sawtooth', 0.055, 75), 250); };
    default:
      // Humains non listés : on reconnaît quelques rôles au nom.
      if (name && /vigile|agent|s[ée]curit|polic/i.test(name)) return () => { tone(2300, 0.3, 'square', 0.045, 2500); };
      return null;
  }
}

/**
 * Cri de l'ennemi à son entrée en combat. On joue d'abord la voix propre à son
 * ESPÈCE (mouette, chat, clown, vigile…) ; à défaut, la famille générique
 * déduite de son pattern de projectiles.
 */
export function playEnemyCry(pattern: string, emoji?: string, name?: string): void {
  if (muted) return;
  const voice = speciesVoice(emoji, name);
  if (voice) { voice(); vibrate(35); return; }
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

/** Gong d'ouverture de bagarre : le combat s'enclenche. */
export function playFightStart(): void {
  if (muted) return;
  // Coup de gong : impact large + longue résonance grave.
  noise(0.25, 0.13, 200);
  tone(160, 0.9, 'sine', 0.11, 78);
  tone(240, 0.7, 'triangle', 0.06, 120);
  setTimeout(() => tone(320, 0.45, 'sine', 0.045, 190), 90);
  vibrate([0, 60, 40, 90]);
}

/** K.O. : l'adversaire s'écroule (impact sourd + chute + petite fanfare). */
export function playKO(): void {
  if (muted) return;
  // Le coup de grâce.
  noise(0.16, 0.18, 500);
  tone(120, 0.28, 'triangle', 0.16, 55);
  // La chute, lourde.
  setTimeout(() => { noise(0.22, 0.12, 160); tone(90, 0.4, 'sine', 0.12, 45); }, 170);
  // Les petites étoiles qui tournent.
  setTimeout(() => [1320, 1050, 1560].forEach((f, i) => setTimeout(() => tone(f, 0.1, 'triangle', 0.05), i * 80)), 430);
  vibrate([0, 80, 50, 120]);
}

/** Bricolage réussi : on scie, on visse, ça tient. */
export function playCraft(): void {
  if (muted) return;
  // Deux passes de scie/ponçage.
  noise(0.13, 0.05, 1400);
  setTimeout(() => noise(0.13, 0.05, 1200), 150);
  // Deux coups de marteau secs.
  setTimeout(() => { tone(210, 0.07, 'square', 0.07, 130); noise(0.05, 0.06, 900); }, 320);
  setTimeout(() => { tone(240, 0.07, 'square', 0.07, 150); noise(0.05, 0.06, 900); }, 440);
  // Ça marche !
  setTimeout(() => { tone(660, 0.12, 'triangle', 0.07); setTimeout(() => tone(880, 0.16, 'triangle', 0.07), 100); }, 580);
  vibrate([0, 25, 60, 25]);
}

/** Geste de partage / troc conclu avec une autre âme de la rue. */
export function playShare(): void {
  if (muted) return;
  // Deux notes chaudes, en tierce : la poignée de main.
  tone(440, 0.16, 'sine', 0.075);
  setTimeout(() => tone(554, 0.2, 'sine', 0.075), 90);
  setTimeout(() => tone(659, 0.26, 'sine', 0.06), 190);
}

/** Récit d'origine : vieux papier qu'on déplie, un peu solennel. */
export function playPaper(): void {
  if (muted) return;
  noise(0.18, 0.035, 2200);
  setTimeout(() => noise(0.14, 0.028, 1800), 160);
  setTimeout(() => tone(330, 0.5, 'sine', 0.045, 262), 260);
}

/** Vibration haptique (Android / app native). Sans effet si non supporté. */
export function vibrate(pattern: number | number[]): void {
  if (muted) return;
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch { /* silent */ }
}
