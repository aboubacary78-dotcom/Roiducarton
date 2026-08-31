/*
 * QUELLES MORTS EXISTENT VRAIMENT, ET LESQUELLES SONT ATTEIGNABLES ?
 *
 * On distingue deux choses que la lecture du code confond facilement :
 *
 *   - une CAUSE DE MORT, qui a un nom, une une de journal, une image et une
 *     entrée au registre ;
 *   - un SITE DE MORT, c'est-à-dire un endroit du réducteur où les jauges
 *     peuvent tomber à zéro. La garde à vue est un site, pas une cause : on
 *     n'y meurt pas « de garde à vue », on y meurt du moral, et le journal
 *     titre « Il avait tout, sauf le moral ».
 *
 * Le script compte les sites dans le code, puis rejoue la garde à vue pour
 * mesurer à partir de quel moral elle devient mortelle.
 */
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const src = readFileSync('client/src/contexts/GameContext.tsx', 'utf8');
const sitesJauge = [...src.matchAll(/const isAlive = [^;]+;/g)].length;
const sitesCombat = [...src.matchAll(/stateApresMort\(/g)].length - 1; // -1 : la définition
console.log(`Sites de mort dans le réducteur : ${sitesJauge} « de jauge » + ${sitesCombat} en combat = ${sitesJauge + sitesCombat}\n`);

const necro = readFileSync('client/src/lib/necrology.ts', 'utf8');
const causes = [...necro.matchAll(/id: 'mort-([a-z0-9-]+)'/g)].map(m => m[1]);
console.log(`Causes nommées au registre (${causes.length}) : ${causes.join(', ')}`);
console.log(`« garde à vue » est-elle une cause ? ${causes.includes('garde-a-vue') ? 'OUI' : 'NON'}\n`);

// ---- La garde à vue, rejouée -----------------------------------------------
const dir = mkdtempSync(join(tmpdir(), 'morts-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, [
  "export { gameReducer } from '@/contexts/GameContext';",
  "export { generateCharacter, TRAITS } from '@/contexts/data/world';",
  "export { HEIST_TARGETS } from '@/contexts/data/heist';",
].join('\n'));
const out = join(process.cwd(), '.bundle-audit-morts.mjs');
const memoire = new Map();
globalThis.localStorage = { getItem: k => memoire.get(k) ?? null, setItem: (k, v) => memoire.set(k, String(v)), removeItem: k => memoire.delete(k), clear: () => memoire.clear() };
globalThis.window = { localStorage: globalThis.localStorage, addEventListener() {}, dispatchEvent() {} };
globalThis.document = { documentElement: { lang: 'fr' } };
Object.defineProperty(globalThis.navigator, 'language', { value: 'fr-FR', configurable: true });
await build({ entryPoints: [entry], bundle: true, format: 'esm', outfile: out, platform: 'neutral', target: 'es2022', logLevel: 'error',
  alias: { '@': join(process.cwd(), 'client/src'), '@capacitor/core': shim }, external: ['react', 'react-dom', 'framer-motion', 'wouter', '@capacitor/*'] });
const { gameReducer, generateCharacter, TRAITS, HEIST_TARGETS } = await import(out);

const policiers = HEIST_TARGETS.filter(t => t.catcher === 'police');
console.log(`Cibles gardées par la police : ${policiers.length} sur ${HEIST_TARGETS.length} · ${policiers.map(t => t.id).join(', ')}`);

const neutres = ['optimiste', 'poissard'].map(id => TRAITS.find(t => t.id === id));
const perso = (mental) => ({
  ...generateCharacter('Testeur'), traits: neutres, day: 5, money: 20, inventory: [],
  stats: { health: 70, mental, hunger: 70, thirst: 70, sleep: 70, dignity: 70 },
});
const etat = (c) => ({ character: c, screen: 'steal-game', dayActions: 1, maxDayActions: 3,
  weather: 'cloudy', nextWeather: 'cloudy', eventResult: null, currentEvent: null, contract: null, combatLog: [], currentCombat: null, highScores: [], deathCause: null });

console.log('\nGarde à vue : à partir de quel moral tue-t-elle ? (1000 essais par palier)');
for (const mental of [4, 8, 9, 12, 20]) {
  let gardes = 0, morts = 0;
  for (let i = 0; i < 1000; i++) {
    const r = gameReducer(etat(perso(mental)), { type: 'RESOLVE_STEAL', tier: 'fail', targetId: 'heist-superette-centre' });
    const texte = r.eventResult?.text || '';
    if (/Garde à vue|custody/i.test(texte)) { gardes++; if (r.character.alive === false) morts++; }
  }
  console.log(`  moral ${String(mental).padStart(2)} : ${gardes} gardes à vue sur 1000 tentatives ratées, dont ${morts} mortelles`);
}

console.log('\nLa mort qui suit une garde à vue est étiquetée :');
const r = gameReducer(etat(perso(4)), { type: 'RESOLVE_STEAL', tier: 'fail', targetId: 'heist-superette-centre' });
console.log(`  cause enregistrée : ${r.deathCause ?? '(aucune, l\'écran de fin déduit « moral à zéro »)'}`);

rmSync(out, { force: true });
