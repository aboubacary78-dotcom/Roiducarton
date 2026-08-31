/*
 * BRUITAGES D'ÉVÉNEMENTS
 * ----------------------
 * Chaque rencontre du jeu s'annonce par un son qui lui va : le chien aboie, le
 * mariage sonne les cloches, la gare fait siffler un train…
 *
 * Écrire 296 sons à la main serait ingérable (et illisible). On construit donc
 * une BANQUE de bruitages thématiques, et on aiguille chaque événement vers le
 * sien en lisant son identifiant et son titre. Un événement non reconnu tombe
 * sur une petite note de découverte : il y a toujours un son, jamais de trou.
 *
 * Tout est synthétisé (Web Audio) : aucun fichier à télécharger.
 */
import { getAudio, isMuted } from './sound';
import { loadAudio, isKnownMissing, playBuffer } from './audioFiles';

// ---- petites briques de synthèse (locales, pour ne pas alourdir sound.ts) ----

function note(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0, slideTo?: number) {
  const ac = getAudio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

// Souffle filtré : pluie, vent, foule, vapeur… `q` élargit ou resserre la bande.
let buf: AudioBuffer | null = null;
function hiss(dur: number, gain: number, freq: number, delay = 0, type: BiquadFilterType = 'bandpass', q = 1) {
  const ac = getAudio();
  if (!ac) return;
  if (!buf || buf.sampleRate !== ac.sampleRate) {
    const n = Math.floor(ac.sampleRate * 1.2);
    buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.06, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(ac.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.03);
}

// ---- la banque de bruitages ----
// Chaque entrée est un mini-son de 0,3 à 1,2 s, volontairement discret : il
// s'entend à l'ouverture de la carte d'événement, il ne doit pas couvrir le jeu.
const BANK: Record<string, () => void> = {
  dog:      () => { [0, 0.19].forEach((d) => { note(300, 0.09, 'square', 0.075, d, 160); hiss(0.07, 0.05, 700, d); }); note(115, 0.3, 'sawtooth', 0.05, 0.4, 85); },
  cat:      () => { note(700, 0.3, 'sawtooth', 0.05, 0, 1080); hiss(0.3, 0.04, 3000, 0.3); },
  bird:     () => [0, 0.13, 0.27].forEach((d, i) => note([2100, 2500, 1900][i], 0.07, 'square', 0.04, d, 1400)),
  pigeon:   () => [420, 360, 330].forEach((f, i) => note(f, 0.16, 'sine', 0.055, i * 0.15, f * 0.82)),
  rat:      () => [0, 0.08, 0.17].forEach((d, i) => note(2400 + i * 260, 0.05, 'square', 0.03, d, 1800)),
  bee:      () => { note(210, 0.75, 'sawtooth', 0.045, 0, 240); note(216, 0.75, 'sawtooth', 0.035, 0.02, 246); },
  horse:    () => [0, 0.16, 0.3, 0.42].forEach((d) => { note(160, 0.05, 'triangle', 0.06, d, 90); hiss(0.05, 0.04, 400, d); }),

  wedding:  () => { [0, 0.42].forEach((d) => { note(880, 0.9, 'sine', 0.06, d, 660); note(1320, 0.7, 'sine', 0.035, d + 0.03, 990); }); [523, 587, 659, 784].forEach((f, i) => note(f, 0.3, 'triangle', 0.05, 0.85 + i * 0.22)); },
  funeral:  () => { [0, 0.62].forEach((d) => note(110, 1.3, 'sine', 0.085, d, 55)); [392, 349, 294].forEach((f, i) => note(f, 0.5, 'sine', 0.045, 1.2 + i * 0.34)); },
  church:   () => { [261, 329, 392].forEach((f) => note(f, 1.5, 'sine', 0.04)); note(130, 1.6, 'sine', 0.05, 0.1); },
  bell:     () => { note(1050, 0.9, 'sine', 0.06, 0, 780); note(1570, 0.6, 'sine', 0.03, 0.02, 1180); },

  train:    () => { note(420, 0.5, 'sawtooth', 0.055, 0, 300); note(560, 0.5, 'sawtooth', 0.04, 0.02, 400); hiss(0.9, 0.05, 900, 0.45, 'lowpass'); },
  metro:    () => { hiss(1.1, 0.055, 500, 0, 'lowpass'); note(90, 1.1, 'sawtooth', 0.045, 0, 130); },
  car:      () => { note(120, 0.8, 'sawtooth', 0.05, 0, 200); hiss(0.8, 0.035, 600, 0, 'lowpass'); },
  horn:     () => { [0, 0.22].forEach((d) => { note(440, 0.16, 'square', 0.06, d); note(554, 0.16, 'square', 0.05, d); }); },
  siren:    () => [0, 0.36, 0.72].forEach((d) => { note(760, 0.34, 'square', 0.05, d, 1050); }),

  crowd:    () => { hiss(1.2, 0.05, 700, 0, 'bandpass', 0.7); hiss(1.2, 0.03, 1600, 0.1, 'bandpass', 0.6); },
  applause: () => { for (let i = 0; i < 26; i++) hiss(0.045, 0.035, 1800 + Math.random() * 1800, Math.random() * 1.0); },
  laugh:    () => [0, 0.16, 0.3, 0.42].forEach((d, i) => note(420 - i * 40, 0.11, 'triangle', 0.055, d, 300 - i * 30)),
  music:    () => [523, 659, 784, 1047].forEach((f, i) => note(f, 0.26, 'triangle', 0.05, i * 0.13)),
  radio:    () => { hiss(0.3, 0.045, 2200, 0, 'bandpass', 4); [660, 880].forEach((f, i) => note(f, 0.2, 'square', 0.03, 0.3 + i * 0.18)); },

  water:    () => { hiss(1.1, 0.05, 1400, 0, 'bandpass', 0.8); [0.15, 0.5, 0.8].forEach((d) => note(900, 0.09, 'sine', 0.035, d, 500)); },
  rain:     () => { hiss(1.3, 0.05, 2400, 0, 'highpass'); hiss(1.3, 0.03, 900, 0.05, 'lowpass'); },
  thunder:  () => { hiss(0.16, 0.09, 3000, 0, 'highpass'); hiss(1.4, 0.1, 130, 0.1, 'lowpass'); note(58, 1.4, 'sine', 0.08, 0.12, 36); },
  wind:     () => { hiss(1.4, 0.055, 520, 0, 'bandpass', 0.5); hiss(1.4, 0.03, 1100, 0.2, 'bandpass', 0.5); },
  fire:     () => { hiss(1.1, 0.05, 1100, 0, 'bandpass', 0.6); [0.2, 0.55, 0.85].forEach((d) => hiss(0.05, 0.05, 2600, d)); },
  fireworks:() => [0, 0.35, 0.62].forEach((d) => { note(600, 0.1, 'sine', 0.04, d, 1600); hiss(0.35, 0.07, 1800, d + 0.09, 'highpass'); }),

  coins:    () => [0, 0.07, 0.15].forEach((d, i) => note(1500 + i * 220, 0.09, 'triangle', 0.05, d)),
  cash:     () => { note(1400, 0.07, 'square', 0.05); note(1800, 0.1, 'triangle', 0.045, 0.07); note(900, 0.25, 'sine', 0.04, 0.2, 600); },
  food:     () => { hiss(0.8, 0.05, 2600, 0, 'bandpass', 0.8); note(300, 0.2, 'sine', 0.03, 0.5, 220); },
  market:   () => { hiss(1.0, 0.04, 800, 0, 'bandpass', 0.7); [0.2, 0.6].forEach((d) => note(1200, 0.08, 'triangle', 0.035, d)); },

  machine:  () => { note(95, 0.9, 'square', 0.045, 0, 105); [0.1, 0.35, 0.6].forEach((d) => note(1500, 0.05, 'square', 0.03, d)); },
  robot:    () => [0, 0.14, 0.28].forEach((d, i) => note([880, 1320, 660][i], 0.1, 'square', 0.04, d)),
  drone:    () => { note(320, 0.9, 'sawtooth', 0.04, 0, 300); note(326, 0.9, 'sawtooth', 0.03, 0.01, 306); },
  construction: () => [0, 0.28, 0.54].forEach((d) => { note(220, 0.07, 'square', 0.06, d, 140); hiss(0.06, 0.055, 1400, d); }),

  paper:    () => { hiss(0.22, 0.04, 2600, 0, 'highpass'); hiss(0.18, 0.03, 2000, 0.24, 'highpass'); },
  door:     () => { note(180, 0.5, 'sawtooth', 0.04, 0, 420); note(90, 0.16, 'square', 0.05, 0.5, 60); },
  keys:     () => [0, 0.06, 0.13, 0.19].forEach((d) => note(2100 + Math.random() * 900, 0.06, 'triangle', 0.03, d)),
  phone:    () => [0, 0.5].forEach((d) => { note(1400, 0.35, 'square', 0.045, d); note(1100, 0.35, 'square', 0.04, d); }),
  camera:   () => { note(2600, 0.03, 'square', 0.05); note(1200, 0.05, 'square', 0.045, 0.05); hiss(0.25, 0.045, 3000, 0.1, 'highpass'); },

  sleep:    () => [0, 0.55].forEach((d) => { note(150, 0.34, 'sawtooth', 0.05, d, 95); note(90, 0.3, 'sine', 0.035, d + 0.3, 130); }),
  kids:     () => [660, 880, 1100, 880].forEach((f, i) => note(f, 0.14, 'triangle', 0.045, i * 0.14)),
  hospital: () => [0, 0.55, 1.1].forEach((d) => note(1046, 0.12, 'sine', 0.05, d)),
  gym:      () => [0, 0.3, 0.6].forEach((d) => { note(70, 0.14, 'sine', 0.07, d, 45); hiss(0.08, 0.04, 300, d, 'lowpass'); }),
  sewer:    () => { note(70, 1.2, 'sine', 0.06, 0, 50); [0.25, 0.7, 1.0].forEach((d) => note(700, 0.1, 'sine', 0.03, d, 340)); },
  garden:   () => { hiss(0.9, 0.035, 3200, 0, 'bandpass', 0.9); [0.1, 0.45].forEach((d, i) => note(2200 + i * 300, 0.06, 'square', 0.025, d, 1600)); },
  cold:     () => { hiss(1.0, 0.03, 5000, 0, 'highpass'); [1320, 1760, 2200].forEach((f, i) => note(f, 0.3, 'sine', 0.025, i * 0.16)); },
  ghost:    () => { note(330, 1.1, 'sine', 0.045, 0, 190); note(495, 0.9, 'sine', 0.03, 0.15, 280); },
  police:   () => [0, 0.4].forEach((d) => { note(680, 0.36, 'square', 0.05, d, 980); }),

  piano:    () => [523, 659, 784].forEach((f, i) => { note(f, 0.7, 'triangle', 0.05, i * 0.11); note(f * 2, 0.5, 'sine', 0.02, i * 0.11); }),
  bike:     () => { [0, 0.11, 0.22].forEach((d) => note(1900, 0.05, 'square', 0.035, d)); hiss(0.7, 0.035, 1300, 0.1, 'bandpass', 1.2); },
  glass:    () => [0, 0.09, 0.2].forEach((d, i) => { note(2600 + i * 400, 0.09, 'triangle', 0.045, d, 1800); hiss(0.06, 0.03, 4000, d, 'highpass'); }),
  cinema:   () => { note(88, 1.0, 'square', 0.035, 0, 92); [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach((d) => hiss(0.03, 0.025, 1200, d)); },
  clock:    () => [0, 0.5, 1.0].forEach((d) => { note(1300, 0.05, 'square', 0.04, d); note(950, 0.05, 'square', 0.03, d + 0.25); }),
  cloth:    () => { hiss(0.35, 0.045, 1700, 0, 'bandpass', 0.9); hiss(0.3, 0.035, 2400, 0.34, 'bandpass', 0.9); },
  wood:     () => [0, 0.26].forEach((d) => { note(260, 0.09, 'square', 0.055, d, 170); hiss(0.5, 0.03, 2800, d + 0.06, 'bandpass', 1.4); },),
  crowdlow: () => { hiss(1.0, 0.04, 480, 0, 'bandpass', 0.6); [0.25, 0.7].forEach((d) => note(300, 0.14, 'triangle', 0.025, d, 240)); },

  // Repli : une petite note de découverte, jamais silencieuse.
  discover: () => { note(660, 0.14, 'triangle', 0.045); note(880, 0.2, 'triangle', 0.04, 0.12); },
};

export type EventSfx = keyof typeof BANK;

// ---- l'aiguillage : du texte de l'événement vers son bruitage ----
// L'ordre COMPTE : on teste du plus spécifique au plus général, sinon
// « camionnette à glaces » finirait en son de voiture au lieu de clochette.
const RULES: [EventSfx, RegExp][] = [
  ['wedding',      /mariage|mari[ée]s|noces|dragée|bouquet de la mari/],
  ['funeral',      /enterrement|cort[èe]ge|fun[ée]raire|corbillard|deuil|veuve|d[ée]funt/],
  ['church',       /[ée]glise|cur[ée]|messe|chapelle|confession|bénédiction|pri[èe]re|clocher|sonneur|ang[ée]lus/],
  ['ghost',        /fant[ôo]me|revenant|spectre|sursaut|au-del[àa]|esprit frappeur/],
  ['hospital',     /h[ôo]pital|urgences|infirmi|m[ée]decin|docteur|pharmaci|ambulance|brancard/],
  ['police',       /police|flic|gendarme|commissariat|contractuelle|contr[ôo]le de police|garde [àa] vue/],
  ['siren',        /pompier|sir[èe]ne|incendie/],
  ['train',        /train|rails|voie ferr[ée]e|quai|locomotive|passerelle des rails|halte/],
  ['metro',        /m[ée]tro|rame|souterrain du m[ée]tro/],
  ['horn',         /klaxon|embouteillage|carrefour|circulation/],
  ['car',          /voiture|camion|camionnette|bus|taxi|parking|trottinette|autoroute|d[ée]viation|routier/],
  ['fireworks',    /feu d'artifice|artifice|p[ée]tard|fus[ée]e/],
  ['thunder',      /orage|tonnerre|[ée]clair|temp[êe]te|foudre/],
  ['rain',         /pluie|averse|dr[au]ache|d[ée]luge|trempé|mouill/],
  ['cold',         /neige|gel|givre|hiver|froid glacial|glaciale|verglas/],
  ['wind',         /vent|bourrasque|brouillard|rafale|b[âa]che/],
  ['fire',         /feu de camp|flamme|br[ûu]l|incendi|r[ée]chaud|braise|barbecue/],
  ['water',        /fontaine|canal|p[ée]niche|piscine|arroseuse|rivi[èe]re|berge|halage|douche|robinet|[ée]clus|barque|bateau/],
  ['sewer',        /[ée]gout|souterrain|tunnel|cave|sous-sol|bouche ouverte|passage souterrain/],
  ['bee',          /abeille|ruche|gu[êe]pe|apicult|miel/],
  ['dog',          /chien|molosse|aboi|clebs|canin|chiot/],
  ['cat',          /\bchat\b|chaton|f[ée]lin|matou|gouttière|chatte/],
  ['pigeon',       /pigeon|colombe|tourterelle/],
  ['bird',         /mouette|corbeau|canard|oie\b|cygne|coq\b|oiseau|volaille|poule|perroquet|moineau/],
  ['rat',          /\brat\b|rats|souris|rongeur|[ée]cureuil|raton/],
  ['horse',        /cheval|chevaux|man[èe]ge|carrousel|poney/],
  ['applause',     /spectacle|th[ée][âa]tre|sc[èe]ne|cirque|tournage|casting|vernissage|repr[ée]sentation|public|ovation|magicien|statue vivante/],
  ['music',        /musique|musicien|harmonica|concert|fanfare|chanson|guitare|kara[oô]k[ée]|violon|orchestre|chorale/],
  ['radio',        /radio|t[ée]l[ée]vision|t[ée]l[ée]s|[ée]cran|podcast|antenne/],
  ['crowd',        /manif|foule|attroupement|cort[èe]ge de gens|march[ée] bond[ée]|f[êe]te de quartier|braderie/],
  ['laugh',        /clown|blague|farce|rigol|comique|humoriste|carnaval/],
  ['kids',         /enfant|gamin|gosse|[ée]cole|toboggan|[ée]colier|square de jeux|anniversaire|p[èe]re no[ëe]l/],
  ['gym',          /salle de sport|gym|muscul|haltère|boxe|match|stade|football/],
  ['construction', /chantier|travaux|grue|[ée]chafaudage|marteau-piqueur|d[ée]molition|b[ée]tonni/],
  ['machine',      /machine|laverie|lave-linge|usine|ascenseur|monte-charge|tapis roulant|escalator|distributeur|photomaton|sanisette|horodateur/],
  ['robot',        /robot|automate|borne|self-checkout|caisse automatique/],
  ['drone',        /drone/],
  ['camera',       /photo|photographe|selfie|appareil photo|paparazzi/],
  ['phone',        /t[ée]l[ée]phone|cabine|portable|sonnerie|appel|smartphone/],
  ['keys',         /cl[ée]s|trousseau|serrur|cadenas|verrou/],
  ['door',         /porte|grille|rideau de fer|portail|hall|interphone/],
  ['paper',        /livre|biblioth[èe]que|journal|papier|affiche|lettre|carnet|po[èe]me|roman|courrier|paperasse|dossier/],
  ['cash',         /banque|distributeur de billets|caisse|guichet|tirelire|loterie|tombola|loto/],
  ['coins',        /pi[èe]ce|monnaie|billet|pourboire|aum[ôo]ne|chapeau|quête|sou\b/],
  ['food',         /kebab|boulangerie|pain|sandwich|hot-dog|pizza|glace|soupe|frites|restaurant|cuisine|cantine|go[ûu]ter|barbecue|croissant|caf[ée]/],
  ['market',       /march[ée]|[ée]tal|boutique|magasin|sup[ée]rette|vitrine|brocante|vide-grenier|[ée]picerie|commer[çc]ant|puces/],
  ['garden',       /jardin|potager|arbre|fleur|plante|parc|feuille|serre|verger|pommier|for[êe]t/],
  ['sleep',        /dormir|sommeil|ronfle|matelas|lit\b|nuit|sieste|couchette|carton du frigo|duvet/],
  ['bell',         /cloche|clochette|carillon|sonnette/],

  // ---- second passage : ce que la première salve laissait de côté ----
  ['piano',        /piano|clavier de piano|d[ée]m[ée]nageurs/],
  ['bike',         /v[ée]lo|bicyclette|cycliste|trottinette|skate|planche|roulette/],
  ['glass',        /verre|bouteille|consigne du verre|bocal|vitre|cageot|glaci[èe]re/],
  ['cinema',       /cin[ée]ma|projection|film|[ée]cran g[ée]ant|s[ée]ance/],
  ['clock',        /[ée]checs|damier|attente|salle d'attente|revanche|patience|horloge|casier|consigne/],
  ['cloth',        /linge|pressing|costume|v[êe]tement|portant|bonnet|manteau|tente|b[âa]che|couverture|sapin|guirlande/],
  ['wood',         /menuiserie|poterie|atelier|scie|rabot|copeaux|tracteur|foire agricole/],
  ['crowdlow',     /s[ée]minaire|buffet|amphi|[ée]tudiant|conf[ée]rence|club|r[ée]union|sociologie|caravane|voyante|proph[ée]tie|sosie/],
  ['machine',      /jacuzzi|ch[âa]teau gonflable|escalier m[ée]canique|chauffage|lampadaire|cuivre|m[ée]taux|recycl|d[ée]chetterie|jeton/],
  ['food',         /petit-d[ée]jeuner|tarte|food-truck|panier|colis|pique-nique|graffiti|coiffure/],
  ['garden',       /terrain vague|toit|ruelle|raccourci|diagonale|escalier|grand-m[èe]re|gardienne|r[ée]cup|toilettes|tomate/],
  ['metro',        /tramway|tram\b/],
  ['crowd',        /bo[îi]te de nuit|videur|sortie de bo[îi]te|discoth[èe]que|pari/],
  ['machine',      /poubelle|benne|conteneur|frigo|r[ée]frig[ée]rateur|bureau/],
  ['paper',        /souvenir|se souvient|vieux|ancien|m[ée]moire|roi\b|carton/],
];

/** Choisit le bruitage qui va à un événement (id + titre + description). */
export function sfxFor(text: string): EventSfx {
  const t = text.toLowerCase();
  for (const [id, re] of RULES) if (re.test(t)) return id;
  return 'discover';
}

/**
 * Joue le bruitage d'un événement.
 *
 * Ordre de priorité :
 *   1. `/audio/sfx-<identifiant>.mp3`, le son écrit POUR cette rencontre-là.
 *   2. la banque thématique synthétisée, choisie en lisant le texte.
 *
 * Le second n'est déclenché que si le premier n'existe pas : jamais les deux.
 * Les 296 fichiers arrivent par lots, et chacun s'active dès qu'il est là.
 */
export function playEventSfx(text: string, eventId?: string): EventSfx {
  const fam = sfxFor(text);
  if (isMuted()) return fam;
  if (eventId) {
    const url = `/audio/sfx-${eventId}.mp3`;
    if (!isKnownMissing(url)) {
      loadAudio(url).then(buf => {
        if (buf) playBuffer(buf, 0.8);
        else { try { BANK[fam](); } catch { /* silent */ } }
      });
      return fam;
    }
  }
  try { BANK[fam](); } catch { /* silent */ }
  return fam;
}
