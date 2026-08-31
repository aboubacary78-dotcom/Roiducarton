/*
 * QUELS SONS MANQUENT ENCORE AU JEU ?
 *
 * L'audit précédent (audit-audio.mjs) ne regarde qu'une chose : ce que le
 * joueur TOUCHE. Il dit 100 %, et c'est vrai, mais un jeu ne sonne pas
 * seulement quand on appuie. Il sonne aussi quand il vous fait quelque chose :
 * la nuit qui passe, la pluie qui tombe, l'ennemi qui charge, la faim qui
 * s'installe.
 *
 * Ce second audit mesure l'autre moitié :
 *
 *   1. LES RENCONTRES. 296 bruitages existent, un par événement. Combien
 *      d'événements du corpus ont réellement le leur ?
 *   2. LES ENNEMIS. Chacun devrait avoir son cri.
 *   3. LES LIEUX ET LA MÉTÉO. Une ambiance par quartier, une par temps.
 *   4. LES MINI-JEUX. Chacun a ses moments propres.
 *   5. LES ÉTATS DU CORPS ET DU MONDE, qui n'ont aucun son du tout : c'est là
 *      que le jeu paraît le plus pauvre, parce que rien ne le signale.
 *
 * On ne compte pas des fichiers : on compte des MOMENTS DE JEU sans voix.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const AUDIO = 'client/public/audio';
const surDisque = new Set(readdirSync(AUDIO).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)));

// ---- On charge les données du jeu pour parler de vrais identifiants --------
const dir = mkdtempSync(join(tmpdir(), 'sons-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, [
  "export { EXPLORE_EVENTS, BEG_EVENTS, REST_EVENTS, TRAVEL_EVENTS, FOLLOW_UP_EVENTS } from '@/contexts/data/events';",
  "export { ENEMIES } from '@/contexts/data/enemies';",
  "export { LOCATIONS } from '@/contexts/data/world';",
  "export { WEATHER_TYPES } from '@/contexts/data/weather';",
].join('\n'));
const out = join(process.cwd(), '.bundle-audit-sons.mjs');

const memoire = new Map();
globalThis.localStorage = { getItem: k => memoire.get(k) ?? null, setItem: (k, v) => memoire.set(k, String(v)), removeItem: k => memoire.delete(k), clear: () => memoire.clear() };
globalThis.window = { localStorage: globalThis.localStorage, addEventListener() {}, dispatchEvent() {} };
globalThis.document = { documentElement: { lang: 'fr' } };
Object.defineProperty(globalThis.navigator, 'language', { value: 'fr-FR', configurable: true });

await build({
  entryPoints: [entry], bundle: true, format: 'esm', outfile: out,
  platform: 'neutral', target: 'es2022', logLevel: 'error',
  alias: { '@': join(process.cwd(), 'client/src'), '@capacitor/core': shim },
  external: ['react', 'react-dom', 'framer-motion', 'wouter', '@capacitor/*'],
});
const jeu = await import(out);

const titre = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);
const barre = (n, total) => {
  const pct = total ? Math.round(n / total * 100) : 0;
  const plein = Math.round(pct / 5);
  return `${'█'.repeat(plein)}${'░'.repeat(20 - plein)} ${String(pct).padStart(3)} %  (${n}/${total})`;
};

// ─── 1. LES RENCONTRES ──────────────────────────────────────────────────────
titre('① LES RENCONTRES, un bruitage écrit pour chacune');
const tousEvts = [
  ...jeu.EXPLORE_EVENTS, ...jeu.BEG_EVENTS, ...jeu.REST_EVENTS,
  ...jeu.TRAVEL_EVENTS, ...Object.values(jeu.FOLLOW_UP_EVENTS),
];
const ids = [...new Set(tousEvts.map(e => e.id))];
const avecSfx = ids.filter(id => surDisque.has(`sfx-${id}`));
const sansSfx = ids.filter(id => !surDisque.has(`sfx-${id}`));
console.log(`  ${barre(avecSfx.length, ids.length)}`);
if (sansSfx.length) {
  console.log(`  ${sansSfx.length} rencontre(s) retombent sur la banque synthétisée :`);
  for (const id of sansSfx.slice(0, 12)) console.log(`     · ${id}`);
  if (sansSfx.length > 12) console.log(`     … et ${sansSfx.length - 12} autres`);
}

// ─── 2. LES ENNEMIS ─────────────────────────────────────────────────────────
titre('② LES ENNEMIS, un cri chacun');
/*
 * Le fichier d'un ennemi porte le SLUG de son nom français, pas son
 * identifiant : `Commerçant Furieux` → `cry-commercant-furieux`. Chercher sur
 * l'identifiant donnait 0 % sur vingt-sept fichiers bien présents.
 */
