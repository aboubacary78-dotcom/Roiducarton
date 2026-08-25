/*
 * Ambiances sonores continues.
 *
 * Deux moteurs, dans cet ordre :
 *
 *   1. LES FICHIERS. Depuis le pack son 1, chaque quartier a sa vraie boucle
 *      enregistrée (`/audio/amb-<lieu>.mp3`), et le ciel sa couche par-dessus
 *      (`/audio/meteo-<temps>.mp3`). C'est ce qu'on entend normalement.
 *   2. LA SYNTHÈSE. Si un fichier manque ou ne se décode pas, on retombe sur
 *      le petit orchestre procédural d'origine — une nappe de bruit filtré
 *      plus des événements reprogrammés par minuterie. Le jeu n'est donc
 *      jamais muet, et un pack livré à moitié s'active fichier par fichier,
 *      exactement comme les images.
 *
 * Le thème de l'écran-titre ('title') reste synthétisé : il plaît tel quel,
 * on n'y touche pas.
 *
 *  - 'title'            : le thème musical du jeu (boucle douce-amère).
 *  - 'parc'             : brise + oiseaux + roucoulements.
 *  - 'centre-ville'     : rumeur de trafic + voitures qui passent + klaxons.
 *  - 'zone-industrielle': bourdon de machines + vapeur + clangs métalliques.
 *  - 'gare'             : halle qui résonne + carillon d'annonce + trains.
 *  - 'marche'           : brouhaha de foule + appels de marchands + clochettes.
 *
 * setAmbience(id | null) mémorise le souhait et le réalise dès que possible :
 * si le navigateur bloque l'audio avant le premier geste (politique
 * d'autoplay), on s'arme sur le prochain toucher. setWeatherLayer(type | null)
 * pose la couche météo, indépendamment du quartier. La sourdine des Options
 * coupe/relance proprement (voir onMuteChange dans sound.ts).
 */
import { getAudio, isMuted, onMuteChange, sortieFond } from './sound';
import { loadAudio, startLoop, type Loop } from './audioFiles';

export type AmbienceId = 'title' | 'parc' | 'centre-ville' | 'zone-industrielle' | 'gare' | 'marche'
  // Lits de mini-jeu (pack son 2). Ils n'ont pas de repli synthétisé : avant
  // eux, ces écrans étaient simplement silencieux, et c'est donc là qu'on
  // retombe si le fichier manque.
  | 'mg-bagarre' | 'mg-esquive' | 'mg-casse' | 'mg-manche' | 'mg-recup' | 'mg-marchandage'
  /*
   * La musique de mort. Comme les lits de mini-jeu, elle n'a pas de repli
   * synthétisé : tant que le fichier n'est pas livré, l'écran de fin reste
   * silencieux comme avant, et la musique s'active toute seule le jour où le
   * fichier arrive.
   */
  | 'mort';

type Stopper = () => void;

const MASTER_GAIN = 0.55;   // les ambiances restent un lit sous les effets
const MINIGAME_GAIN = 0.34; // un lit de mini-jeu passe encore plus bas : la
                            // tension doit venir des effets, pas du fond
const MORT_GAIN = 0.30;     // la musique de mort accompagne, elle ne commente pas

let desired: AmbienceId | null = null;
let running: { id: AmbienceId; stop: Stopper } | null = null;
// Boucle jouée depuis un vrai fichier (prioritaire sur la synthèse).
let fileLoop: { id: AmbienceId; loop: Loop } | null = null;
let gestureArmed = false;

export function setAmbience(id: AmbienceId | null): void {
  desired = id;
  sync();
}

// ---- Couche météo ---------------------------------------------------------
// Elle se pose PAR-DESSUS le quartier : il peut pleuvoir au parc comme à la
// gare. Seuls les temps qui s'entendent ont une couche — un ciel dégagé ou
// nuageux ne fait pas de bruit.
export type WeatherLayerId = 'pluie' | 'orage' | 'neige' | 'brouillard' | 'canicule';

const WEATHER_FILE: Record<string, WeatherLayerId> = {
  rainy: 'pluie', storm: 'orage', snow: 'neige', fog: 'brouillard', heatwave: 'canicule',
};

/** Traduit le temps du jeu en couche sonore (null = un ciel silencieux). */
export function weatherLayerFor(weather: string): WeatherLayerId | null {
  return WEATHER_FILE[weather] ?? null;
}

