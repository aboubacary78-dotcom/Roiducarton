/*
 * Ambiances sonores continues, 100 % Web Audio, comme sound.ts (aucun
 * fichier à télécharger). Chaque ambiance est un petit orchestre procédural :
 * une nappe de fond (bruit filtré, bourdon) + des événements aléatoires
 * (pépiements, klaxons, clangs, annonces…) reprogrammés par minuterie.
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
 * d'autoplay), on s'arme sur le prochain toucher. La sourdine des Options
 * coupe/relance proprement (voir onMuteChange dans sound.ts).
 */
import { getAudio, isMuted, onMuteChange } from './sound';

export type AmbienceId = 'title' | 'parc' | 'centre-ville' | 'zone-industrielle' | 'gare' | 'marche';

type Stopper = () => void;

const MASTER_GAIN = 0.55; // les ambiances restent un lit sous les effets

let desired: AmbienceId | null = null;
let running: { id: AmbienceId; stop: Stopper } | null = null;
let gestureArmed = false;

export function setAmbience(id: AmbienceId | null): void {
  desired = id;
  sync();
}

function sync(): void {
  if (running && running.id === desired && !isMuted()) return;
  if (running) { running.stop(); running = null; }
  if (!desired || isMuted()) return;
  const ac = getAudio();
  if (!ac) return;
  if (ac.state !== 'running') { armGesture(); return; }
  const build = BUILDERS[desired];
  running = { id: desired, stop: build(ac) };
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

onMuteChange(() => sync());

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
  out.connect(ac.destination);
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

// Thème du titre : boucle douce-amère en la mineur, basse ronde + mélodie
// clairsemée piochée dans de petits motifs (jamais deux fois la même phrase).
function startTitle(ac: AudioContext): Stopper {
  const kit = makeKit(ac);
  // Chaleur « vinyle » sous la musique.
  bedNoise(kit, { type: 'lowpass', freq: 900, gain: 0.006, lfoRate: 0.09, lfoDepth: 0.4 });

  const BEAT = 0.75;                                   // ≈ 80 bpm
  const BASSES = [110, 87.31, 130.81, 98];             // A2, F2, C3, G2
  // Accords tenus sous la mélodie : Am, F, C, G. C'est eux qui donnent au
  // menu son côté « vraie musique » plutôt que simple nappe.
  const CHORDS: number[][] = [
    [220, 261.63, 329.63],                             // Am : A3 C4 E4
    [174.61, 220, 261.63],                             // F  : F3 A3 C4
    [261.63, 329.63, 392],                             // C  : C4 E4 G4
    [196, 246.94, 293.66],                             // G  : G3 B3 D4
  ];
  const MOTIFS: number[][] = [
    [440, 0, 523.25, 392],                             // A4 · C5 G4
    [329.63, 392, 440, 0],                             // E4 G4 A4 ·
    [523.25, 440, 392, 329.63],                        // C5 A4 G4 E4
    [440, 0, 0, 293.66],                               // A4 · · D4
    [0, 329.63, 261.63, 293.66],                       // · E4 C4 D4
    [659.25, 587.33, 523.25, 0],                       // E5 D5 C5 ·
  ];

  const schedulePhrase = () => {
    if (kit.stopped) return;
    // 4 mesures de 4 temps : basse + accord tenu, motif mélodique dessus,
    // et un petit battement de carton pour tenir le tempo.
    for (let bar = 0; bar < 4; bar++) {
      const delayBar = bar * 4 * BEAT * 1000;
      const bass = BASSES[bar];
      kit.timers.push(setTimeout(() => {
        if (kit.stopped) return;
        note(kit, bass, BEAT * 3.6, 'triangle', 0.062);
        // L'accord, très doux, en arrière-plan.
        CHORDS[bar].forEach((f, i) => note(kit, f, BEAT * 3.4, 'sine', 0.019 - i * 0.003));
      }, delayBar));
      // Battement discret sur les temps 1 et 3 (une caisse en carton, quoi).
      [0, 2].forEach((beat) => {
        kit.timers.push(setTimeout(() => {
          if (!kit.stopped) note(kit, beat === 0 ? 78 : 62, 0.1, 'sine', 0.05, 46);
        }, delayBar + beat * BEAT * 1000));
      });
      const motif = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
      motif.forEach((f, i) => {
        if (!f || Math.random() < 0.12) return;        // silences : la mélodie respire
        const at = delayBar + i * BEAT * 1000;
        kit.timers.push(setTimeout(() => { if (!kit.stopped) note(kit, f, BEAT * 0.9, 'sine', 0.055); }, at));
        // Écho léger à l'octave : ça remplit sans alourdir.
        kit.timers.push(setTimeout(() => { if (!kit.stopped) note(kit, f * 2, BEAT * 0.5, 'sine', 0.013); }, at + BEAT * 380));
      });
    }
    kit.timers.push(setTimeout(schedulePhrase, 16 * BEAT * 1000));
  };
  schedulePhrase();
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

const BUILDERS: Record<AmbienceId, (ac: AudioContext) => Stopper> = {
  'title': startTitle,
  'parc': startParc,
  'centre-ville': startCentreVille,
  'zone-industrielle': startZoneIndustrielle,
  'gare': startGare,
  'marche': startMarche,
};
