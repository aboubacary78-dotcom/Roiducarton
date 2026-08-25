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
 * 1. LE RACCORD DES BOUCLES. Un codec ajoute quelques millisecondes de blanc
 *    en tête du fichier décodé, et une boucle livrée n'a aucune raison de
 *    finir comme elle commence : les deux se réentendent à chaque tour. Le
 *    tampon est donc rogné puis REPLIÉ SUR LUI-MÊME en fondu croisé avant
 *    d'être joué (voir `preparerBoucle`). Le raccord devient une propriété du
 *    lecteur, pas une exigence envers le fournisseur.
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
    .then(r => {
      // Un fichier absent peut revenir en 200 avec la page d'accueil (règle
      // attrape-tout d'une application à page unique). On refuse donc tout ce
      // qui n'est pas de l'audio avant de le passer au décodeur : ça évite une
      // erreur de décodage dans la console à chaque son pas encore livré.
      const type = r.headers.get('content-type') || '';
      if (!r.ok || /text\/html/i.test(type)) return Promise.reject(new Error('absent'));
      return r.arrayBuffer();
    })
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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LE RACCORD DE BOUCLE SE FABRIQUE ICI, PAS CHEZ LE FOURNISSEUR.
 *
 * Rentrer `loopStart`/`loopEnd` de 60 ms supprime le blanc du codec, mais ne
 * règle rien quand la fin et le début du fichier ne se ressemblent pas : le
 * saut se réentend à chaque tour, en clac ou en à-coup de niveau. Mesuré sur
 * le lot livré : trois boucles sur neuf décrochaient, jusqu'à 6,7 dB d'écart
 * entre la queue et la tête, et un saut d'échantillon de 0,177 sur la zone
 * industrielle — parfaitement audible.
 *
 * On ne renvoie pas le lot pour ça. La queue est repliée sur la tête en
 * FONDU CROISÉ À ÉGALE PUISSANCE : le tampon raccourcit de la durée du fondu,
 * et son dernier échantillon enchaîne alors naturellement sur le premier. Le
 * raccord devient une propriété du lecteur, donc toute boucle livrée un jour
 * en profite sans qu'on ait à la contrôler.
 *
 * Égale puissance et non linéaire : deux fondus linéaires qui se croisent
 * creusent un trou de 3 dB au milieu, ce qui remplace un clac par un
 * battement.
 *
 * ET LE FONDU N'EST GARDÉ QUE S'IL AMÉLIORE. Mesuré sur le lot : il divise
 * par six le saut de la zone industrielle, mais il DÉGRADE deux boucles dont
 * la fin rejoignait déjà le début — sur `mg-marchandage-compte`, 0,002 devenu
 * 0,035. Recoudre ce qui n'est pas déchiré fait un pli. On fabrique donc les
 * deux versions, on compare le saut, et on joue la meilleure.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const FONDU_BOUCLE = 0.25;
const bouclesPretes = new WeakMap<AudioBuffer, AudioBuffer>();

function preparerBoucle(ac: BaseAudioContext, brut: AudioBuffer): AudioBuffer {
  const deja = bouclesPretes.get(brut);
  if (deja) return deja;

  const sr = brut.sampleRate;
  const rogne = Math.min(Math.floor(LOOP_TRIM * sr), Math.floor(brut.length / 10));
  const utile = brut.length - rogne * 2;
  const fondu = Math.min(Math.floor(FONDU_BOUCLE * sr), Math.floor(utile / 4));
  // Trop court pour qu'un fondu ait un sens : on rend le tampon tel quel.
  if (utile < sr * 0.5 || fondu < 64) return brut;

  const longueur = utile - fondu;
  const pret = ac.createBuffer(brut.numberOfChannels, longueur, sr);
  for (let c = 0; c < brut.numberOfChannels; c++) {
    const src = brut.getChannelData(c);
    const out = pret.getChannelData(c);
    for (let i = 0; i < longueur; i++) out[i] = src[rogne + i];
    for (let i = 0; i < fondu; i++) {
      const t = i / fondu;
      out[i] = src[rogne + i] * Math.sin((t * Math.PI) / 2)
             + src[rogne + longueur + i] * Math.cos((t * Math.PI) / 2);
    }
  }

  const garde = sautAuRaccord(pret) <= sautAuRaccord(brut) ? pret : brut;
  bouclesPretes.set(brut, garde);
  return garde;
}

/**
 * L'écart entre le dernier échantillon et le premier — ce que l'oreille
 * entend comme un clac au moment où la boucle repart.
 */
function sautAuRaccord(buf: AudioBuffer): number {
  const e = buf.getChannelData(0);
  return e.length ? Math.abs(e[e.length - 1] - e[0]) : 0;
}

/**
 * Démarre une boucle. `gain` est le volume cible, atteint par un fondu
 * d'entrée : une ambiance ne doit jamais surgir d'un coup.
 */
export function startLoop(buffer: AudioBuffer, gain: number, fadeInS = 1.2): Loop | null {
  const ac = getAudio();
  if (!ac) return null;

  const src = ac.createBufferSource();
  // Le tampon préparé boucle bord à bord : plus rien à rentrer.
  src.buffer = preparerBoucle(ac, buffer);
  src.loop = true;

  const g = ac.createGain();
  const t = ac.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + fadeInS);

  src.connect(g).connect(ac.destination);
  src.start();

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