let desiredWeather: WeatherLayerId | null = null;
let weatherLoop: { id: WeatherLayerId; loop: Loop } | null = null;

export function setWeatherLayer(id: WeatherLayerId | null): void {
  desiredWeather = id;
  syncWeather();
}

function syncWeather(): void {
  // Pas de météo par-dessus un mini-jeu : ses écrans ont leur propre lit, et
  // superposer la pluie brouillerait la lecture.
  const inGame = !!desired && !desired.startsWith('mg-') && desired !== 'title';
  const want = isMuted() || !inGame ? null : desiredWeather;
  if (weatherLoop && weatherLoop.id === want) return;
  if (weatherLoop) { weatherLoop.loop.stop(1.4); weatherLoop = null; }
  if (!want) return;
  const ac = getAudio();
  if (!ac || ac.state !== 'running') { armGesture(); return; }
  const id = want;
  loadAudio(`/audio/meteo-${id}.mp3`).then(buf => {
    // Le temps a pu changer pendant le décodage.
    if (!buf || desiredWeather !== id || isMuted() || !desired) return;
    if (weatherLoop) weatherLoop.loop.stop(0.4);
    const loop = startLoop(buf, WEATHER_GAIN, 2.5);
    if (loop) weatherLoop = { id, loop };
  });
}

const WEATHER_GAIN = 0.42;  // la couche météo reste sous le lit du quartier

/* ═══════════════════════════════════════════════════════════════════════════
 * LA SIGNATURE DU QUARTIER ET SES RESPIRATIONS — RETIRÉES
 *
 * CE QUE C'ÉTAIT. Deux couches posées par-dessus le lit `amb-<lieu>` :
 *
 *   · `amb-sig-<lieu>` : une SECONDE boucle continue par quartier, à 0,38 ;
 *   · `vie-*` : dix sons ponctuels — pigeon qui décolle, klaxon, tôle, rat,
 *     cagette, papier kraft — tirés au hasard toutes les 22 à 48 secondes,
 *     à 0,42.
 *
 * CE QUE JE VOULAIS. Les cinq lits se ressemblent : on ne reconnaît pas la
 * gare du marché en fermant les yeux. Je cherchais du caractère par des
 * événements, en pariant que « dans un endroit, il arrive des choses qu'on n'a
 * pas demandées ».
 *
 * POURQUOI C'ÉTAIT FAUX. Ce pari est vrai au cinéma et faux dans un jeu.
 * Ailleurs dans « Le Roi du Carton », TOUT son a une cause visible : on
 * touche, ça répond. Un grattement qui tombe seul, sur un hub immobile, n'est
 * donc pas lu comme de l'atmosphère — il est lu comme un bug, et c'est le
 * retour qui est arrivé : « des grattements, des bruits bizarres ».
 *
 * Et la couche continue posait un second problème, silencieux celui-là : trois
 * boucles tournaient en même temps dans le hub — quartier 0,55 + signature
 * 0,38 + météo 0,42, soit 1,35 de somme. C'est ça, le fond trop fort.
 *
 * LES VINGT FICHIERS RESTENT dans `client/public/audio/`. Ils ne coûtent rien
 * tant qu'aucun code ne les demande, et les remettre est un `git revert` de ce
 * commit. Voir docs/design/couches-sonores-hub.md.
 * ═══════════════════════════════════════════════════════════════════════════ */

