/*
 * Effets sonores du jeu : quarante-neuf bruitages de foley, plus un repli
 * synthétisé pour chacun.
 *
 * Les fichiers sont la voix du jeu — du carton, du papier, des pièces dans un
 * gobelet — mais rien n'en dépend : si un fichier manque ou refuse de se
 * décoder, l'appelant retombe sur sa version fabriquée en Web Audio. Un pack
 * son livré à moitié s'active donc son par son, et le jeu ne devient jamais
 * muet.
 *
 * L'inventaire complet, avec l'intention de chaque son, est en bas de fichier.
 *
 * Un réglage « muet » est mémorisé dans le localStorage (voir l'écran Options).
 */

import { loadAudio, isKnownMissing, playBuffer } from './audioFiles';
import { haptic, hapticPattern } from './haptics';

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
  const ac = audio();
  if (ac) preloadGestures();
  return ac;
}

/*
 * Les gestes sont préchargés dès que le son se débloque.
 *
 * Ils pèsent 84 Ko à eux treize, et ce sont les plus entendus du jeu : sans
 * ça, le tout premier clic attendrait son téléchargement et se sentirait comme
 * une latence de l'interface. Les autres familles n'en ont pas besoin — un cri
 * d'ennemi ou un bruitage de rencontre a toujours une animation devant lui.
 */
const GESTURES = [
  'geste-clic-1', 'geste-clic-2', 'geste-clic-3',
  'geste-onglet-1', 'geste-onglet-2', 'geste-onglet-3',
  'geste-carte-1', 'geste-carte-2', 'geste-carte-3',
  'geste-pas-1', 'geste-pas-2', 'geste-pas-3',
  'geste-coup-1', 'geste-coup-2', 'geste-coup-3',
  'perte-rate-1', 'perte-rate-2', 'perte-rate-3',
  'geste-retour', 'geste-reglage', 'geste-coup-fort', 'geste-encaisse',
  'geste-gong', 'geste-bricole', 'geste-succes', 'geste-troc',
];
let gesturesAsked = false;
function preloadGestures(): void {
  if (gesturesAsked) return;
  gesturesAsked = true;
  for (const g of GESTURES) loadAudio(`/audio/${g}.mp3`);
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
function playHitSynth(): void {
  if (muted) return;
  tone(150, 0.13, 'triangle', 0.14, 70);
  noise(0.09, 0.09, 600);
}

/** Coup critique : impact plus vif et brillant. */
function playCritSynth(): void {
  if (muted) return;
  noise(0.14, 0.16, 900);
  tone(320, 0.16, 'square', 0.1, 640);
  tone(180, 0.2, 'triangle', 0.14, 90);
  vibrate([0, 40, 30, 60]);
}

/** Le joueur encaisse un coup : tonalité descendante. */
function playHurtSynth(): void {
  if (muted) return;
  tone(300, 0.18, 'sawtooth', 0.08, 110);
}

/** Petite fanfare de victoire. */
function playWinSynth(): void {
  if (muted) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => setTimeout(() => tone(f, 0.16, 'triangle', 0.12), i * 90));
}

/** Petit clic d'interface (boutons d'action). */
function playClickSynth(): void {
  if (muted) return;
  tone(880, 0.045, 'triangle', 0.045);
}

/** Résultat positif : deux notes ascendantes. */
function playSuccessSynth(): void {
  if (muted) return;
  tone(523, 0.12, 'triangle', 0.09);
  setTimeout(() => tone(784, 0.16, 'triangle', 0.09), 110);
}

/** Résultat négatif : deux notes descendantes. */
function playFailSynth(): void {
  if (muted) return;
  tone(330, 0.14, 'triangle', 0.08);
  setTimeout(() => tone(220, 0.2, 'triangle', 0.08), 120);
}

/** Tintement de pièces : achat, gain d'argent. */
function playCoinSynth(): void {
  if (muted) return;
  tone(1180, 0.06, 'triangle', 0.08);
  setTimeout(() => tone(1560, 0.09, 'triangle', 0.07), 55);
}

