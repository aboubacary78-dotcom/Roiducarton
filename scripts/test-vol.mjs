/*
 * Vérifie les trois corrections du Vol sur le VRAI réducteur, pas sur une
 * transcription de ses formules : le sac plein, le quota d'un grand coup par
 * jour, et le coup de maître qui ne cumule plus argent maximum et objet.
 */
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// ---- Bundle du contexte, sans React ni Capacitor -------------------------
const dir = mkdtempSync(join(tmpdir(), 'vol-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, `export { gameReducer } from '${process.cwd()}/client/src/contexts/GameContext';\nexport { HEIST_TARGETS } from '${process.cwd()}/client/src/contexts/data/heist';\nexport { generateCharacter } from '${process.cwd()}/client/src/contexts/data/world';\n`);

// Le bundle doit vivre dans le projet : il importe react, résolu depuis node_modules.
const out = join(process.cwd(), '.bundle-test-vol.mjs');
const memoire = new Map();
globalThis.localStorage = {
  getItem: k => (memoire.has(k) ? memoire.get(k) : null),
  setItem: (k, v) => memoire.set(k, String(v)),
  removeItem: k => memoire.delete(k),
  clear: () => memoire.clear(),
};
globalThis.window = { localStorage: globalThis.localStorage, addEventListener() {}, dispatchEvent() {} };
globalThis.document = { documentElement: { lang: 'fr' } };
// `navigator` existe déjà en lecture seule sous Node 22 : on le complète.
Object.defineProperty(globalThis.navigator, 'language', { value: 'fr-FR', configurable: true });

await build({
  entryPoints: [entry], bundle: true, format: 'esm', outfile: out,
  platform: 'neutral', target: 'es2022', logLevel: 'error',
  alias: { '@': join(process.cwd(), 'client/src'), '@capacitor/core': shim },
  external: ['react', 'react-dom', 'framer-motion', 'wouter', '@capacitor/*'],
});

const { gameReducer, HEIST_TARGETS, generateCharacter } = await import(out);

// ---- Décor -----------------------------------------------------------------
const BOUTIQUE = HEIST_TARGETS.find(t => t.id === 'heist-boutique-telephones');
const ETAL = HEIST_TARGETS.find(t => t.id === 'heist-etal-marche'); // petit, sans objet

const perso = (extra = {}) => ({
  ...generateCharacter('Testeur'), day: 3, location: 'centre-ville', inventory: [], ...extra,
});
const etat = (c) => ({
  character: c, screen: 'steal-game', dayActions: 1, maxDayActions: 3,
  weather: 'clear', eventResult: null, currentEvent: null, day: c.day,
});
const voler = (c, tier, cible = BOUTIQUE) =>
  gameReducer(etat(c), { type: 'RESOLVE_STEAL', tier, targetId: cible.id });

let echecs = 0;
const verifier = (nom, condition, detail) => {
  console.log(`${condition ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!condition) echecs++;
};

// ---- 1. Le sac plein ne prend plus de butin -------------------------------
const sacPlein = perso({ inventory: Array.from({ length: 20 }, (_, i) => ({ id: `x${i}`, name: 'Bricole', emoji: '🔩', type: 'material', value: 1 })) });
const rPlein = voler(sacPlein, 'jackpot');
verifier('sac plein : l\'inventaire reste à 20', rPlein.character.inventory.length === 20, `${rPlein.character.inventory.length} objets`);
verifier('sac plein : le texte le dit', /sac est plein|bag is bursting/.test(rPlein.eventResult.text));

const sacVide = perso();
const rVide = voler(sacVide, 'jackpot');
verifier('sac vide : le smartphone entre bien', rVide.character.inventory.some(i => i.id === 'smartphone-blister'));

// ---- 2. Le coup de maître ne cumule plus ----------------------------------
verifier('coup de maître sur cible à objet : argent au plancher',
  rVide.character.money - sacVide.money === BOUTIQUE.moneyMin + 2,
  `${rVide.character.money - sacVide.money} € (avant la correction : ${BOUTIQUE.moneyMax + 3} €)`);

const petit = perso({ location: 'marche' });
const rPetit = voler(petit, 'jackpot', ETAL);
verifier('coup de maître sur cible sans objet : argent maximum conservé',
  rPetit.character.money - petit.money === ETAL.moneyMax + 3,
  `${rPetit.character.money - petit.money} €`);

verifier('coup de maître : plus de gros regain de moral',
  rVide.eventResult.statChanges.mental === 2, `mental ${rVide.eventResult.statChanges.mental >= 0 ? '+' : ''}${rVide.eventResult.statChanges.mental}`);

// ---- 3. Un grand coup par jour --------------------------------------------
verifier('grand coup réussi : la journée est marquée', rVide.character.bigScoreDay === sacVide.day, `bigScoreDay=${rVide.character.bigScoreDay}`);
verifier('petit coup réussi : la journée n\'est PAS marquée', rPetit.character.bigScoreDay === undefined);

const rateur = voler(perso(), 'fail');
verifier('grand coup raté : la journée n\'est pas marquée (on peut retenter)',
  rateur.character?.bigScoreDay === undefined || rateur.screen === 'combat');

// ---- 4. Rendement sur 3 actions, avant/après ------------------------------
const REVENTE = v => Math.max(1, Math.round(v * 0.6));
let cumul = 0;
const N = 20000;
for (let i = 0; i < N; i++) {
  let c = perso();
  let euros = 0;
  for (let a = 0; a < 3; a++) {
    const bloque = c.bigScoreDay === c.day;
    const cible = bloque ? HEIST_TARGETS.find(t => t.id === 'heist-superette-centre') : BOUTIQUE;
    const avant = c.money;
    const r = voler(c, 'jackpot', cible);
    c = r.character;
    euros += c.money - avant;
    const gagne = c.inventory.filter(o => o.value >= 5);
    euros += gagne.reduce((s, o) => s + REVENTE(o.value), 0);
    c = { ...c, inventory: [] };
  }
  cumul += euros;
}
console.log(`\n  Trois coups de maître d'affilée, revente comprise : ${(cumul / N).toFixed(1)} € / jour`);
console.log('  (avant la correction, la même journée valait 138 €)');

rmSync(out, { force: true });
process.exit(echecs ? 1 : 0);
