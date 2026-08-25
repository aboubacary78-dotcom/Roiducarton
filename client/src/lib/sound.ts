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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * QUAND ON QUITTE LE JEU, LE JEU SE TAIT.
 *
 * Constaté sur téléphone : en passant l'application en arrière-plan, la boucle
 * d'ambiance du quartier continuait de tourner. Le navigateur ne coupe rien
 * tout seul, et la vue web d'une application native encore moins — elle reste
 * vivante tant que le système ne la tue pas. On se retrouvait donc avec le
 * marché ou la gare qui bruissaient par-dessus la musique de quelqu'un.
 *
 * Tout le son du jeu passe par CE contexte-ci : ambiances, boucles météo,
 * bruitages, gestes, tout. Le suspendre les arrête donc d'un bloc, sans avoir
 * à tenir la liste de ce qui joue — et le reprendre les relance là où ils en
 * étaient, ce qui est exactement le comportement attendu quand on revient.
 *
 * `pageEnVeille` sert de verrou : `audio()` réveille le contexte à chaque
 * appel, et sans lui le moindre son programmé par une minuterie relancerait
 * tout depuis l'arrière-plan.
 * ═══════════════════════════════════════════════════════════════════════════
 */
let pageEnVeille = false;

// Le garde porte sur `addEventListener`, pas sur `document` : les tests hors
// navigateur fournissent un document minimal, qui existe sans savoir écouter.
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('visibilitychange', () => {
    pageEnVeille = document.visibilityState === 'hidden';
    if (!ctx) return;
    try {
      if (pageEnVeille) ctx.suspend().catch(() => { /* silent */ });
      else if (!muted) ctx.resume().catch(() => { /* silent */ });
    } catch { /* silent */ }
  });
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    // On ne réveille jamais le son d'une application qu'on a quittée.
    if (ctx.state === 'suspended' && !pageEnVeille) ctx.resume();
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

/* ═══════════════════════════════════════════════════════════════════════════
 * ⑩ LA VOIX — LE SEUL SON QUI SORT D'UN CORPS
 *
 * Tout le reste du jeu est du carton manipulé : c'est la règle, et elle tient.
 * Mais il manquait ce qu'un corps fait entendre malgré lui — la grimace quand
 * on se coupe, le haut-le-cœur devant ce qu'on vient de sortir du tas, le
 * souffle qu'on lâche en frappant.
 *
 * DEUX PRINCIPES.
 *
 *   1. AUCUN MOT, JAMAIS. Ce sont des souffles, des sifflements entre les
 *      dents, des grognements. Un mot enregistré vieillit en trois écoutes,
 *      demanderait deux langues, et casserait le carton. Un « tsss » ne se
 *      traduit pas : c'est précisément pour ça qu'il tient.
 *
 *   2. LA VOIX SUIT LE PERSONNAGE. On joue un homme ou une femme, tiré au
 *      hasard à chaque partie, et entendre le mauvais timbre annule tout le
 *      travail que le jeu fait pour qu'on s'attache à ce personnage-là. Le
 *      genre est posé une fois (`reglerVoix`) et vaut jusqu'à la mort.
 *
 * Le repli reste muet plutôt que synthétisé : une voix humaine fabriquée à
 * l'oscillateur ne ressemble à rien d'autre qu'à une erreur, et le geste qui
 * l'accompagne (coup, écroulement, alerte) a déjà son propre son.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Genre = 'm' | 'f';
let genreVoix: Genre = 'm';

/** Fixe le timbre du personnage courant. Appelée à chaque changement de vie. */
export function reglerVoix(g: Genre | undefined): void {
  if (g === 'm' || g === 'f') genreVoix = g;
}

const muet = () => { /* pas de repli : une voix synthétisée sonnerait faux */ };

/**
 * Une réaction du personnage, dans son timbre. `h` et `f` dans les noms de
 * fichiers : le dossier reste lisible d'un coup d'œil.
 */