function sync(): void {
  const ac = getAudio();
  const want = isMuted() ? null : desired;

  // Rien à faire si on joue déjà ce qu'il faut.
  if (running && running.id === want) { syncWeather(); return; }
  if (fileLoop && fileLoop.id === want) { syncWeather(); return; }

  if (running) { running.stop(); running = null; }
  if (fileLoop) { fileLoop.loop.stop(1.0); fileLoop = null; }
  if (!want) { syncWeather(); return; }
  if (!ac) return;
  if (ac.state !== 'running') { armGesture(); return; }

  // Le thème du titre reste synthétisé : il plaît tel quel.
  if (want === 'title') { running = { id: want, stop: BUILDERS[want]!(ac) }; syncWeather(); return; }

  // Les lits de mini-jeu : le fichier ou rien. Ils sont plus discrets que les
  // quartiers — on joue par-dessus, la tension vient des effets.
  if (want.startsWith('mg-')) {
    loadAudio(`/audio/${want}.mp3`).then(buf => {
      if (desired !== want || isMuted() || fileLoop || running) return;
      if (!buf) return;
      const loop = startLoop(buf, MINIGAME_GAIN, 1.8);
      if (loop) fileLoop = { id: want, loop };
    });
    syncWeather();
    return;
  }

  /*
   * La musique de mort. Elle entre LENTEMENT — quatre secondes de fondu — parce
   * qu'elle arrive derrière la résonance du carton qui s'affaisse : surgir
   * couperait le seul silence que le jeu s'accorde. Elle reste basse, sous les
   * sons du bilan qu'on va lire par-dessus.
   */
  if (want === 'mort') {
    loadAudio('/audio/musique-mort.mp3').then(buf => {
      if (desired !== want || isMuted() || fileLoop || running) return;
      if (!buf) return;
      const loop = startLoop(buf, MORT_GAIN, 4);
      if (loop) fileLoop = { id: want, loop };
    });
    syncWeather();
    return;
  }

  // On tente le vrai fichier ; s'il n'est pas là, la synthèse prend le relais.
  loadAudio(`/audio/amb-${want}.mp3`).then(buf => {
    if (desired !== want || isMuted()) return;        // le joueur a bougé entre-temps
    if (running || fileLoop) return;                  // quelqu'un a déjà démarré
    if (buf) {
      const loop = startLoop(buf, MASTER_GAIN, 1.6);
      if (loop) { fileLoop = { id: want, loop }; syncWeather(); return; }
    }
    const ac2 = getAudio();
    if (!ac2 || ac2.state !== 'running') return;
    const build = BUILDERS[want];
    if (build) running = { id: want, stop: build(ac2) };
    syncWeather();
  });
}

// Autoplay : tant que l'utilisateur n'a pas touché l'écran, le contexte est
// suspendu, on démarre l'ambiance au premier geste.
function armGesture(): void {
  if (gestureArmed || typeof window === 'undefined') return;
  gestureArmed = true;
  // On écoute PLUSIEURS types de gestes (et sur la phase de capture) : le
  // premier contact déverrouille le son avant même que le bouton ne réagisse,
  // pour que le thème du menu se fasse entendre au lieu d'être manqué.
  const EVENTS = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'] as const;
  const kick = () => {
    gestureArmed = false;
    EVENTS.forEach((e) => window.removeEventListener(e, kick, true));
    const ac = getAudio();
    if (ac && ac.state === 'suspended') {
      ac.resume().then(sync).catch(() => { /* silent */ });
    } else {
      sync();
    }
  };
  EVENTS.forEach((e) => window.addEventListener(e, kick, { capture: true }));
}

onMuteChange(() => { sync(); syncWeather(); });

/* ------------------------------------------------------------------ */
/* Boîte à outils commune                                              */
/* ------------------------------------------------------------------ */

interface Kit {
  ac: AudioContext;
  out: GainNode;                       // master de l'ambiance (fondu de sortie)
  timers: ReturnType<typeof setTimeout>[];
  nodes: AudioNode[];                  // à déconnecter à l'arrêt
  stopped: boolean;
}

function makeKit(ac: AudioContext): Kit {
  const out = ac.createGain();
  out.gain.setValueAtTime(0.0001, ac.currentTime);
  out.gain.exponentialRampToValueAtTime(MASTER_GAIN, ac.currentTime + 1.2); // fondu d'entrée
  out.connect(sortieFond(ac));
  return { ac, out, timers: [], nodes: [out], stopped: false };
}

function kitStopper(kit: Kit): Stopper {
  return () => {
    kit.stopped = true;
    kit.timers.forEach(clearTimeout);
    const t = kit.ac.currentTime;
    try {
      kit.out.gain.cancelScheduledValues(t);
      kit.out.gain.setValueAtTime(Math.max(0.0001, kit.out.gain.value), t);
      kit.out.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); // fondu de sortie
    } catch { /* silent */ }
    setTimeout(() => kit.nodes.forEach(n => { try { n.disconnect(); } catch { /* silent */ } }), 700);
  };
}

// Boucle de bruit filtré (la « nappe » de fond), avec LFO optionnel sur le
// volume pour donner de la respiration (brise, houle de foule…).
function bedNoise(kit: Kit, opts: { type: BiquadFilterType; freq: number; q?: number; gain: number; lfoRate?: number; lfoDepth?: number }): void {
  const { ac, out } = kit;
  const frames = Math.floor(ac.sampleRate * 2);
  const buf = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = opts.type;
  filter.frequency.value = opts.freq;
  if (opts.q) filter.Q.value = opts.q;
  const g = ac.createGain();
  g.gain.value = opts.gain;
  src.connect(filter).connect(g).connect(out);
  src.start();
  kit.nodes.push(src, filter, g);
  if (opts.lfoRate) {
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = opts.lfoRate;
    lfoGain.gain.value = opts.gain * (opts.lfoDepth ?? 0.5);
    lfo.connect(lfoGain).connect(g.gain);
    lfo.start();
    kit.nodes.push(lfo, lfoGain);
  }
}