const slug = (nom) => nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ennemis = jeu.ENEMIES.map(e => e.name);
const avecCri = ennemis.filter(n => surDisque.has(`cry-${slug(n)}`));
console.log(`  ${barre(avecCri.length, ennemis.length)}`);
const sansCri = ennemis.filter(n => !surDisque.has(`cry-${slug(n)}`));
for (const id of sansCri.slice(0, 10)) console.log(`     · ${id}`);
if (sansCri.length > 10) console.log(`     … et ${sansCri.length - 10} autres`);

// ─── 3. LES LIEUX ET LA MÉTÉO ───────────────────────────────────────────────
titre('③ LES LIEUX, une ambiance par quartier');
const lieux = Object.keys(jeu.LOCATIONS);
const avecAmb = lieux.filter(id => surDisque.has(`amb-${id}`));
console.log(`  ${barre(avecAmb.length, lieux.length)}`);
for (const id of lieux.filter(l => !surDisque.has(`amb-${l}`))) console.log(`     · ${id}`);

titre('④ LA MÉTÉO, un lit sonore par temps');
/*
 * Deux temps n'ont volontairement PAS de couche : le beau temps et les nuages
 * ne font pas de bruit, et en inventer un donnerait un bourdonnement permanent
 * sous tout le jeu. Le fichier porte le nom français du temps.
 */
const SANS_COUCHE = new Set(['sunny', 'cloudy']);
const TRADUCTION = { rainy: 'pluie', storm: 'orage', snow: 'neige', fog: 'brouillard', heatwave: 'canicule' };
const temps = Object.keys(jeu.WEATHER_TYPES).filter(t => !SANS_COUCHE.has(t));
const avecMeteo = temps.filter(t => surDisque.has(`meteo-${TRADUCTION[t] ?? t}`));
console.log(`  ${barre(avecMeteo.length, temps.length)}`);
console.log(`  (beau temps et ciel couvert n'ont pas de couche : c'est voulu.)`);
for (const t of temps.filter(x => !surDisque.has(`meteo-${TRADUCTION[x] ?? x}`))) console.log(`     · ${t}`);

// ─── 5. LES MOMENTS DE JEU SANS AUCUNE VOIX ────────────────────────────────
/*
 * Ceux-là ne se déduisent d'aucune liste : il faut les nommer. Chacun est un
 * instant où le jeu agit SUR le joueur et ne le signale que par du texte.
 * On vérifie seulement si un fichier plausible existe déjà.
 */