function voix(quoi: string, nb: number, gain: number, repli: () => void = muet): () => void {
  const prises: Record<Genre, () => void> = {
    m: withVariants(`voix-h-${quoi}`, nb, gain, repli),
    f: withVariants(`voix-f-${quoi}`, nb, gain, repli),
  };
  return () => prises[genreVoix]();
}

/** On se coupe, une guêpe pique, un coup passe. Bref et rentré. */
export const playVoixDouleur = voix('douleur', 3, 0.8);
/** Ce qu'on vient de toucher au fond du tas. Le haut-le-cœur, pas le vomi. */
export const playVoixDegout = voix('degout', 3, 0.8);
/** L'effort qui sort tout seul en frappant ou en soulevant. */
export const playVoixEffort = voix('effort', 3, 0.7);

/*
 * LA VOIX NE SE SUPERPOSE PAS À ELLE-MÊME.
 *
 * Un combat enchaîne les coups, et la Récup' peut réveiller deux saletés d'un
 * même mouvement de doigt. Deux grimaces qui se chevauchent ne font pas un
 * personnage qui souffre deux fois : elles font une voix cassée, et on entend
 * l'échantillon au lieu du personnage.
 */
const ECART_VOIX_MS = 700;
let derniereVoix = 0;

export function playVoix(quoi: 'douleur' | 'degout' | 'effort'): void {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (now - derniereVoix < ECART_VOIX_MS) return;
  derniereVoix = now;
  if (quoi === 'douleur') playVoixDouleur();
  else if (quoi === 'degout') playVoixDegout();
  else playVoixEffort();
}

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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LE CORPS PARLE, ET IL DIT LAQUELLE.
 *
 * Le franchissement sonnait, mais toutes les jauges du même son : le joueur
 * savait que quelque chose allait mal, jamais quoi. Or son œil est sur le
 * bouton d'action, pas sur les jauges — l'écran fait dix centimètres et le
 * pouce en masque le tiers. Un son générique l'oblige à chercher ; un
 * gargouillis lui dit « mange » sans qu'il ait rien à lire.
 *
 * Le froid va à la santé, faute de jauge de température : claquement de dents
 * et souffle mal assuré, c'est un corps à sa limite quelle que soit la cause.
 *
 * LE MENTAL EN A UNE, MAINTENANT, ET C'EST UN REVIREMENT ASSUMÉ. Il n'en avait
 * pas, au motif qu'il ne se soigne pas d'un geste : c'était vrai tant qu'il ne
 * faisait que descendre. Depuis que la tête qui part brouille le texte des
 * rencontres (lib/charabia), le joueur VOIT quelque chose d'anormal sans
 * savoir d'où ça vient — et il peut y remédier, en dormant. Un symptôme
 * visible plus un remède connu, c'est exactement la définition d'une jauge qui
 * mérite sa voix. Sans elle, le brouillage passe pour un bug d'affichage.
 *
 * Ce n'est pas un cri : c'est une respiration qui s'emballe et un acouphène
 * très bas. La dignité, elle, garde l'alerte neutre — elle ne se répare par
 * aucun geste, et lui prêter un corps serait un contresens.
 * ═══════════════════════════════════════════════════════════════════════════
 */
