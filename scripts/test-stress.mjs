/*
 * Les six corrections du rapport de stress, vérifiées sur le vrai réducteur.
 *
 * On ne teste pas que « ça ne plante plus » : on rejoue précisément la boucle
 * que l'audit décrivait, et on vérifie qu'elle ne rapporte plus ce qu'elle
 * rapportait.
 */
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'stress-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, [
  "export { gameReducer } from '@/contexts/GameContext';",
  "export { generateCharacter, bagCapacity, TRAITS } from '@/contexts/data/world';",
  "export { getNextWeather, getInitialWeather } from '@/contexts/data/weather';",
  "export { SHOPS, getBasePrice } from '@/contexts/data/shops';",
].join('\n'));

const out = join(process.cwd(), '.bundle-test-stress.mjs');
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

const { gameReducer, generateCharacter, bagCapacity, TRAITS, getNextWeather, getInitialWeather, SHOPS } = await import(out);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};
const trait = id => TRAITS.find(t => t.id === id);
const perso = (extra = {}) => ({ ...generateCharacter('Testeur'), day: 8, location: 'parc', inventory: [], ...extra });
const etat = (c, extra = {}) => ({
  character: c, screen: 'main', dayActions: 0, maxDayActions: 3,
  weather: 'cloudy', nextWeather: 'cloudy', eventResult: null, currentEvent: null, contract: null, ...extra,
});

// ---- 1. Le voyage ne remplit plus le mental --------------------------------
const guide = perso({ traits: [trait('orientation'), trait('optimiste')], stats: { health: 80, mental: 40, hunger: 80, thirst: 80, sleep: 80, dignity: 60 } });
let c = guide, s = etat(c);
for (let i = 0; i < 40; i++) {
  s = gameReducer({ ...s, character: c, screen: 'main' }, { type: 'TRAVEL', location: i % 2 ? 'gare' : 'parc' });
  c = s.character;
}
verifier('40 allers-retours avec Orientation : le mental ne bouge pas',
  c.stats.mental === 40, `${c.stats.mental} au lieu de 40 au départ (avant : 100)`);

const marcheur = perso({ traits: [trait('optimiste'), trait('poissard')], stats: { health: 80, mental: 40, hunger: 80, thirst: 80, sleep: 80, dignity: 60 } });
const apresUnTrajet = gameReducer(etat(marcheur), { type: 'TRAVEL', location: 'gare' }).character;
verifier('sans Orientation, traverser la ville fatigue',
  apresUnTrajet.stats.hunger < 80 && apresUnTrajet.stats.sleep < 80,
  `faim ${apresUnTrajet.stats.hunger}, sommeil ${apresUnTrajet.stats.sleep}`);
verifier('avec Orientation, les raccourcis annulent cette fatigue',
  gameReducer(etat(guide), { type: 'TRAVEL', location: 'gare' }).character.stats.hunger === 80);

// ---- 2. La route se connaît : un événement par quartier et par jour --------
let evenements = 0, r = etat(perso());
for (let i = 0; i < 40; i++) {
  r = gameReducer({ ...r, screen: 'main' }, { type: 'TRAVEL', location: i % 2 ? 'gare' : 'parc' });
  if (r.screen === 'event') { evenements++; r = { ...r, screen: 'main' }; }
}
verifier('40 trajets entre deux quartiers : au plus 2 événements',
  evenements <= 2, `${evenements} événement(s) (avant : ~20)`);

// ---- 3. Le sac à dos tient sa promesse ------------------------------------
const nu = perso();
const sacDos = perso({ inventory: [{ id: 'sac-dos-troue', name: 'Sac à dos troué', emoji: '🎒', type: 'tool', value: 6 }] });
verifier('sans sac : 20 places', bagCapacity(nu) === 20, `${bagCapacity(nu)}`);
verifier('avec le sac à dos troué : 24 places', bagCapacity(sacDos) === 24, `${bagCapacity(sacDos)}`);

// ---- 4. La fontaine coûte de la fierté dès la deuxième gorgée -------------
const assoiffe = perso({ location: 'parc', money: 50, stats: { health: 80, mental: 80, hunger: 80, thirst: 30, dignity: 60, sleep: 80 } });
// L'écran résout l'article avant de dispatcher : on fait pareil.
const EAU = SHOPS.find(sh => sh.id === 'fontaine').items.find(i => i.id === 'eau-fontaine');
const boire = (etatCourant) => gameReducer(etatCourant, { type: 'BUY_ITEM', shopItem: EAU, actualPrice: 0 });
let e = etat(assoiffe);
const d0 = e.character.stats.dignity;
e = boire(e);
const d1 = e.character.stats.dignity;
e = boire(e);
const d2 = e.character.stats.dignity;
e = boire(e);
const d3 = e.character.stats.dignity;
verifier('première gorgée du jour : gratuite', d1 === d0, `${d0} → ${d1}`);
verifier('gorgées suivantes : la fierté paie', d2 < d1 && d3 < d2, `${d1} → ${d2} → ${d3}`);

// ---- 5. REVIVE est verrouillé dans le réducteur ---------------------------
const vivant = perso({ stats: { health: 5, mental: 5, hunger: 5, thirst: 5, sleep: 5, dignity: 5 } });
const soigneIndu = gameReducer(etat(vivant), { type: 'REVIVE' });
verifier('un personnage VIVANT ne peut pas être ressuscité',
  soigneIndu.character.stats.health === 5, `santé ${soigneIndu.character.stats.health}`);

const mort = { ...vivant, alive: false };
const horsEcran = gameReducer(etat(mort, { screen: 'main' }), { type: 'REVIVE' });
verifier('hors de l\'écran de fin, la résurrection est refusée',
  horsEcran.character.stats.health === 5, `santé ${horsEcran.character.stats.health}`);

const premier = gameReducer(etat(mort, { screen: 'game-over' }), { type: 'REVIVE' });
verifier('à la mort, sur l\'écran de fin : elle marche', premier.character.stats.health === 50 && premier.character.alive);
const second = gameReducer(etat(premier.character, { screen: 'game-over' }), { type: 'REVIVE' });
verifier('une seule fois par partie', second.character.stats.health === 50 && second.screen !== 'main');

// ---- 6. La neige existe ---------------------------------------------------
let parties = 0, joursNeige = 0;
for (let p = 0; p < 200; p++) {
  let m = getInitialWeather(), vu = false;
  for (let j = 1; j <= 60; j++) { m = getNextWeather(m, j); if (m === 'snow') { joursNeige++; vu = true; } }
  if (vu) parties++;
}
verifier('la neige est atteignable en 60 jours', parties > 150, `${parties}/200 parties, ${(joursNeige / 12000 * 100).toFixed(1)} % des jours`);
let avant6 = 0;
for (let i = 0; i < 20000; i++) if (getNextWeather('cloudy', 5) === 'snow') avant6++;
verifier('jamais avant le jour 6', avant6 === 0, `${avant6} sur 20000`);

rmSync(out, { force: true });
process.exit(echecs ? 1 : 0);