/** Passage au jour suivant : cloche douce qui descend. */
function playNextDaySynth(): void {
  if (muted) return;
  tone(660, 0.18, 'sine', 0.09, 440);
  setTimeout(() => tone(440, 0.32, 'sine', 0.08, 300), 120);
}

/** Succès débloqué : petite cascade scintillante. */
function playUnlockSynth(): void {
  if (muted) return;
  const notes = [784, 988, 1319, 1568];
  notes.forEach((f, i) => setTimeout(() => tone(f, 0.14, 'triangle', 0.09), i * 70));
  vibrate([0, 30, 40, 30]);
}

/** Pas feutré sur la grille (mini-jeu de vol). */
function playStepSynth(): void {
  if (muted) return;
  tone(190, 0.03, 'sine', 0.05);
}

/** Alerte : repéré par un gardien (mini-jeu de vol). */
function playSpottedSynth(): void {
  if (muted) return;
  tone(440, 0.1, 'square', 0.08, 680);
  setTimeout(() => tone(440, 0.12, 'square', 0.08, 680), 130);
  vibrate(60);
}

/** Départ en voyage : petit souffle. */
function playWhooshSynth(): void {
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
/** Nom d'ennemi → nom de fichier. Même translittération que le brief du pack
 *  son 4 : minuscules, accents retirés, tout le reste en tirets. */
export function enemySlug(name: string): string {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Le cri de l'ennemi qui entre en scène.
 *
 * On tente d'abord SON fichier (pack son 4). S'il n'existe pas — c'est le cas
 * d'un roi hérité, qui porte le nom du personnage mort du joueur — on retombe
 * sur la synthèse par famille. Jamais les deux : le repli n'est déclenché que
 * lorsque le chargement a échoué.
 */
export function playEnemyCry(pattern: string, emoji?: string, name?: string): void {
  if (muted) return;
  if (name) {
    const file = `/audio/cry-${enemySlug(name)}.mp3`;
    if (!isKnownMissing(file)) {
      loadAudio(file).then(buf => {
        if (buf) playBuffer(buf, 0.85);
        else synthEnemyCry(pattern, emoji, name);
      });
      vibrate(35);
      return;
    }
  }
  synthEnemyCry(pattern, emoji, name);
}

/** Le cri de secours, synthétisé par famille (voir l'en-tête). */
function synthEnemyCry(pattern: string, emoji?: string, name?: string): void {
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


/*
 * LES MOMENTS ENREGISTRÉS (pack son 2)
 * ------------------------------------
 * Une poignée d'instants ont maintenant leur vrai bruitage. Le principe est
 * toujours le même : on tente le fichier, et la synthèse d'origine ne se
 * déclenche QUE s'il n'est pas là. Jamais les deux.
 *
 * `withFile` enveloppe donc une fonction existante sans la modifier : le repli
 * reste exactement le son que le jeu produisait avant, ligne pour ligne.
 */
/*
 * QUAND UN SON A-T-IL ÉTÉ JOUÉ POUR LA DERNIÈRE FOIS ?
 *
 * Sert au filet de sécurité posé sur les boutons (voir `installerClicParDefaut`)
 * : si un gestionnaire a déjà fait du bruit, le clic par défaut se tait pour ne
 * pas doubler le son.
 */
let marqueDernierSon = 0;
export function sonJoueRecemment(fenetreMs = 60): boolean {
  return typeof performance !== 'undefined' && performance.now() - marqueDernierSon < fenetreMs;
}
function noterSon(): void {
  if (typeof performance !== 'undefined') marqueDernierSon = performance.now();
}

function withFile(file: string, gain: number, fallback: () => void): () => void {
  return () => {
    if (muted) return;
    noterSon();
    const url = `/audio/${file}.mp3`;
    if (isKnownMissing(url)) { fallback(); return; }
    loadAudio(url).then(buf => { if (buf) playBuffer(buf, gain); else fallback(); });
  };
}

/** Gong d'ouverture de bagarre : le combat s'enclenche. */
function playFightStartSynth(): void {
  if (muted) return;
  // Coup de gong : impact large + longue résonance grave.
  noise(0.25, 0.13, 200);
  tone(160, 0.9, 'sine', 0.11, 78);
  tone(240, 0.7, 'triangle', 0.06, 120);
  setTimeout(() => tone(320, 0.45, 'sine', 0.045, 190), 90);
  vibrate([0, 60, 40, 90]);
}

/** Arrivée du Roi : cloches graves, fanfare menaçante, la rue retient son souffle. */
function playKingArrivalSynth(): void {
  if (muted) return;
  // Trois cloches d'église, lourdes et espacées.
  [0, 620, 1240].forEach((d) => setTimeout(() => {
    noise(0.3, 0.1, 150);
    tone(110, 1.4, 'sine', 0.13, 54);
    tone(165, 1.0, 'triangle', 0.07, 82);
  }, d));
  // Fanfare sinistre en mineur, qui monte.
  [1900, 2050, 2200, 2350].forEach((d, i) => setTimeout(() => tone([196, 233, 294, 349][i], 0.4, 'sawtooth', 0.075), d));
  // Grondement final : il est là.
  setTimeout(() => { noise(0.5, 0.08, 90); tone(70, 0.9, 'sawtooth', 0.11, 48); }, 2750);
  vibrate([0, 120, 90, 120, 90, 220]);
}

/** K.O. : l'adversaire s'écroule (impact sourd + chute + petite fanfare). */
function playKOSynth(): void {
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
function playCraftSynth(): void {
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
function playShareSynth(): void {
  if (muted) return;
  // Deux notes chaudes, en tierce : la poignée de main.
  tone(440, 0.16, 'sine', 0.075);
  setTimeout(() => tone(554, 0.2, 'sine', 0.075), 90);
  setTimeout(() => tone(659, 0.26, 'sine', 0.06), 190);
}

/** Récit d'origine : vieux papier qu'on déplie, un peu solennel. */
function playPaperSynth(): void {
  if (muted) return;
  noise(0.18, 0.035, 2200);
  setTimeout(() => noise(0.14, 0.028, 1800), 160);
  setTimeout(() => tone(330, 0.5, 'sine', 0.045, 262), 260);
}

/*
 * Vibration haptique. Déléguée à lib/haptics : elle a son propre réglage,
 * indépendant de la sourdine (couper le son est justement le moment où le
 * retour tactile devient le seul canal), et elle passe par le pont natif —
 * `navigator.vibrate` n'existe pas dans le WKWebView d'iOS.
 */
export function vibrate(pattern: number | number[]): void {
  if (typeof pattern === 'number') {
    haptic(pattern >= 90 ? 'heavy' : pattern >= 45 ? 'medium' : 'light');
  } else {
    hapticPattern(pattern);
  }
}
/* ═══════════════════════════════════════════════════════════════════════════
 * LES SONS DU JEU
 *
 * Quarante-neuf bruitages de foley, rangés en neuf familles. Chaque famille
 * suit une règle qui la rend reconnaissable sans qu'on y pense :
 *
 *   ① L'ARGENT  — ce qui entre et ce qui sort s'opposent à l'oreille.
 *   ② L'EFFORT  — que du frottement, jamais de percussion.
 *   ③ LE CORPS  — la seule famille percussive, donc lisible d'emblée.
 *   ④ LES AUTRES— rares, donc marquants.
 *   ⑤ LA PERTE  — plus c'est irréversible, plus le son est mou.
 *   ⑥ L'IDENTITÉ, ⑦ LE RYTHME DU JOUR, ⑧ L'INTERFACE, ⑨ LES JAUGES.
 *
 * Chaque son garde un repli synthétisé : si le fichier manque, on entend
 * quelque chose de sensé plutôt que rien.
 * ═══════════════════════════════════════════════════════════════════════════ */

/*
 * LES VARIANTES.
 *
 * Huit sons sont entendus des dizaines de fois par partie. Joués à l'identique
 * ils deviennent un métronome, et c'est ce métronome qui fait couper le son.
 * Chacun existe donc en trois prises, tirées au hasard — mais jamais deux fois
 * la même d'affilée, sinon la répétition qu'on cherchait à casser réapparaît
 * une fois sur trois.
 */
const dernierePrise = new Map<string, number>();

function withVariants(base: string, nb: number, gain: number, fallback: () => void): () => void {
  return () => {
    if (muted) return;
    noterSon();
    const avant = dernierePrise.get(base);
    let n = 1 + Math.floor(Math.random() * nb);
    if (n === avant) n = 1 + (n % nb);
    dernierePrise.set(base, n);

    const url = `/audio/${base}-${n}.mp3`;
    if (isKnownMissing(url)) { fallback(); return; }
    loadAudio(url).then(buf => { if (buf) playBuffer(buf, gain); else fallback(); });
  };
}

// ─── ① L'ARGENT ─────────────────────────────────────────────────────────────

/** 1 à 3 € : deux pièces au fond d'un gobelet. */
const playCoinSmall = withVariants('argent-piece-entree', 3, 0.85, playCoinSynth);
/** 4 à 15 € : une poignée versée d'un coup. */
const playCoinHandful = withFile('argent-poignee-entree', 0.85, playCoinSynth);
/** Plus de 15 € : des billets comptés au pouce. Un billet ne tinte jamais. */
const playCoinNotes = withFile('argent-liasse', 0.85, playCoinSynth);

/**
 * L'ARGENT QUI ENTRE. Le son dit combien, avant même que le chiffre s'affiche.
 *
 * Le jeu n'avait qu'un seul son de pièce pour toute somme, et il servait
 * aussi aux paiements : vendre son manteau et l'acheter s'entendaient pareil.
 */
export function playMoneyIn(montant = 1): void {
  if (montant > 15) playCoinNotes();
  else if (montant >= 4) playCoinHandful();
  else playCoinSmall();
}

/** L'ARGENT QUI SORT. Des pièces raclées sur un comptoir : timbre descendant. */
export const playMoneyOut = withFile('argent-sortie', 0.85, playCoinSynth);

/** La pièce attrapée au mini-jeu de la manche. */
export const playCoin = withFile('moment-piece', 0.85, playCoinSynth);

// ─── ② L'EFFORT ─────────────────────────────────────────────────────────────

/** Creuser d'un cran dans la benne. Du frottement — surtout pas un coup. */
export const playDig = withVariants('geste-fouille', 3, 0.8, playHitSynth);
/** Ramasser le butin : un objet décollé du carton. */
export const playPickUp = withFile('geste-ramasse', 0.8, playHitSynth);
/** Fabriquer à l'établi. */
export const playCraft = withFile('geste-bricole', 0.85, playCraftSynth);
/** Une trouvaille. Terne, pas cristallin : c'est de la récup', pas un trésor. */
export const playFind = withFile('moment-trouvaille', 0.85, playUnlockSynth);
/** Un objet bricolé qui cède dans la nuit. */
export const playWear = withFile('geste-usure', 0.8, playFailSynth);
/** Ouvrir le sac. */
export const playBag = withFile('geste-sac', 0.75, playClickSynth);
/** Le carton du matin qu'on décolle. Le silence final fait partie du son. */
export const playMorningBox = withFile('moment-carton-matin', 0.85, playPaperSynth);
/** Changer de quartier. Six pas, pas plus : le trajet coûte cher. */
export const playTravel = withFile('moment-trajet', 0.8, playStepSynth);

// ─── ③ LE CORPS ─────────────────────────────────────────────────────────────

/** Coup donné. */
export const playHit = withVariants('geste-coup', 3, 0.85, playHitSynth);
/** Coup critique. */
export const playCrit = withFile('geste-coup-fort', 0.9, playCritSynth);
/** Coup reçu — le son vient d'autour, pas de devant. */
export const playHurt = withFile('geste-encaisse', 0.9, playHurtSynth);
/** Un pas. */
export const playStep = withVariants('geste-pas', 3, 0.8, playStepSynth);
/** Mise hors combat. */
export const playKO = withFile('moment-ko', 0.9, playKOSynth);

// ─── ④ LES AUTRES ───────────────────────────────────────────────────────────

/** Partager à manger : le geste le plus digne du jeu. Le son est généreux. */
export const playGive = withFile('social-partage', 0.85, playShareSynth);
/** Serrer la main, conclure un troc. */
export const playHandshake = withFile('moment-poignee-main', 0.85, playShareSynth);
/** On vous éconduit, ou vous passez votre chemin. */
export const playTurnedAway = withFile('social-econduit', 0.85, playFailSynth);
/** Troquer un objet. */
export const playShare = withFile('geste-troc', 0.85, playShareSynth);

// ─── ⑤ LA PERTE ─────────────────────────────────────────────────────────────
// Une échelle à cinq degrés. Elle tient à une seule idée : plus la perte est
// irréversible, plus le son est MOU. L'échec léger claque, l'échec grave
// s'affaisse.

/** Degré 1 — le raté sans conséquence. Entendu cent fois : ne fait jamais sursauter. */
export const playMiss = withVariants('perte-rate', 3, 0.75, playFailSynth);
/** Degré 2 — repéré. Le moment où quelqu'un a levé la tête. */
export const playSpotted = withFile('moment-attrape', 0.9, playSpottedSynth);
/** Degré 3 — l'écroulement. Le petit rebond final fait toute la blague. */
export const playCollapse = withFile('moment-craquement', 0.9, playFailSynth);
/** Degré 4 — l'humiliation. Aucun impact, que de l'arrachement. */
export const playDignityLoss = withFile('perte-dignite', 0.9, playFailSynth);
/** Degré 5 — un palier de Dignité franchi. La signature de la chute. */
export const playDignityTier = withFile('perte-palier', 0.95, playFailSynth);

// ─── ⑥ L'IDENTITÉ ───────────────────────────────────────────────────────────

/** Choisir son personnage : le geste de l'état civil, sec et définitif. */
export const playPickCharacter = withFile('moment-choix-perso', 0.85, playPaperSynth);
/** Relancer le trio de personnages. */
export const playReroll = withFile('moment-relance', 0.8, playPaperSynth);
/** Choisir ce qu'on lègue au suivant. */
export const playBequeath = withFile('moment-legs', 0.85, playPaperSynth);
/** Ouvrir le Registre ou le Cimetière. */
export const playLedger = withFile('moment-registre', 0.85, playPaperSynth);
/** Une fin de mort découverte : le son de la collection qui avance. */
export const playNewEnding = withFile('moment-fin-inedite', 0.9, playUnlockSynth);
/** La mort. Un son trop petit pour l'événement — c'est là qu'est la comédie. */
export const playDeath = withFile('moment-mort', 0.95, playFailSynth);
/** Sacré Roi du Carton. */
export const playKingArrival = withFile('moment-sacre', 0.9, playKingArrivalSynth);
/** Une page de texte s'ouvre. Doit passer inaperçu. */
export const playPage = withFile('moment-page', 0.75, playPaperSynth);

// ─── ⑦ LE RYTHME DU JOUR ────────────────────────────────────────────────────

/** Le réveil, à l'ouverture du bilan de nuit. */
export const playWakeUp = withFile('moment-reveil', 0.8, playPaperSynth);
/** Le jour nouveau : le seul son du jeu qui a le droit d'être large. */
export const playNextDay = withFile('moment-jour-nouveau', 0.8, playNextDaySynth);
/** Victoire en combat. */
export const playWin = withFile('moment-victoire', 0.85, playWinSynth);
/** Début de combat : un métal creux et fêlé, jamais un gong de studio. */
export const playFightStart = withFile('geste-gong', 0.9, playFightStartSynth);
/** Un souvenir, un fantôme du cimetière. */
export const playMemory = withFile('moment-souvenir', 0.85, playUnlockSynth);
/** Un événement tourne bien. Le pendant de playMiss : même petitesse, sens inverse. */
export const playGoodOutcome = withFile('moment-resultat-bon', 0.85, playSuccessSynth);

// ─── ⑧ L'INTERFACE ──────────────────────────────────────────────────────────
// Elle doit disparaître : que du carton manipulé. Et surtout pas le même clic
// pour toucher « Voler » et pour changer d'onglet.

/** Toucher une action : le son le plus entendu du jeu. */
export const playClick = withVariants('geste-clic', 3, 0.7, playClickSynth);
/** Retour, fermer. Plus grave que le clic d'action. */
export const playBack = withFile('geste-retour', 0.7, playClickSynth);
/** Changer d'onglet, sélectionner sur la carte. */
export const playTab = withVariants('geste-onglet', 3, 0.65, playClickSynth);
/** Basculer un réglage. */
export const playToggle = withFile('geste-reglage', 0.7, playClickSynth);
/** Changement d'écran. Remplace le « woosh », qui disparaît du jeu. */
export const playCard = withVariants('geste-carte', 3, 0.7, playWhooshSynth);
/** Succès débloqué. Un coup, net, et c'est tout. */
export const playUnlock = withFile('geste-succes', 0.85, playUnlockSynth);

// ─── ⑨ LES JAUGES ───────────────────────────────────────────────────────────
// Le jeu demande de surveiller six jauges et n'en signalait aucune à l'oreille.

/**
 * Une jauge passe sous 25.
 *
 * Ne se rejoue pas tant qu'on n'est pas remonté au-dessus : sinon c'est une
 * alarme qui sonne à chaque action, et le joueur coupe le son. La mémoire est
 * portée par jauge, et remise à zéro dès que la valeur repasse le seuil.
 */
const SEUIL_ALERTE = 25;
const jaugesEnAlerte = new Set<string>();
const playGaugeLowFile = withFile('jauge-rouge', 0.85, playFailSynth);

export function playGaugeLow(jauge: string, valeur: number): void {
  if (valeur >= SEUIL_ALERTE) { jaugesEnAlerte.delete(jauge); return; }
  if (jaugesEnAlerte.has(jauge)) return;
  jaugesEnAlerte.add(jauge);
  playGaugeLowFile();
}

/** Repartir de zéro : un nouveau personnage n'hérite pas des alertes du défunt. */
export function resetGaugeAlerts(): void {
  jaugesEnAlerte.clear();
}

/** Manger, boire, se soigner. */
export const playGaugeFilled = withFile('jauge-remplie', 0.85, playSuccessSynth);


/* ═══════════════════════════════════════════════════════════════════════════
 * LE FILET : AUCUN APPUI NE DOIT ÊTRE MUET.
 *
 * Le jeu compte plus de cent vingt boutons. Les brancher un par un laisse
 * forcément des trous — l'audit en comptait 77 sans son — et chaque bouton
 * ajouté plus tard rouvre le problème.
 *
 * On écoute donc les clics au niveau du document, APRÈS les gestionnaires de
 * React : si le geste a déjà fait du bruit, on ne fait rien ; sinon on joue le
 * clic. Le son juste, posé explicitement, gagne toujours ; le filet ne sert
 * qu'à ce qu'il n'y ait jamais de silence.
 *
 * Trois exceptions, marquées dans le HTML par `data-sans-son` : les boutons
 * dont le silence est voulu, ceux qui sont désactivés, et ceux qui coupent le
 * son — claquer au moment où l'on demande le silence serait une farce.
 * ═══════════════════════════════════════════════════════════════════════════ */
let clicInstalle = false;

export function installerClicParDefaut(): void {
  if (typeof document === 'undefined') return;
  // Le filet se pose une fois pour toutes. Sans ce verrou, un remontage de la
  // page (changement de route, mode strict de React) empilerait un second
  // écouteur sur le même document et chaque appui claquerait deux fois.
  if (clicInstalle) return;
  clicInstalle = true;
  document.addEventListener('click', (e) => {
    if (muted) return;
    const cible = (e.target as HTMLElement | null)?.closest?.('button, [role="button"]') as HTMLElement | null;
    if (!cible) return;
    if (cible.hasAttribute('disabled') || cible.getAttribute('aria-disabled') === 'true') return;
    if (cible.closest('[data-sans-son]')) return;
    if (sonJoueRecemment()) return;
    playClick();
  });
}