/*
 * ⚠️ COUPÉES POUR L'INSTANT — ET VOICI POURQUOI, PARCE QUE ÇA COMPTE.
 *
 * Testées au casque sur téléphone, ces cinq prises-là sont inaudibles : « un
 * cri bouillie », mot pour mot. Vérifié de mon côté : le débit est bon (64
 * kbit/s, au-dessus de ce que la commande demandait), les durées sont courtes
 * (0,4 à 0,8 s), le niveau est juste. Ce ne sont donc pas les fichiers qui
 * sont mal encodés — ce sont les PRISES qui ne valent rien, et aucun réglage
 * ne rattrape ça.
 *
 * LE MOTIF EST NET, ET IL EXPLIQUE POURQUOI SEULES CELLES-CI DÉRANGENT.
 *
 * Les autres voix du même lot — douleur, dégoût, effort, les passants — jouent
 * DERRIÈRE quelque chose : le rat qui détale, le verre qui craque, la pièce
 * qui tombe. Elles sont masquées, et le masque leur pardonne tout. Ces cinq-ci
 * jouent SEULES, dans le silence du hub, comme unique signal. On les entend
 * donc parfaitement — assez pour entendre qu'elles sont mauvaises.
 *
 * Elles retombent sur `jauge-rouge`, le signal de foley qui servait avant que
 * j'y touche et dont personne ne s'est jamais plaint. On perd de dire LAQUELLE
 * des jauges lâche ; on gagne de ne plus faire couper le son au joueur.
 *
 * ET LA VRAIE LEÇON EST AILLEURS. Tout ce jeu tient sur une règle : la bande-
 * son est du carton manipulé. Un gargouillis d'estomac, une déglutition à sec,
 * un bâillement, un claquement de dents sont du FOLEY — on les fabrique avec
 * une bouteille d'eau et une boîte à chaussures. J'ai demandé des voix, et
 * j'ai obtenu des voix de synthèse. La faute est dans la commande, pas dans la
 * livraison : ces quatre signaux n'avaient jamais rien à faire dans une
 * cabine. Ils repasseront en foley (voir la note de commande à venir).
 *
 * Pour les rallumer quand de meilleures prises arriveront : remettre les
 * `withFile(...)` ci-dessous à la place de `playGaugeLowFile`.
 */
const VOIX_DU_CORPS: Record<string, () => void> = {
  hunger: playGaugeLowFile,   // withFile('corps-faim', 0.85, playFailSynth)
  thirst: playGaugeLowFile,   // withFile('corps-soif', 0.85, playFailSynth)
  sleep: playGaugeLowFile,    // withFile('corps-epuise', 0.85, playFailSynth)
  health: playGaugeLowFile,   // withFile('corps-froid', 0.85, playFailSynth)
  mental: playGaugeLowFile,   // voix('tete', 2, 0.85, playGaugeLowFile)
};

/*
 * ET IL INSISTE QUAND LA FIN APPROCHE.
 *
 * Ne sonner qu'au franchissement évitait l'alarme, et c'était juste : une
 * alerte qui se rejoue à chaque action se fait couper. Mais entre 24 et 1, le
 * jeu redevenait muet — on mourait donc en silence, et une mort silencieuse
 * passe pour une injustice alors qu'elle était lisible dans les chiffres.
 *
 * Sous 10, le corps se rappelle donc au souvenir toutes les vingt secondes.
 * Pas plus vite : à ce rythme on ne peut pas confondre ça avec une alarme, et
 * une partie tient rarement plus de deux ou trois rappels avant qu'on
 * réagisse — ou qu'on meure en sachant pourquoi.
 */
const SEUIL_CRITIQUE = 10;
const RAPPEL_MS = 20000;
const dernierRappel = new Map<string, number>();

export function playGaugeLow(jauge: string, valeur: number): void {
  const voix = VOIX_DU_CORPS[jauge] ?? playGaugeLowFile;

  if (valeur >= SEUIL_ALERTE) {
    jaugesEnAlerte.delete(jauge);
    dernierRappel.delete(jauge);
    return;
  }

  if (!jaugesEnAlerte.has(jauge)) {
    jaugesEnAlerte.add(jauge);
    dernierRappel.set(jauge, Date.now());
    voix();
    return;
  }

  if (valeur > SEUIL_CRITIQUE) return;
  const depuis = Date.now() - (dernierRappel.get(jauge) ?? 0);
  if (depuis < RAPPEL_MS) return;
  dernierRappel.set(jauge, Date.now());
  voix();
}

