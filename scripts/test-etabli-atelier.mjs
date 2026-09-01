/*
 * L'ÉTABLI, LE CADEAU DU VENDEUR ET LES MESURES.
 *
 * Trois mécaniques ajoutées en même temps, et elles partagent un risque : ce
 * sont des promesses tenues PLUS TARD. Une promesse qui ne se tient pas se
 * lit comme un appât, et c'est exactement le reproche qu'un joueur écrit dans
 * un commentaire du Play Store.
 *
 *   ① L'ÉTABLI garde le visage composé pendant l'essai libre et non payé. Le
 *     danger n'est pas qu'il l'oublie, c'est qu'il le rende à QUELQU'UN
 *     D'AUTRE : la graine du personnage doit être vérifiée avant de poser un
 *     visage sur une tête. Un visage rendu au mauvais mort serait pire que
 *     pas de visage du tout.
 *
 *   ② LE CADEAU du vendeur doit rester un cadeau : donné une fois, sans
 *     contrepartie, et surtout sans marcher sur un succès. S'il devenait la
 *     récompense d'un succès, il retirerait au joueur la raison d'aller le
 *     chercher et laisserait dans la liste un succès dont le lot est déjà au
 *     cou.
 *
 *   ③ LES MESURES ne doivent jamais rien casser. Une mesure qui fait tomber
 *     un achat coûte infiniment plus qu'elle ne rapporte.
 *
 *     node scripts/test-etabli-atelier.mjs
 */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'etabli-atelier-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, [
  "export { gameReducer } from '@/contexts/GameContext';",
  "export * from '@/lib/etabli';",
  "export * from '@/lib/mesures';",
  "export { offrirAccessoire, loadProfile } from '@/lib/profile';",
  "export { ACCESSORIES, ACHIEVEMENTS, achievementForAccessory } from '@/lib/cosmetics';",
].join('\n'));

const out = join(process.cwd(), '.bundle-test-etabli-atelier.mjs');
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

const M = await import(out);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. L'établi : ce qui sèche, et à qui ça appartient
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nL\'établi\n');

memoire.clear();
verifier('un établi vide ne promet rien', M.cequiSeche() === null);

const compo = { skin: 3, hair: 7, beard: 1 };
M.poserSurEtabli({ seed: 'graine-a', nom: 'Marcel', genre: 'm', visage: compo });
const pose = M.cequiSeche();
verifier('une composition abandonnée est gardée',
  !!pose && pose.seed === 'graine-a' && pose.visage.hair === 7,
  JSON.stringify(pose?.visage));

verifier('elle est rendue au personnage dont c\'est la tête',
  M.cequiSechePour('graine-a')?.nom === 'Marcel');

/*
 * LE CONTRÔLE QUI COMPTE.
 *
 * Une graine qui ne correspond plus veut dire que le personnage est mort et
 * qu'un autre a pris sa place. La promesse ne peut plus être tenue : on la
 * retire au lieu de l'afficher sur une tête à laquelle elle n'appartient pas.
 */
verifier('elle n\'est PAS rendue à quelqu\'un d\'autre',
  M.cequiSechePour('graine-b') === null);
verifier('  …et l\'établi se vide de lui-même dans ce cas',
  M.cequiSeche() === null,
  'sinon la promesse morte resterait en mémoire pour toujours');

// Une composition vide n'est pas une composition : rien à promettre.
M.poserSurEtabli({ seed: 'graine-c', nom: 'Huguette', genre: 'f', visage: {} });
verifier('« ne rien toucher » ne pose rien sur l\'établi', M.cequiSeche() === null);

// ═══════════════════════════════════════════════════════════════════════════
// 2. L'étiquette du hub : une fois, jamais deux
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nL\'étiquette\n');

memoire.clear();
verifier('elle n\'est pas écartée au départ', M.etiquetteEcartee() === false);
M.ecarterEtiquette();
verifier('écartée, elle le reste', M.etiquetteEcartee() === true);
M.poserSurEtabli({ seed: 'graine-d', nom: 'Simone', genre: 'f', visage: { skin: 1 } });
verifier('  …même quand une NOUVELLE composition est abandonnée',
  M.etiquetteEcartee() === true,
  'un rappel est utile, trois sont du harcèlement');

// ═══════════════════════════════════════════════════════════════════════════
// 3. Le visage rendu au personnage vivant
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nCe que l\'achat rend\n');

const perso = {
  seed: 'graine-a', name: 'Marcel', gender: 'm',
  stats: { health: 50, mental: 50, hunger: 50, thirst: 50, sleep: 50, dignity: 50 },
  traits: [], traitsChoisis: false,
};
const etat = { character: perso };

const apres = M.gameReducer(etat, { type: 'POSER_VISAGE', seed: 'graine-a', visage: compo });
verifier('le visage payé se pose sur le personnage vivant',
  apres.character.visage?.hair === 7,
  JSON.stringify(apres.character.visage));

const mauvais = M.gameReducer(etat, { type: 'POSER_VISAGE', seed: 'graine-z', visage: compo });
verifier('il ne se pose PAS sur une autre tête',
  mauvais.character.visage === undefined,
  'la graine est revérifiée dans le reducer, pas seulement par l\'appelant');

const vide = M.gameReducer(etat, { type: 'POSER_VISAGE', seed: 'graine-a', visage: {} });
verifier('une composition vide ne remplace rien', vide.character.visage === undefined);