// Bourdon continu (oscillateur filtré) : machines, ronron urbain.
function drone(kit: Kit, freq: number, type: OscillatorType, gain: number, lowpass = 400): void {
  const { ac, out } = kit;
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;
  const g = ac.createGain();
  g.gain.value = gain;
  osc.connect(filter).connect(g).connect(out);
  osc.start();
  kit.nodes.push(osc, filter, g);
}

// Note ponctuelle routée dans le master de l'ambiance (pas dans destination :
// ainsi le fondu de sortie emporte aussi les événements en cours).
function note(kit: Kit, freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number): void {
  const { ac, out } = kit;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

// Souffle ponctuel (train qui passe, vapeur, voiture) : bruit filtré avec
// montée/descente de volume sur `dur` secondes.
function swell(kit: Kit, dur: number, gain: number, filterFreq: number, type: BiquadFilterType = 'lowpass'): void {
  const { ac, out } = kit;
  const frames = Math.floor(ac.sampleRate * Math.min(dur, 4));
  const buf = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = filterFreq;
  const g = ac.createGain();
  const t0 = ac.currentTime;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.45);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(out);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

// Reprogramme `fn` à intervalles aléatoires [min, max] ms tant que l'ambiance vit.
function every(kit: Kit, minMs: number, maxMs: number, fn: () => void): void {
  const tick = () => {
    if (kit.stopped) return;
    fn();
    kit.timers.push(setTimeout(tick, minMs + Math.random() * (maxMs - minMs)));
  };
  kit.timers.push(setTimeout(tick, Math.random() * maxMs));
}

/* ------------------------------------------------------------------ */
/* Les ambiances                                                       */
/* ------------------------------------------------------------------ */

// ============ LE THÈME DU JEU ============
// Une VRAIE chanson, pas une nappe : valse musette en la mineur, façon
// guinguette parisienne un peu bancale. Doux, nostalgique, et juste assez
// pataud pour faire sourire — c'est un roi en carton, après tout.
//
// Structure : 8 mesures à 3 temps (oum-pah-pah), jouées deux fois. La reprise
// ajoute une voix à l'octave et une petite glissade comique en fin de phrase.
const T = {
  // mélodie
  A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
  G5: 783.99, GS5: 830.61, A5: 880, C6: 1046.5,
  // accompagnement
  A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, GS4: 415.30,
  // basses
  A2: 110, D3: 146.83, E3: 164.81, F2: 87.31,
};

// Une mesure = une basse (temps 1), deux plaquages d'accord (temps 2 et 3),
// et les notes de la mélodie repérées en temps (0, 1, 2 ou demi-temps).
interface Bar { bass: number; chord: number[]; mel: [number, number, number][]; }

const THEME: Bar[] = [
  // Am — « il était une fois un type sur un carton »
  { bass: T.A2, chord: [T.A3, T.C4, T.E4], mel: [[T.A4, 0, 0.9], [T.C5, 1, 0.9], [T.E5, 2, 0.9]] },
  { bass: T.A2, chord: [T.A3, T.C4, T.E4], mel: [[T.D5, 0, 0.9], [T.C5, 1, 0.45], [T.B4, 1.5, 0.45], [T.C5, 2, 0.9]] },
  // Dm — la phrase s'ouvre
  { bass: T.D3, chord: [T.D4, T.F4, T.A4], mel: [[T.D5, 0, 0.9], [T.F5, 1, 0.9], [T.A5, 2, 0.9]] },
  // E7 — tension
  { bass: T.E3, chord: [T.E4, T.GS4, T.D5], mel: [[T.GS5, 0, 0.9], [T.E5, 1, 0.9], [T.B4, 2, 0.9]] },
  // Am — retour au thème
  { bass: T.A2, chord: [T.A3, T.C4, T.E4], mel: [[T.A4, 0, 0.9], [T.C5, 1, 0.9], [T.E5, 2, 0.9]] },
  // F — le moment tendre
  { bass: T.F2, chord: [T.C4, T.F4, T.A4], mel: [[T.F5, 0, 0.9], [T.E5, 1, 0.9], [T.D5, 2, 0.9]] },
  // E7 — on redescend
  { bass: T.E3, chord: [T.E4, T.GS4, T.D5], mel: [[T.E5, 0, 0.9], [T.D5, 1, 0.45], [T.C5, 1.5, 0.45], [T.B4, 2, 0.9]] },
  // Am — la chute (tenue)
  { bass: T.A2, chord: [T.A3, T.C4, T.E4], mel: [[T.A4, 0, 2.4]] },
];

function startTitle(ac: AudioContext): Stopper {
  const kit = makeKit(ac);
  // Chaleur « vinyle » sous la musique.
  bedNoise(kit, { type: 'lowpass', freq: 900, gain: 0.006, lfoRate: 0.09, lfoDepth: 0.4 });

  const BEAT = 0.42;                 // ≈ 143 bpm à 3 temps : une valse qui trotte
  const BAR = BEAT * 3;
  const at = (ms: number, fn: () => void) => {
    kit.timers.push(setTimeout(() => { if (!kit.stopped) fn(); }, ms));
  };

  const playRound = (offset: number, second: boolean) => {
    THEME.forEach((bar, i) => {
      const t0 = offset + i * BAR * 1000;
      // OUM : la basse, ronde, sur le premier temps.
      at(t0, () => note(kit, bar.bass, BEAT * 1.5, 'triangle', 0.075));
      // PAH-PAH : l'accord plaqué, court, sur les temps 2 et 3.
      [1, 2].forEach((beat) => {
        at(t0 + beat * BEAT * 1000, () => {
          bar.chord.forEach((f, k) => note(kit, f, BEAT * 0.42, 'triangle', 0.026 - k * 0.005));
        });
      });
      // La mélodie, en notes piquées (façon accordéon pincé).
      bar.mel.forEach(([f, beat, dur]) => {
        const tm = t0 + beat * BEAT * 1000;
        at(tm, () => {
          note(kit, f, BEAT * dur, 'sine', 0.062);
          note(kit, f * 2, BEAT * dur * 0.5, 'sine', 0.011);   // brillance
        });
        // Reprise : une tierce au-dessus, l'air se remplit.
        if (second) at(tm + 18, () => note(kit, f * 1.5, BEAT * dur * 0.8, 'sine', 0.02));
      });
    });
    // Le gag : en fin de reprise, la valse « glisse » et retombe, pataude.
    if (second) {
      const tEnd = offset + 7.4 * BAR * 1000;
      at(tEnd, () => note(kit, T.A4, 0.55, 'triangle', 0.05, T.A4 / 2.02));
      at(tEnd + 260, () => note(kit, T.A2, 0.3, 'sine', 0.045, 78));
    }
  };

  const loop = () => {
    if (kit.stopped) return;
    playRound(0, false);
    playRound(8 * BAR * 1000, true);
    kit.timers.push(setTimeout(loop, 16 * BAR * 1000));
  };
  loop();
  return kitStopper(kit);
}

// Parc : brise dans les feuilles, pépiements, roucoulement de pigeon.
function startParc(ac: AudioContext): Stopper {
  const kit = makeKit(ac);
  bedNoise(kit, { type: 'lowpass', freq: 380, gain: 0.014, lfoRate: 0.07, lfoDepth: 0.6 });
  every(kit, 900, 3200, () => {
    // Un pépiement = 2 à 4 mini-notes très aiguës qui glissent.
    const n = 2 + Math.floor(Math.random() * 3);
    const base = 2300 + Math.random() * 1700;
    for (let i = 0; i < n; i++) {
      kit.timers.push(setTimeout(() => {
        if (!kit.stopped) note(kit, base * (0.9 + Math.random() * 0.25), 0.05 + Math.random() * 0.07, 'sine', 0.02, base * (0.75 + Math.random() * 0.5));
      }, i * (70 + Math.random() * 60)));
    }
  });
  every(kit, 7000, 16000, () => {
    // Roucoulement : deux notes graves et rondes qui tremblotent.
    note(kit, 310, 0.22, 'triangle', 0.02, 260);
    kit.timers.push(setTimeout(() => { if (!kit.stopped) note(kit, 280, 0.3, 'triangle', 0.018, 240); }, 240));
  });
  return kitStopper(kit);
}

// Centre-ville : rumeur de trafic, voitures qui passent, klaxons lointains.
function startCentreVille(ac: AudioContext): Stopper {
  const kit = makeKit(ac);
  bedNoise(kit, { type: 'lowpass', freq: 170, gain: 0.02, lfoRate: 0.05, lfoDepth: 0.35 });
  every(kit, 4000, 9000, () => swell(kit, 2.4 + Math.random() * 1.4, 0.016, 300 + Math.random() * 250));
  every(kit, 9000, 22000, () => {
    // Klaxon à deux tons, poli mais agacé.
    note(kit, 330, 0.22, 'triangle', 0.016);
    kit.timers.push(setTimeout(() => { if (!kit.stopped) note(kit, 262, 0.3, 'triangle', 0.015); }, 210));
  });
  return kitStopper(kit);
}

// Zone industrielle : bourdon de machines, vapeur, clangs métalliques.
function startZoneIndustrielle(ac: AudioContext): Stopper {
  const kit = makeKit(ac);
  drone(kit, 55, 'sawtooth', 0.012, 260);
  drone(kit, 110.7, 'sawtooth', 0.007, 320);           // léger désaccord : ça « bat »
  bedNoise(kit, { type: 'highpass', freq: 2800, gain: 0.005, lfoRate: 0.12, lfoDepth: 0.7 });
  every(kit, 3000, 8000, () => {
    // Clang : ping métallique + son claquant filtré.
    note(kit, 820 + Math.random() * 300, 0.28, 'triangle', 0.02, 640);
    swell(kit, 0.18, 0.02, 1400, 'bandpass');
  });
  every(kit, 12000, 26000, () => swell(kit, 1.6, 0.012, 3400, 'highpass')); // jet de vapeur
  return kitStopper(kit);
}

// Gare : grande halle qui résonne, carillon d'annonce, train qui passe.
function startGare(ac: AudioContext): Stopper {
  const kit = makeKit(ac);
  bedNoise(kit, { type: 'lowpass', freq: 130, gain: 0.016, lfoRate: 0.04, lfoDepth: 0.4 });
  bedNoise(kit, { type: 'bandpass', freq: 500, q: 0.6, gain: 0.006, lfoRate: 0.9, lfoDepth: 0.4 }); // voix diffuses
  every(kit, 12000, 26000, () => {
    // Carillon d'annonce (le fameux « ding-dong-dong »).
    [660, 550, 440].forEach((f, i) => {
      kit.timers.push(setTimeout(() => { if (!kit.stopped) note(kit, f, 0.5, 'sine', 0.02); }, i * 320));
    });
  });
  every(kit, 16000, 34000, () => swell(kit, 3.8, 0.022, 700)); // un train passe
  return kitStopper(kit);
}

// Marché : brouhaha de foule, appels de marchands, clochette.
function startMarche(ac: AudioContext): Stopper {
  const kit = makeKit(ac);
  bedNoise(kit, { type: 'bandpass', freq: 420, q: 0.7, gain: 0.017, lfoRate: 2.6, lfoDepth: 0.3 });
  bedNoise(kit, { type: 'lowpass', freq: 220, gain: 0.01, lfoRate: 0.06, lfoDepth: 0.4 });
  every(kit, 2200, 6000, () => {
    // « Appel » de marchand : deux syllabes étouffées, hauteur aléatoire.
    const f = 280 + Math.random() * 220;
    note(kit, f, 0.14, 'triangle', 0.014, f * 1.25);
    kit.timers.push(setTimeout(() => { if (!kit.stopped) note(kit, f * 0.85, 0.18, 'triangle', 0.013, f * 0.7); }, 160));
  });
  every(kit, 9000, 20000, () => {
    // Clochette de caisse / balance.
    note(kit, 1560, 0.12, 'triangle', 0.014);
    kit.timers.push(setTimeout(() => { if (!kit.stopped) note(kit, 1180, 0.14, 'triangle', 0.012); }, 110));
  });
  return kitStopper(kit);
}

// Partiel à dessein : les lits de mini-jeu n'ont pas de version synthétisée.
// Avant le pack son 2 ces écrans étaient silencieux, et c'est très bien ainsi
// — mieux vaut le silence qu'un ersatz.
const BUILDERS: Partial<Record<AmbienceId, (ac: AudioContext) => Stopper>> = {
  'title': startTitle,
  'parc': startParc,
  'centre-ville': startCentreVille,
  'zone-industrielle': startZoneIndustrielle,
  'gare': startGare,
  'marche': startMarche,
};
