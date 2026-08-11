/*
 * LECTURE DE FICHIERS AUDIO — le pendant sonore de SafeImg.
 *
 * Le jeu a toujours su fabriquer ses sons tout seul (voir ambience.ts et
 * sound.ts, entièrement en Web Audio). On lui ajoute ici la possibilité de
 * jouer de VRAIS fichiers, sans jamais rendre le jeu dépendant de leur
 * présence : si un fichier manque ou refuse de se décoder, l'appelant reçoit
 * `null` et retombe sur sa version synthétisée. Un pack son livré à moitié
 * s'active donc fichier par fichier, exactement comme les images.
 *
 * Deux détails qui comptent :
 *
 * 1. LE SILENCE DES CODECS. L'AAC ajoute quelques millisecondes de blanc en
 *    tête du fichier décodé (« priming »). Sur une boucle de 48 s ça produit
 *    un micro-trou à chaque tour. On ne lit donc jamais la boucle bord à
 *    bord : `loopStart`/`loopEnd` sont rentrés de 60 ms de chaque côté. Le
 *    trou disparaît, et personne n'entend qu'il manque un dixième de seconde
 *    sur un lit d'ambiance.
 *
 * 2. UN SEUL DÉCODAGE. Les tampons décodés sont gardés en mémoire : revenir
 *    au parc ne redécode pas 400 Ko.
 */
import { getAudio } from './sound';

/** Marge rognée aux deux bouts d'une boucle, en secondes (voir en-tête). */
const LOOP_TRIM = 0.06;

const cache = new Map<string, AudioBuffer | null>();
const pending = new Map<string, Promise<AudioBuffer | null>>();

/**
 * Charge et décode un fichier. Renvoie `null` — sans bruit dans la console —
 * si le fichier est absent : c'est le cas normal tant qu'un pack n'est pas
 * livré, pas une erreur.
 */
export function loadAudio(url: string): Promise<AudioBuffer | null> {
  if (cache.has(url)) return Promise.resolve(cache.get(url)!);
  const already = pending.get(url);
  if (already) return already;

  const ac = getAudio();
  if (!ac) return Promise.resolve(null);

  const p = fetch(url)
    .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('absent'))))
    .then(buf => ac.decodeAudioData(buf))
    .then(decoded => { cache.set(url, decoded); return decoded; })
    .catch(() => { cache.set(url, null); return null; })
    .finally(() => { pending.delete(url); });

  pending.set(url, p);
  return p;
}

/** Le fichier est-il déjà connu comme absent ? Évite de retenter à chaque fois. */
export function isKnownMissing(url: string): boolean {
  return cache.get(url) === null;
}

/**
 * Joue un tampon une fois. Sert aux bruitages ponctuels : cri d'ennemi, pièce
 * qui tombe, rideau qui claque. Rien à arrêter, le nœud se libère tout seul.
 */
export function playBuffer(buffer: AudioBuffer, gain = 1): void {
  const ac = getAudio();
  if (!ac) return;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(g).connect(ac.destination);
  src.start();
  src.onended = () => { try { src.disconnect(); g.disconnect(); } catch { /* silent */ } };
}

/**
 * Joue un fichier une fois, s'il existe. Renvoie `true` si le son a pu être
 * lancé — l'appelant sait ainsi s'il doit déclencher son repli synthétisé.
 * Le premier appel décode le fichier, les suivants sont immédiats.
 */
export function playFile(url: string, gain = 1): Promise<boolean> {
  if (isKnownMissing(url)) return Promise.resolve(false);
  return loadAudio(url).then(buf => {
    if (!buf) return false;
    playBuffer(buf, gain);
    return true;
  });
}

export interface Loop {
  /** Coupe la boucle, avec un fondu de sortie. */
  stop: (fadeS?: number) => void;
  /** Ajuste le volume à chaud (utilisé pour la sourdine et les enchaînements). */
  setGain: (value: number, rampS?: number) => void;
}

/**
 * Démarre une boucle. `gain` est le volume cible, atteint par un fondu
 * d'entrée : une ambiance ne doit jamais surgir d'un coup.
 */
export function startLoop(buffer: AudioBuffer, gain: number, fadeInS = 1.2): Loop | null {
  const ac = getAudio();
  if (!ac) return null;

  const src = ac.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  // On rentre les bornes pour sauter le blanc de décodage (voir en-tête).
  const trim = Math.min(LOOP_TRIM, buffer.duration / 10);
  src.loopStart = trim;
  src.loopEnd = Math.max(trim + 0.5, buffer.duration - trim);

  const g = ac.createGain();
  const t = ac.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + fadeInS);

  src.connect(g).connect(ac.destination);
  src.start(0, trim);

  let stopped = false;
  return {
    stop(fadeS = 0.8) {
      if (stopped) return;
      stopped = true;
      const now = ac.currentTime;
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(Math.max(0.0002, g.gain.value), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + fadeS);
      } catch { /* contexte déjà fermé */ }
      setTimeout(() => {
        try { src.stop(); } catch { /* déjà arrêté */ }
        try { src.disconnect(); g.disconnect(); } catch { /* silent */ }
      }, fadeS * 1000 + 60);
    },
    setGain(value, rampS = 0.4) {
      const now = ac.currentTime;
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(Math.max(0.0002, g.gain.value), now);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, value), now + rampS);
      } catch { /* silent */ }
    },
  };
}