/** Repartir de zéro : un nouveau personnage n'hérite pas des alertes du défunt. */
export function resetGaugeAlerts(): void {
  jaugesEnAlerte.clear();
  dernierRappel.clear();
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ⑩ LA TENSION — CE QUI MONTE PENDANT QU'ON JOUE
 *
 * Trois mécaniques centrales montaient en tension SANS UN BRUIT : la jauge
 * d'alerte du casse, le risque de la Récup', le minuteur de la manche. On
 * regardait une barre se remplir en silence, et l'échec tombait d'un coup.
 *
 * Ces sons-là ne ponctuent pas un geste du joueur : ils annoncent ce que le
 * jeu s'apprête à lui faire. C'est la moitié de la bande-son qui manquait.
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Le casse franchit un palier d'alerte : méfiance, alerte, bouclage.
 *
 * Trois sons distincts et non trois fois le même de plus en plus fort — le
 * joueur doit savoir OÙ il en est sans regarder la barre, et le troisième
 * porte le rideau métallique au loin qui dit que c'est fini.
 */
const PALIERS_ALERTE = [
  withFile('tension-alerte-1', 0.8, playSpottedSynth),
  withFile('tension-alerte-2', 0.85, playSpottedSynth),
  withFile('tension-alerte-3', 0.9, playSpottedSynth),
];

export function playTensionPalier(palier: number): void {
  const son = PALIERS_ALERTE[Math.min(Math.max(palier, 1), 3) - 1];
  son?.();
}

/**
 * Le tas de la Récup' qui bouge : un cran de risque de plus.
 *
 * Volontairement discret. Ce son se rejoue plusieurs fois par partie et son
 * rôle est d'inquiéter, jamais de faire sursauter — un joueur qui sursaute
 * lâche la manette et perd pour la mauvaise raison.
 */
export const playTensionRisque = withFile('tension-risque', 0.55, () => { /* muet avant livraison */ });

/**
 * Un tic du compte à rebours de la manche.
 *
 * Le fichier ne contient QU'UN tic : c'est l'appelant qui le répète, de plus
 * en plus vite. Livrer la séquence entière aurait figé le tempo, alors qu'il
 * dépend du temps qui reste.
 */
export const playTensionTic = withFile('tension-compte', 0.6, () => { /* muet avant livraison */ });

/* ═══════════════════════════════════════════════════════════════════════════
 * CE QU'ON RÉVEILLE AU FOND DU TAS
 *
 * La Récup' cache six saletés, et toutes sonnaient pareil : un `playHurt`,
 * c'est-à-dire un coup encaissé. Un rat qui détale et un yaourt devenu
 * autonome ne font pourtant PAS le même bruit, et surtout ils ne font pas le
 * même effet — l'un fait sursauter, l'autre soulève le cœur. Le joueur a le
 * doigt sur la grille et l'œil sur la case qu'il vient d'ouvrir : l'oreille
 * est le canal le plus rapide pour lui dire ce qu'il a touché.
 *
 * Chaque saleté est donc un couple : la CHOSE, puis la RÉACTION du personnage
 * juste derrière. La chose n'est pas genrée — un rat est un rat ; la réaction
 * l'est toujours, c'est le corps qu'on joue qui répond.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Le rat qui détale sous la tôle. Griffes, puis métal qui tremble. */
const playRecupRat = withVariants('recup-rat', 3, 0.85, playHurtSynth);
/** Le nid. Occupé. Un bourdonnement qui monte d'un coup. */
const playRecupGuepes = withFile('recup-guepes', 0.85, playHurtSynth);
/** Le tesson : verre qui craque sous la paume. */
const playRecupVerre = withFile('recup-verre', 0.85, playHurtSynth);
/** Ce qui est mou, tiède, et qui cède. Le son le plus désagréable du jeu. */
const playRecupPourri = withVariants('recup-pourri', 3, 0.8, playHurtSynth);

/** Ce que fait chaque saleté : la chose, et ce que le corps répond. */
const SALETES: Record<string, { chose: () => void; reaction?: 'douleur' | 'degout' }> = {
  'rat': { chose: playRecupRat },
  'guepes': { chose: playRecupGuepes, reaction: 'douleur' },
  'verre-casse': { chose: playRecupVerre, reaction: 'douleur' },
  'poisson': { chose: playRecupPourri, reaction: 'degout' },
  'couche': { chose: playRecupPourri, reaction: 'degout' },
  'yaourt': { chose: playRecupPourri, reaction: 'degout' },
};

/** La saleté qu'on vient de réveiller, avec la tête que fait le personnage. */
export function playSaleteRecup(id: string): void {
  const s = SALETES[id];
  if (!s) { playHurt(); return; }
  s.chose();
  // Le décalage compte : la réaction ARRIVE APRÈS la cause. Jouées ensemble,
  // les deux se lisent comme un seul bruitage confus, et le rat perd sa gifle.
  if (s.reaction) setTimeout(() => playVoix(s.reaction!), 180);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LES PASSANTS QU'ON RETIENT TROP LONGTEMPS
 *
 * La manche a une seule décision : lâcher, ou insister. Insister rapporte
 * davantage et coûte de la dignité — et jusqu'ici cette bascule ne s'entendait
 * pas. L'anneau devenait rouge, c'est tout, et le joueur regardait l'anneau
 * plutôt que la rue.
 *
 * Le passant grogne donc pendant qu'on le retient, de plus en plus mal, puis
 * se braque. Sa voix est la SIENNE : le genre vient du passant, pas du joueur,
 * et c'est la seule voix du jeu qui ne suive pas le personnage.
 * ═══════════════════════════════════════════════════════════════════════════ */

const AGACE: Record<Genre, () => void> = {
  m: withVariants('passant-h-agace', 3, 0.7, muet),
  f: withVariants('passant-f-agace', 3, 0.7, muet),
};
const REFUS: Record<Genre, () => void> = {
  m: withVariants('passant-h-refus', 3, 0.85, playFailSynth),
  f: withVariants('passant-f-refus', 3, 0.85, playFailSynth),
};

/** Il commence à trouver le temps long. */
export function playPassantAgace(g: Genre): void { AGACE[g](); }
/** Sa patience est finie : « lâchez-moi ». */
export function playPassantRefus(g: Genre): void { REFUS[g](); }

/* ═══════════════════════════════════════════════════════════════════════════
 * LE MÊME GESTE NE SONNE PAS PAREIL SELON L'ENDROIT
 *
 * Mendier au parc, c'est deux pièces remuées lentement devant des promeneurs ;
 * mendier en ville, c'est secouer vite et entendre les pas continuer sans
 * ralentir. Le geste est le même, la situation ne l'est pas — et c'est
 * exactement ce qu'un jeu sur la rue doit faire entendre.
 *
 * Quinze combinaisons sont enregistrées, pas les trente possibles : on a écrit
 * celles qui racontent quelque chose. Quand il n'y en a pas pour le couple
 * (geste, quartier), il ne se passe rien de plus — le son générique de
 * l'action a déjà été joué, et cette couche-ci ne fait que l'habiller.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Abrégés des quartiers, tels qu'ils apparaissent dans les noms de fichiers. */
const CODE_LIEU: Record<string, string> = {
  'parc': 'parc',
  'centre-ville': 'cv',
  'gare': 'gare',
  'marche': 'marche',
  'zone-industrielle': 'zi',
};

export type GesteDeLieu = 'dormir' | 'mendier' | 'voler' | 'fouiller' | 'recup' | 'marchander';

export function playActionLieu(geste: GesteDeLieu, lieu: string | undefined): void {
  if (muted || !lieu) return;
  const code = CODE_LIEU[lieu];
  if (!code) return;
  const url = `/audio/act-${geste}-${code}.mp3`;
  // Silencieux si la combinaison n'a pas été écrite : c'est le cas normal.
  if (isKnownMissing(url)) return;
  loadAudio(url).then(buf => { if (buf) playBuffer(buf, 0.8); });
}

/* ─── LA RONDE ───────────────────────────────────────────────────────────
 * Trois signaux livrés en plus de la commande, et le jeu avait exactement
 * trois moments pour eux : la ronde qu'on sent venir, celle qui passe, et
 * celle qui vous cueille. La manche se jouait jusqu'ici à l'œil seul, et le
 * policier arrive par le bord de l'écran — c'est-à-dire là où le joueur ne
 * regarde pas, puisqu'il suit un passant du doigt.
 */

/** Le nez sensible sent la ronde arriver. Se joue AVANT qu'elle entre. */
export const playPoliceApproche = withFile('police-approche', 0.7, () => { /* muet avant livraison */ });
/** La ronde traverse : mains dans les poches. */
export const playPolicePresence = withFile('police-presence', 0.75, () => { /* muet avant livraison */ });
/** Elle vous a vu la main tendue. */
export const playPoliceIntervention = withFile('police-intervention', 0.85, playSpottedSynth);

/* ─── ⑪ LE COMBAT — ce qui se joue AVANT le coup ────────────────────────── */

/** L'ennemi prend son élan. Se joue avant l'attaque, pour qu'on puisse réagir. */
export const playCombatCharge = withFile('combat-charge', 0.8, () => { /* muet avant livraison */ });
/** Un coup qui frôle. */
export const playCombatEsquive = withFile('combat-esquive', 0.7, () => { /* muet avant livraison */ });
/** Zéro coup encaissé : le silence de l'impact EST la récompense. */
export const playCombatEsquiveParfaite = withFile('combat-esquive-parfaite', 0.85, () => { /* muet avant livraison */ });

/* ─── ⑫ LES OBJETS ──────────────────────────────────────────────────────── */

/** S'équiper : tissu et boucle de ceinture. */
export const playObjetEquipe = withFile('objet-equipe', 0.8, playSuccessSynth);
/** Un objet perdu pour de bon. Sec — c'est fini, pas triste. */
export const playObjetCasse = withFile('objet-casse', 0.85, playFailSynth);
/** Le sac est plein, on refuse l'objet. */
export const playObjetPlein = withFile('objet-plein', 0.75, playFailSynth);

/* ─── ⑬ L'INTERFACE ─────────────────────────────────────────────────────── */

/** Bonne nouvelle. Deux fois plus discret que le clic d'action. */
export const playToastBon = withFile('ui-toast-bon', 0.5, () => { /* muet avant livraison */ });
/** Mauvaise nouvelle. Même geste, matière molle. */
export const playToastMauvais = withFile('ui-toast-mauvais', 0.5, () => { /* muet avant livraison */ });
/** Action indisponible : le loquet qui refuse. */
export const playVerrou = withFile('ui-verrou', 0.6, () => { /* muet avant livraison */ });

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
    /*
     * UN BOUTON DÉSACTIVÉ NE SE TAIT PLUS : IL REFUSE.
     *
     * Le filet passait son chemin, et l'appui restait sans réponse — ce qui se
     * lit comme une interface qui n'a pas entendu, pas comme une action
     * interdite. Le joueur réappuie, plus fort, puis croit à un bug. Le loquet
     * qui résiste dit « non » en un dixième de seconde, et il le dit sans
     * ouvrir de fenêtre par-dessus le jeu.
     */
    if (cible.hasAttribute('disabled') || cible.getAttribute('aria-disabled') === 'true') {
      playVerrou();
      return;
    }
    if (cible.closest('[data-sans-son]')) return;
    if (sonJoueRecemment()) return;
    playClick();
  });
}
