/*
 * LE COMPAGNON DE JOURNÉE.
 *
 * Partager son repas avec un PNJ le fait marcher avec vous jusqu'au soir et
 * vous prête l'un de ses traits. Aucun effet nouveau n'a été écrit pour ça :
 * les PNJ tiraient déjà leurs traits dans la table du joueur, et ces traits
 * étaient déjà branchés partout. Tout tient dans `hasTrait`.
 *
 * D'où le contrôle qui compte le plus ici, et qu'aucun test de réducteur ne
 * peut faire : RELIRE LE CODE SOURCE pour vérifier que chaque trait prêtable
 * est réellement interrogé quelque part. Un trait qui n'est branché nulle part
 * se prêterait sans rien changer — le joueur donnerait son repas contre une
 * ligne de texte, et rien ne le lui dirait.
 */
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'compagnon-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, [
  "export { gameReducer, TRAITS, TRAITS_PRETABLES, traitPretable, hasTrait } from '@/contexts/GameContext';",
].join('\n'));

const out = join(process.cwd(), '.bundle-test-compagnon.mjs');
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

const { gameReducer, TRAITS, TRAITS_PRETABLES, traitPretable, hasTrait } = await import(out);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};
const trait = id => TRAITS.find(t => t.id === id);

// ═══════════════════════════════════════════════════════════════════════════
// 1. Ce qui se prête, et ce qui ne se prête pas
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLa liste des traits prêtables\n');

const inconnus = TRAITS_PRETABLES.filter(id => !trait(id));
verifier('tous les traits prêtables existent', inconnus.length === 0, inconnus.join(', '));

const negatifs = TRAITS_PRETABLES.filter(id => !trait(id).positive);
verifier('aucun trait négatif ne se prête', negatifs.length === 0, negatifs.join(', '));

/*
 * Le Poissard double le score : prêté le jour de la mort, il vaudrait double
 * sans rien coûter. C'est le seul trait dont l'effet dépasse la journée, et il
 * doit rester hors de portée.
 */
verifier('le Poissard, qui double le score, ne se prête pas',
  !TRAITS_PRETABLES.includes('poissard'));

/*
 * LE CONTRÔLE PRINCIPAL : chaque trait prêtable est-il branché ?
 *
 * On relit tout le code source à la recherche des `hasTrait(..., 'id')`. Un
 * trait absent de ces appels n'a aucun effet en cours de journée : le prêter
 * ne ferait rien du tout.
 */
const sources = [];
(function balayer(d) {
  for (const nom of readdirSync(d)) {
    const chemin = join(d, nom);
    if (statSync(chemin).isDirectory()) balayer(chemin);
    else if (/\.tsx?$/.test(nom)) sources.push(readFileSync(chemin, 'utf8'));
  }
})(join(process.cwd(), 'client/src'));
const codeEntier = sources.join('\n');
const branches = new Set(
  [...codeEntier.matchAll(/hasTrait\([^,)]+,\s*'([^']+)'\)/g)].map(m => m[1]),
);
const morts = TRAITS_PRETABLES.filter(id => !branches.has(id));
verifier('chaque trait prêtable est vraiment interrogé dans le jeu',
  morts.length === 0, morts.length ? `sans effet : ${morts.join(', ')}` : `${branches.size} traits branchés`);

// ═══════════════════════════════════════════════════════════════════════════
// 2. Le trait qu'un PNJ propose
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nCe que le PNJ a à prêter\n');

verifier('un PNJ sans trait utile ne prête rien',
  traitPretable([trait('poissard'), trait('os-mousse')]) === null);
verifier('un PNJ avec un trait utile le prête',
  traitPretable([trait('os-mousse'), trait('bricoleur')])?.id === 'bricoleur');
verifier('le premier trait utile l\'emporte',
  traitPretable([trait('agile'), trait('bricoleur')])?.id === 'agile');

// ═══════════════════════════════════════════════════════════════════════════
// 3. Le prêt vit une journée, et pas une de plus
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLa durée du prêt\n');

const perso = (extra = {}) => ({
  name: 'Robert', day: 3, traits: [trait('optimiste'), trait('estomac-acier')],
  stats: { health: 60, mental: 60, hunger: 60, thirst: 60, sleep: 60, dignity: 60 },
  money: 5, respect: 0, inventory: [], activeFlags: [], location: 'gare', alive: true,
  seed: 'x', gender: 'm', stealCount: 0, ...extra,
});
const compagnon = { nom: 'Paulette', seed: 'p', gender: 'f', traitId: 'bricoleur', jour: 3 };

verifier('sans compagnon, le trait n\'est pas là',
  hasTrait(perso(), 'bricoleur') === false);
verifier('le jour du partage, le trait est prêté',
  hasTrait(perso({ compagnon }), 'bricoleur') === true);
verifier('le lendemain, le prêt a expiré',
  hasTrait(perso({ compagnon, day: 4 }), 'bricoleur') === false);
verifier('les traits propres du personnage ne bougent pas',
  hasTrait(perso({ compagnon }), 'optimiste') === true);

/*
 * Le compagnon prête un COMPORTEMENT, jamais un bonus de jauge : ceux-ci ne
 * sont appliqués qu'à la création d'un personnage. On le vérifie sur le
 * réducteur, en partageant un repas.
 */
const npc = {
  name: 'Paulette', seed: 'p', gender: 'f',
  traits: [trait('os-mousse'), trait('charismatique')],
};
const avant = {
  character: perso({ inventory: [{ id: 'pain', name: 'Pain', type: 'food', value: 2 }] }),
};
const apres = gameReducer(avant, { type: 'RESOLVE_ENCOUNTER', kind: 'share', npc });

verifier('partager son repas ramène un compagnon',
  apres.character.compagnon?.nom === 'Paulette', JSON.stringify(apres.character.compagnon));
verifier('c\'est bien son trait utile qui est prêté',
  apres.character.compagnon?.traitId === 'charismatique');
verifier('le repas est parti', apres.character.inventory.length === 0);
verifier('le prêt n\'ajoute aucun bonus de jauge',
  apres.character.stats.dignity === 62 && apres.character.stats.mental === 66,
  `dignité ${apres.character.stats.dignity}, mental ${apres.character.stats.mental} (partage seul : +2 et +6)`);

const sansTrait = gameReducer(
  { character: perso({ inventory: [{ id: 'pain', name: 'Pain', type: 'food', value: 2 }] }) },
  { type: 'RESOLVE_ENCOUNTER', kind: 'share', npc: { name: 'Gégé', seed: 'g', gender: 'm', traits: [trait('poissard'), trait('os-mousse')] } },
);
verifier('un PNJ sans rien à prêter ne laisse pas de compagnon',
  sansTrait.character.compagnon === undefined);
verifier('mais le partage rapporte quand même son moral',
  sansTrait.character.stats.mental === 66);

console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLe repas partagé achète une journée de compagnie, et rien de plus.');
process.exit(echecs ? 1 : 0);
