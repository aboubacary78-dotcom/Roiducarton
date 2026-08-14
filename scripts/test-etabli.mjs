/*
 * L'établi et la défense, vérifiés sur le vrai réducteur.
 *
 * Deux choses à prouver : que le `defenseBonus` promis par vingt-cinq objets
 * change enfin les dégâts encaissés, et que le matériel de l'établi rend
 * exactement la nuit qu'il annonce — ni plus (pas de sommeil créé de rien),
 * ni moins.
 */
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'etabli-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, [
  "export { gameReducer } from '@/contexts/GameContext';",
  "export { generateCharacter } from '@/contexts/data/world';",
  "export { RECIPES, usureNuit } from '@/contexts/data/crafting';",
  "export { soakDamage, bestArmorBonus, makeCombatState } from '@/contexts/data/combat';",
  "export { ENEMIES } from '@/contexts/data/enemies';",
].join('\n'));

const out = join(process.cwd(), '.bundle-test-etabli.mjs');
const memoire = new Map();
globalThis.localStorage = {
  getItem: k => (memoire.has(k) ? memoire.get(k) : null),
  setItem: (k, v) => memoire.set(k, String(v)),
  removeItem: k => memoire.delete(k),
  clear: () => memoire.clear(),
};
globalThis.window = { localStorage: globalThis.localStorage, addEventListener() {}, dispatchEvent() {} };
globalThis.document = { documentElement: { lang: 'fr' } };
Object.defineProperty(globalThis.navigator, 'language', { value: 'fr-FR', configurable: true });

await build({
  entryPoints: [entry], bundle: true, format: 'esm', outfile: out,
  platform: 'neutral', target: 'es2022', logLevel: 'error',
  alias: { '@': join(process.cwd(), 'client/src'), '@capacitor/core': shim },
  external: ['react', 'react-dom', 'framer-motion', 'wouter', '@capacitor/*'],
});

const { gameReducer, generateCharacter, RECIPES, soakDamage, bestArmorBonus, makeCombatState, ENEMIES } = await import(out);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};
const objet = (extra) => ({ id: 'x', name: 'Truc', emoji: '🔩', type: 'junk', value: 2, ...extra });
const perso = (extra = {}) => ({ ...generateCharacter('Testeur'), day: 4, inventory: [], ...extra });

// ---- 1. La défense existe ------------------------------------------------
const nu = perso();
const blinde = perso({ inventory: [objet({ id: 'gilet', type: 'armor', defenseBonus: 5 })] });
verifier('sans armure, les dégâts passent entiers', soakDamage(nu, 20) === 20, `${soakDamage(nu, 20)} sur 20`);
verifier('gilet +5 : les dégâts baissent', soakDamage(blinde, 20) < 20, `${soakDamage(blinde, 20)} sur 20 (−${Math.round((1 - soakDamage(blinde, 20) / 20) * 100)} %)`);
verifier('l\'armure ne rend jamais invulnérable', soakDamage(perso({ inventory: [objet({ id: 'a', type: 'armor', defenseBonus: 99 })] }), 20) >= 1);

const deuxManteaux = perso({ inventory: [objet({ id: 'm1', type: 'armor', defenseBonus: 2 }), objet({ id: 'm2', type: 'armor', defenseBonus: 2 })] });
verifier('deux armures ne se cumulent pas', bestArmorBonus(deuxManteaux) === 2, `retenu : +${bestArmorBonus(deuxManteaux)}`);

// ---- 2. L'arme de fortune surprend au premier coup ------------------------
const arme = RECIPES.find(r => r.id === 'arme-fortune').make();
const avecArme = perso({ inventory: [arme] });
const combatArme = makeCombatState(ENEMIES[0], avecArme);
const combatNu = makeCombatState(ENEMIES[0], nu);
verifier('arme de fortune : effet de surprise au premier coup', combatArme.atkBuff > combatNu.atkBuff, `atkBuff ${combatArme.atkBuff} contre ${combatNu.atkBuff}`);

// ---- 3. Le matériel de nuit rend ce qu'il annonce -------------------------
const nuit = (c, meteo = 'sunny') => gameReducer(
  { character: c, screen: 'main', dayActions: 3, maxDayActions: 3, weather: meteo, eventResult: null, currentEvent: null, contract: null },
  { type: 'NEXT_DAY' },
);

const matelas = RECIPES.find(r => r.id === 'matelas').make();
const dormeur = perso({ stats: { health: 80, mental: 80, hunger: 80, thirst: 80, sleep: 60, dignity: 60 } });
const dormeurEquipe = { ...dormeur, inventory: [matelas] };
verifier('sans matelas : la nuit coûte du sommeil', nuit(dormeur).character.stats.sleep < 60, `${nuit(dormeur).character.stats.sleep} au réveil`);
verifier('avec matelas : le sommeil est intact', nuit(dormeurEquipe).character.stats.sleep === 60, `${nuit(dormeurEquipe).character.stats.sleep} au réveil`);

// Le piège : à sommeil zéro, le matelas ne doit RIEN créer.
const epuise = { ...dormeur, stats: { ...dormeur.stats, sleep: 0 }, inventory: [matelas] };
verifier('à zéro de sommeil, le matelas n\'en fabrique pas', nuit(epuise).character.stats.sleep === 0, `${nuit(epuise).character.stats.sleep} au réveil`);

// ---- 4. L'usure finit par emporter le matériel ---------------------------
let survivants = 0;
const N = 4000;
for (let i = 0; i < N; i++) {
  const r = nuit({ ...dormeur, inventory: [RECIPES.find(x => x.id === 'matelas').make()] });
  if (r.character.inventory.some(o => o.id === 'craft-matelas')) survivants++;
}
const taux = 1 - survivants / N;
verifier('le matelas cède environ une nuit sur quatre', taux > 0.2 && taux < 0.3, `${(taux * 100).toFixed(1)} % de casse`);

// ---- 5. Plus aucune recette n'est verrouillée ----------------------------
verifier('les six recettes sont ouvertes à tous', RECIPES.every(r => !r.advanced), `${RECIPES.filter(r => r.advanced).length} verrouillée(s)`);

rmSync(out, { force: true });
process.exit(echecs ? 1 : 0);
