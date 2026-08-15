/*
 * UNE MORT, UNE VIE NEUVE.
 *
 * Chaque personnage doit repartir de zéro : ses drapeaux d'intrigue, ses
 * rencontres vues, son casier de casses, ses quartiers parcourus. Un joueur a
 * signalé avoir reçu une SUITE narrative dès sa deuxième vie, alors qu'il
 * n'avait jamais rencontré le personnage dont c'était la suite.
 *
 * On rejoue donc le chemin complet — poser un drapeau, mourir, recommencer,
 * choisir un nouveau personnage — et on regarde ce qui a survécu.
 */
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'vie-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, [
  "export { gameReducer } from '@/contexts/GameContext';",
  "export { generateCharacter, generateCharacterTrio } from '@/contexts/data/world';",
  "export { FOLLOW_UP_EVENTS, generateEvents } from '@/contexts/data/events';",
].join('\n'));

const out = join(process.cwd(), '.bundle-test-vie.mjs');
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

const { gameReducer, generateCharacterTrio, FOLLOW_UP_EVENTS, generateEvents } = await import(out);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

// ---- Une première vie, bien remplie ---------------------------------------
const trio1 = generateCharacterTrio();
let s = {
  screen: 'character-select', character: null, characterChoices: trio1,
  dayActions: 0, maxDayActions: 3, weather: 'cloudy', nextWeather: 'cloudy',
  eventResult: null, currentEvent: null, contract: null, daySummary: null,
  combatLog: [], currentCombat: null, highScores: [], deathCause: null,
};
s = gameReducer(s, { type: 'SELECT_CHARACTER', index: 0 });
const nom1 = s.character.name;

// On lui donne un passé : des drapeaux d'intrigue, des rencontres vues, un
// casier de casses, des quartiers parcourus, un grand coup du jour.
s = {
  ...s,
  character: {
    ...s.character,
    activeFlags: ['chaton-boulangere', 'ami-jardinier', 'rival-echecs'],
    recentEvents: ['exp-canard-geant', 'beg-bingo'],
    stealCount: 7,
    bigScoreDay: 3,
    travelsToday: ['gare', 'marche'],
    fountainToday: 4,
    fountainDay: 3,
    day: 9,
  },
};
const avant = s.character;
verifier('la première vie a bien un passé',
  avant.activeFlags.length === 3 && avant.stealCount === 7, `${avant.activeFlags.length} drapeaux, casier ${avant.stealCount}`);

// Les suites lui sont accessibles, c'est normal : elle les a vécues.
const suitesAvant = Object.values(FOLLOW_UP_EVENTS).filter(e => e.requiresFlag && avant.activeFlags.includes(e.requiresFlag));
verifier('ses suites lui sont ouvertes', suitesAvant.length >= 3, `${suitesAvant.length} suite(s)`);

// ---- Elle meurt, on recommence --------------------------------------------
s = { ...s, character: { ...s.character, alive: false }, screen: 'game-over' };
s = gameReducer(s, { type: 'PREPARE_SUCCESSOR' });
s = gameReducer(s, { type: 'RESTART' });
verifier('après RESTART, plus de personnage', s.character === null, `${s.character ? 'il en reste un' : 'aucun'}`);

s = gameReducer(s, { type: 'SELECT_CHARACTER', index: 0 });
const apres = s.character;
verifier('le nouveau personnage est bien un autre', apres.name !== nom1 || apres.seed !== avant.seed, `${nom1} → ${apres.name}`);

// ---- Ce qui ne doit RIEN emporter -----------------------------------------
verifier('aucun drapeau d\'intrigue hérité',
  (apres.activeFlags || []).length === 0, `${JSON.stringify(apres.activeFlags)}`);
verifier('aucune rencontre déjà vue',
  (apres.recentEvents || []).length === 0, `${JSON.stringify(apres.recentEvents)}`);
verifier('casier de casses remis à zéro', (apres.stealCount ?? 0) === 0, `${apres.stealCount}`);
verifier('grand coup du jour oublié', apres.bigScoreDay === undefined, `${apres.bigScoreDay}`);
verifier('quartiers parcourus oubliés', (apres.travelsToday || []).length === 0, `${JSON.stringify(apres.travelsToday)}`);
verifier('gorgées de fontaine oubliées', (apres.fountainToday ?? 0) === 0, `${apres.fountainToday}`);
verifier('on repart au jour 1', apres.day === 1, `jour ${apres.day}`);

// ---- Et donc : aucune suite accessible ------------------------------------
const suitesApres = Object.values(FOLLOW_UP_EVENTS).filter(e => e.requiresFlag && (apres.activeFlags || []).includes(e.requiresFlag));
verifier('aucune suite narrative accessible à la vie neuve', suitesApres.length === 0, `${suitesApres.length} suite(s) : ${suitesApres.map(e => e.id).join(', ')}`);

// Mille tirages d'exploration : pas une seule suite ne doit sortir.
let suitesTirees = 0;
for (let i = 0; i < 1000; i++) {
  for (const e of generateEvents('parc', apres)) if (e.isFollowUp) suitesTirees++;
}
verifier('1000 explorations : aucune suite tirée', suitesTirees === 0, `${suitesTirees} tirée(s)`);

// ---- La mort en combat efface la partie comme toutes les autres -----------
// C'était la vraie fuite : quatre morts sur dix ne marquaient pas le
// personnage comme mort, n'enregistraient pas le score et laissaient la
// sauvegarde en place. Rouvrir l'application ramenait le défunt, drapeaux
// compris, et la vie suivante héritait de ses suites.
const CLE = 'roi-du-carton-save';
const combattant = {
  ...trio1[1],
  activeFlags: ['chaton-boulangere'], day: 6, alive: true,
  stats: { health: 3, mental: 60, hunger: 60, thirst: 60, sleep: 60, dignity: 60 },
};
localStorage.setItem(CLE, JSON.stringify({ character: combattant, dayActions: 1, screen: 'main' }));
const enCombat = {
  ...s, character: combattant, screen: 'combat', combatLog: [],
  currentCombat: {
    enemyName: 'Pickpocket', enemyEmoji: '🤏', enemyHealth: 20, enemyMaxHealth: 22, enemyAttack: 40,
    description: '', round: 1, phase: 'dodge', pattern: 'x', hand: [], atkBuff: 0,
    enemyStunned: false, enemyAtkDebuff: 0, signNonce: 1, trapRounds: 0, dodgePenalty: 0,
  },
};
const apresCombat = gameReducer(enCombat, { type: 'DODGE_RESULT', hits: 6 });
verifier('mort en combat : le personnage est marqué mort',
  apresCombat.character.alive === false, `alive = ${apresCombat.character.alive}`);
verifier('mort en combat : l\'écran de fin s\'affiche', apresCombat.screen === 'game-over');
verifier('mort en combat : la sauvegarde est effacée',
  localStorage.getItem(CLE) === null, localStorage.getItem(CLE) ? 'ELLE EST ENCORE LÀ' : 'effacée');

rmSync(out, { force: true });
process.exit(echecs ? 1 : 0);