titre('⑤ LES MOMENTS QUE RIEN NE SIGNALE À L\'OREILLE');
const MOMENTS = [
  // ── ① LA TENSION. Trois mécaniques centrales montent en silence. C'est le
  //    manque le plus lourd : elles durent pendant qu'on joue, au lieu de
  //    ponctuer. Vérifié : zéro appel de son dans les trois.
  ['tension-alerte-1', 1, 'Un palier d\'alerte franchi, premier cran', 'la jauge du casse monte de 0 à 100 sans un bruit'],
  ['tension-alerte-2', 1, 'Deuxième cran, plus proche', 'idem'],
  ['tension-alerte-3', 1, 'Bouclage : on est repéré pour de bon', 'idem'],
  ['tension-risque', 1, 'Le tas de la Récup\' qui grince avant de céder', 'le risque monte en continu, en silence'],
  ['tension-compte', 1, 'Les dernières secondes de la manche', 'le minuteur de la manche ne s\'entend pas'],

  // ── ② LE CORPS. Le jeu parle de survie, et le corps ne dit rien : les
  //    jauges ont un son de franchissement commun, aucune n'a le sien.
  ['corps-faim', 2, 'Un ventre qui gargouille', 'la faim sous 25 n\'a qu\'une barre orange'],
  ['corps-soif', 2, 'Une gorge sèche, une déglutition', 'idem pour la soif'],
  ['corps-froid', 2, 'Des dents qui claquent', 'le froid tue et ne s\'entend jamais'],
  ['corps-epuise', 2, 'Un bâillement qui ne finit pas', 'le sommeil sous 25'],

  // ── ③ LE COMBAT. On frappe et on encaisse, mais tout ce qui se joue ENTRE
  //    les coups est muet. Vérifié : l'esquite parfaite n'a qu'un message.
  ['combat-esquive-parfaite', 3, 'L\'air fendu, et rien qui touche', 'une esquive parfaite n\'a qu\'un toast'],
  ['combat-esquive', 3, 'Un coup qui frôle', 'esquiver à moitié ne s\'entend pas'],
  ['combat-charge', 3, 'L\'ennemi qui prend son élan', 'on ne l\'entend pas venir'],

  // ── ④ LES OBJETS. Ils s\'usent, se cassent, s\'équipent, sans un bruit.
  ['objet-equipe', 4, 'Un vêtement enfilé, une boucle serrée', 's\'équiper est muet'],
  ['objet-casse', 4, 'Quelque chose qui cède pour de bon', 'perdre un objet est muet'],
  ['objet-plein', 4, 'Un sac trop plein qu\'on force', 'refuser faute de place est muet'],

  // ── ⑤ L\'INTERFACE. Les messages passent sans bruit, et une action
  //    indisponible ne se signale que par une opacité.
  ['ui-toast-bon', 5, 'Une note brève, bonne nouvelle', 'les messages sont muets'],
  ['ui-toast-mauvais', 5, 'Son pendant, mauvaise nouvelle', 'idem'],
  ['ui-verrou', 5, 'Un loquet qui refuse', 'une action indisponible ne dit rien'],
];
let manquants = 0;
const FAMILLES = { 1: 'LA TENSION', 2: 'LE CORPS', 3: 'LE COMBAT', 4: 'LES OBJETS', 5: "L'INTERFACE" };
let famCourante = 0;
for (const [id, prio, quoi, pourquoi] of MOMENTS) {
  if (prio !== famCourante) { famCourante = prio; console.log(`\n  \x1b[1m${prio}. ${FAMILLES[prio]}\x1b[0m`); }
  const existe = surDisque.has(id);
  if (!existe) manquants++;
  console.log(`    ${existe ? '✓' : '·'} ${id.padEnd(24)} ${quoi}`);
  if (!existe) console.log(`      ${''.padEnd(24)} \x1b[2m→ ${pourquoi}\x1b[0m`);
}

// ─── RÉCAPITULATIF ─────────────────────────────────────────────────────────
titre('CE QUI RESTE À ÉCRIRE');
const total = sansSfx.length + sansCri.length + (lieux.length - avecAmb.length) + (temps.length - avecMeteo.length) + manquants;
console.log(`  rencontres sans bruitage propre : ${sansSfx.length}`);
console.log(`  ennemis sans cri                : ${sansCri.length}`);
console.log(`  quartiers sans ambiance         : ${lieux.length - avecAmb.length}`);
console.log(`  temps sans lit sonore           : ${temps.length - avecMeteo.length}`);
console.log(`  moments sans aucune voix        : ${manquants}`);
console.log(`  ────────────────────────────────────`);
console.log(`  total                           : ${total}`);

rmSync(out, { force: true });