/*
 * LES TRAITS NE PASSENT PAS PAR LÀ, ET C'EST DÉLIBÉRÉ.
 *
 * Ils touchent aux règles. Les changer au milieu d'une partie déjà entamée
 * réécrirait sa difficulté après coup, et donnerait au joueur qui a refusé de
 * payer un moyen de choisir ses traits une fois la partie jugée.
 */
verifier('  …et les traits, eux, ne changent pas',
  apres.character.traitsChoisis === false && apres.character.traits.length === 0,
  `traitsChoisis ${apres.character.traitsChoisis}`);

// ═══════════════════════════════════════════════════════════════════════════
// 4. Le cadeau du vendeur
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLe cadeau\n');

memoire.clear();
const jeton = M.ACCESSORIES.find(a => a.id === 'jeton-marche');
verifier('le jeton du marché existe', !!jeton && jeton.slot === 'neck', jeton?.name);

/*
 * L'INVARIANT QUI PROTÈGE LA GARDE-ROBE.
 *
 * Offrir la récompense d'un succès reviendrait à retirer au joueur la raison
 * d'aller la chercher, et à laisser dans la liste un succès dont le lot est
 * déjà au cou. Le seul accessoire qu'on donne doit donc n'appartenir à aucun.
 */
verifier('  …et il n\'est la récompense d\'AUCUN succès',
  M.achievementForAccessory('jeton-marche') === undefined
  && !M.ACHIEVEMENTS.some(a => a.reward === 'jeton-marche'));
verifier('  …et il dit d\'où il vient, faute de succès à nommer',
  !!jeton?.source && !!jeton?.sourceEn,
  `${jeton?.source} / ${jeton?.sourceEn}`);

verifier('le donner la première fois compte', M.offrirAccessoire('jeton-marche') === true);
verifier('  …et le redonner ne compte pas', M.offrirAccessoire('jeton-marche') === false);
verifier('  …et il n\'apparaît qu\'une fois dans la garde-robe',
  M.loadProfile().unlocked.filter(x => x === 'jeton-marche').length === 1);

/*
 * Le reste de la garde-robe reste gagné, jamais donné : le cadeau ne doit pas
 * servir de raccourci vers les cinquante autres.
 */
const sansSucces = M.ACCESSORIES.filter(a => !M.ACHIEVEMENTS.some(s => s.reward === a.id));
verifier('un seul accessoire échappe aux succès, et c\'est celui-là',
  sansSucces.length === 1 && sansSucces[0].id === 'jeton-marche',
  sansSucces.map(a => a.id).join(', ') || 'aucun');

// ═══════════════════════════════════════════════════════════════════════════
// 5. Les mesures
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLes mesures\n');

memoire.clear();
M.mesurer('boutique_vue', 'hub');
M.mesurer('boutique_vue', 'hub');
M.mesurer('boutique_vue', 'mort');
const c = M.lireMesures();
verifier('chaque porte se compte séparément',
  c['boutique_vue:hub'] === 2 && c['boutique_vue:mort'] === 1,
  JSON.stringify(c));

M.versLaBoutique('interstitiel');
verifier('la provenance se pose puis se ramasse', M.porteEmpruntee() === 'interstitiel');
verifier('  …et elle se consomme, un retour arrière ne la recompte pas',
  M.porteEmpruntee() === 'inconnue');

/*
 * LA DÉGUSTATION, ET LE SEUL CHIFFRE QUI VAILLE POUR ELLE : l'achat qui tombe
 * DANS la fenêtre. Un achat trois jours plus tard ne vient pas de l'effet de
 * dotation, et le compter serait s'attribuer une conversion qu'on n'a pas
 * produite.
 */
memoire.clear();
const t0 = 1_000_000;
M.noterDegustation(t0);
M.noterAchatApresDegustation(600_000, t0 + 60_000);
verifier('un achat dans les dix minutes est attribué à la dégustation',
  M.lireMesures()['achat_dans_les_10_min'] === 1);
M.noterAchatApresDegustation(600_000, t0 + 3 * 24 * 3600_000);
verifier('  …un achat trois jours plus tard ne l\'est pas',
  M.lireMesures()['achat_dans_les_10_min'] === 1,
  'sinon on s\'attribue une conversion qu\'on n\'a pas produite');

/*
 * ET RIEN NE TOMBE QUAND LE STOCKAGE REFUSE. Navigation privée, quota plein,
 * réglage du navigateur : une mesure qui lève ferait échouer l'achat qu'elle
 * observait.
 */
const vrai = globalThis.localStorage;
globalThis.localStorage = {
  getItem() { throw new Error('refusé'); },
  setItem() { throw new Error('refusé'); },
  removeItem() { throw new Error('refusé'); },
};
let leve = false;
try {
  M.mesurer('achat_abouti', 'noads');
  M.noterDegustation();
  M.noterAchatApresDegustation(600_000);
  M.poserSurEtabli({ seed: 'x', nom: 'x', genre: 'm', visage: { skin: 1 } });
  M.cequiSeche();
  M.etiquetteEcartee();
  M.ecarterEtiquette();
} catch { leve = true; }
globalThis.localStorage = vrai;
verifier('un stockage qui refuse ne casse ni la mesure ni l\'établi', leve === false);

console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nCe qu\'on promet plus tard, on le rend, et à la bonne personne.');
process.exit(echecs ? 1 : 0);
