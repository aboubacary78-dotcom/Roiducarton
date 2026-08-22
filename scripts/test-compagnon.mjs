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
  "export { npcAt, voleurTrouvable, ennemiVoleur, JOURS_POUR_RETROUVER } from '@/contexts/GameContext';",
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

const {
  gameReducer, TRAITS, TRAITS_PRETABLES, traitPretable, hasTrait,
  npcAt, voleurTrouvable, ennemiVoleur, JOURS_POUR_RETROUVER,
} = await import(out);

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

// ═══════════════════════════════════════════════════════════════════════════
// 4. Celui qui regarde vos poches
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLe compagnon louche\n');

/*
 * L'INDICE EST TOUJOURS DONNÉ. C'est ce qui sépare un piège d'une punition :
 * un compagnon louche a forcément une phrase de la banque « louche », et un
 * compagnon honnête n'en a jamais. Sans ça, le joueur ne peut rien apprendre,
 * et une mécanique qu'on ne peut pas apprendre n'est pas une mécanique.
 */
const PHRASES_LOUCHES = [
  'looks at your bag', 'calls you "my friend"', 'tucks something under',
  'asks where you sleep', 'wears three watches', 'laughs a bit too loudly',
  'keeps standing on the side', 'quit drinking',
];
const estPhraseLouche = n => PHRASES_LOUCHES.some(p => n.situationEn.includes(p));

let croises = 0, louches = 0, indiceManquant = 0, faussAlerte = 0;
for (let s = 0; s < 900; s++) {
  for (let jour = 1; jour <= 6; jour++) {
    for (const lieu of ['centre-ville', 'gare', 'marche']) {
      const n = npcAt(jour, lieu, `j-${s}`);
      if (!n) continue;
      croises++;
      if (n.louche) { louches++; if (!estPhraseLouche(n)) indiceManquant++; }
      else if (estPhraseLouche(n)) faussAlerte++;
    }
  }
}
verifier('un compagnon louche annonce toujours la couleur',
  indiceManquant === 0, `${indiceManquant} sans indice sur ${louches}`);
verifier('et un compagnon honnête n’en emprunte jamais la phrase',
  faussAlerte === 0, `${faussAlerte} fausse(s) alerte(s)`);
const part = louches / croises;
verifier('environ un sur quatre regarde vos poches',
  part > 0.18 && part < 0.32, `${(part * 100).toFixed(1)} % sur ${croises} rencontres`);

// ═══════════════════════════════════════════════════════════════════════════
// 5. Le vol du petit matin, et ce qu'il laisse derrière
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLa nuit où il s’en va\n');

const manteau = { id: 'manteau', name: 'Manteau', emoji: '🧥', type: 'armor', value: 12, defenseBonus: 2 };
const cuillere = { id: 'cuillere', name: 'Cuillère', emoji: '🥄', type: 'junk', value: 1 };
const nuit = (c) => gameReducer(
  { character: c, screen: 'main', dayActions: 3, maxDayActions: 3, weather: 'sunny',
    eventResult: null, currentEvent: null, contract: null, daySummary: null },
  { type: 'NEXT_DAY' },
);

const voleur = { nom: 'Gaston', seed: 'g', gender: 'm', traitId: 'agile', jour: 3, louche: true };
const honnete = { ...voleur, nom: 'Odette', gender: 'f', louche: false };

let apresNuit = nuit(perso({ compagnon: voleur, inventory: [cuillere, manteau], location: 'gare' }));
verifier('il part avec ce qui vaut le plus cher',
  apresNuit.character.inventory.length === 1 && apresNuit.character.inventory[0].id === 'cuillere',
  apresNuit.character.inventory.map(i => i.id).join(', ') || 'sac vide');
verifier('la trace dit qui, où et quoi',
  apresNuit.character.vole?.nom === 'Gaston'
  && apresNuit.character.vole?.quartier === 'gare'
  && apresNuit.character.vole?.objet?.id === 'manteau',
  JSON.stringify(apresNuit.character.vole));
verifier('le bilan de nuit le raconte',
  apresNuit.daySummary.notesEn.some(n => /left before dawn/.test(n)),
  apresNuit.daySummary.notesEn.find(n => /left before dawn/.test(n)) || '');

const sacVide = nuit(perso({ compagnon: voleur, inventory: [], money: 20, location: 'gare' }));
verifier('sac vide : il se sert dans la poche',
  sacVide.character.money < 20 && sacVide.character.vole?.argent > 0,
  `${sacVide.character.money} € restants, ${sacVide.character.vole?.argent} € pris`);

const rienAPrendre = nuit(perso({ compagnon: voleur, inventory: [], money: 0, location: 'gare' }));
verifier('rien à prendre : il s’en va sans rien, et sans trace',
  rienAPrendre.character.vole === undefined);

const paisible = nuit(perso({ compagnon: honnete, inventory: [manteau], location: 'gare' }));
verifier('un compagnon honnête ne touche à rien',
  paisible.character.inventory.length === 1 && paisible.character.vole === undefined);

const veille = nuit(perso({ compagnon: { ...voleur, jour: 2 }, inventory: [manteau], location: 'gare' }));
verifier('un compagnon d’avant-hier ne vole plus rien',
  veille.character.inventory.length === 1 && veille.character.vole === undefined);

// ═══════════════════════════════════════════════════════════════════════════
// 6. Le concurrent qu’on va retrouver
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nAller le chercher\n');

const trace = { nom: 'Gaston', seed: 'g', gender: 'm', quartier: 'gare', jour: 4, objet: manteau };
verifier('on le retrouve dans le quartier où on l’a nourri',
  voleurTrouvable({ location: 'gare', day: 4, vole: trace }) === true);
verifier('ailleurs, personne',
  voleurTrouvable({ location: 'marche', day: 4, vole: trace }) === false);
verifier(`au-delà de ${JOURS_POUR_RETROUVER} jours, il a revendu et disparu`,
  voleurTrouvable({ location: 'gare', day: 4 + JOURS_POUR_RETROUVER, vole: trace }) === false);
verifier('sans vol, aucun concurrent à chercher',
  voleurTrouvable({ location: 'gare', day: 4 }) === false);

const adversaire = ennemiVoleur(trace);
verifier('son butin est exactement ce qu’il avait pris',
  adversaire.loot.item?.id === 'manteau', JSON.stringify(adversaire.loot));
verifier('c’est un humain, pas un rat — motif d’esquive « rival »',
  adversaire.emoji === '💢' && adversaire.name === 'Gaston');

/*
 * La trace s'efface quand le combat COMMENCE, pas à la victoire : on ne
 * retente pas sa chance jusqu'à gagner.
 */
const enCombat = gameReducer(
  { character: perso({ vole: trace }), screen: 'main', combatLog: [] },
  { type: 'START_COMBAT', enemy: adversaire, contreVoleur: true },
);
verifier('la trace s’efface dès que le combat commence',
  enCombat.character.vole === undefined && enCombat.screen === 'combat');

const combatOrdinaire = gameReducer(
  { character: perso({ vole: trace }), screen: 'main', combatLog: [] },
  { type: 'START_COMBAT', enemy: adversaire },
);
verifier('une bagarre ordinaire n’efface pas la trace',
  combatOrdinaire.character.vole?.nom === 'Gaston');

console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nOn nourrit qui on veut, mais on paie ce qu’on n’a pas su lire.');
process.exit(echecs ? 1 : 0);
