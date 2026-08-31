/*
 * LES PIQUES : TRENTE PHRASES QUI DOIVENT TENIR DANS UN TOAST.
 *
 * Ce fichier-ci est du texte, donc rien ne peut « planter ». C'est exactement
 * pour ça qu'il a besoin d'un contrôle : ses défauts sont tous silencieux.
 *
 *   · LA LONGUEUR. Un toast vit deux secondes en haut de l'écran pendant que
 *     le pouce travaille en bas. Une phrase de vingt mots n'est pas lue, elle
 *     est vue, puis elle disparaît, et le joueur a juste l'impression qu'on
 *     lui a caché quelque chose. Douze mots, dans les DEUX langues : la
 *     traduction anglaise est le côté qui déborde, toujours.
 *   · LES DOUBLONS. Trente phrases écrites d'affilée sur cinq thèmes voisins,
 *     ça se répète sans qu'on s'en rende compte.
 *   · LE DÉBIT. Une pique par action est un tic, et un tic ne se lit plus. Le
 *     verrou de trente secondes est ce qui sépare une vanne d'un bavardage.
 *   · LA RÉPÉTITION. Six phrases tirées au hasard en redonnent une sur six ;
 *     l'effet de répétition arrive bien avant qu'on ait fait le tour.
 *
 *     npx tsx scripts/test-piques.ts
 */
import { PIQUES, piquer, reinitialiserPiques, type CategoriePique, type Contexte } from '../client/src/contexts/data/piques';

let echecs = 0;
const verifier = (nom: string, ok: boolean, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

const CATEGORIES = Object.keys(PIQUES) as CategoriePique[];
const toutes = CATEGORIES.flatMap(c => PIQUES[c]);

// ── La forme du lot ────────────────────────────────────────────────────────
/*
 * ON COMPTE LES BANQUES VIDES, PAS LES CATÉGORIES.
 *
 * Ce contrôle exigeait EXACTEMENT cinq catégories. Il a donc échoué à
 * l'arrivée de la sixième (« tête qui part ») alors que rien n'était cassé :
 * il mesurait un chiffre que le jeu a le droit de faire grandir.
 *
 * Ce qui doit tenir, c'est qu'aucune catégorie DÉCLARÉE ne soit vide : une
 * catégorie sans phrases se branche sans erreur, ne dit jamais rien, et
 * personne ne s'en aperçoit avant de chercher pourquoi le jeu se tait.
 */
const vides = CATEGORIES.filter(c => (PIQUES[c] ?? []).length === 0);
verifier(`${CATEGORIES.length} catégories, toutes garnies`,
  vides.length === 0, vides.length ? `vides : ${vides.join(', ')}` : CATEGORIES.join(', '));
const tailles = CATEGORIES.map(c => PIQUES[c].length);
verifier('au moins six phrases par catégorie', tailles.every(n => n >= 6), tailles.join(' / '));

// ── Douze mots maximum, dans les deux langues ──────────────────────────────
const mots = (s: string) => s.trim().split(/\s+/).length;
const trop = toutes.flatMap(p => [
  ...(mots(p.fr) > 12 ? [`fr(${mots(p.fr)}) « ${p.fr} »`] : []),
  ...(mots(p.en) > 12 ? [`en(${mots(p.en)}) « ${p.en} »`] : []),
]);
const plusLongue = Math.max(...toutes.map(p => Math.max(mots(p.fr), mots(p.en))));
verifier('douze mots maximum, français ET anglais',
  trop.length === 0, trop.slice(0, 3).join(' | ') || `la plus longue en fait ${plusLongue}`);

/* ── LA FORME DOIT VARIER ──────────────────────────────────────────────────
 *
 * Ce contrôle demandait l'inverse : que TOUTES les phrases aient leur chute en
 * deuxième phrase. C'était une règle d'écriture, elle a été respectée trente
 * fois sur trente, et le résultat n'était pas percutant, parce qu'une
 * structure qu'on voit venir dès la deuxième vanne ne surprend plus personne.
 * Le test verrouillait donc exactement le défaut qu'on cherchait à éviter.
 *
 * On mesure maintenant le contraire : qu'il y ait des phrases d'un seul bloc
 * ET des phrases en deux temps, sans qu'une forme écrase l'autre.
 */
const enDeuxTemps = toutes.filter(p => /[.!?…]\s+\S/.test(p.fr)).length;
const dUnBloc = toutes.length - enDeuxTemps;
verifier('les deux formes cohabitent',
  dUnBloc >= 4 && enDeuxTemps >= 15,
  `${dUnBloc} d'un bloc, ${enDeuxTemps} en deux temps`);

// Et aucune ne s'adoucit : un mot de prudence désamorce une vanne.
const ADOUCISSANTS = /\b(presque|un peu|assez|plutôt|quelque part|peut-être)\b/i;
const molles = toutes.filter(p => ADOUCISSANTS.test(p.fr));
verifier('aucun adoucissant', molles.length === 0,
  molles.slice(0, 2).map(p => p.fr).join(' | '));

// ── Aucun doublon ──────────────────────────────────────────────────────────
const fr = toutes.map(p => p.fr.toLowerCase());
const en = toutes.map(p => p.en.toLowerCase());
verifier('aucune phrase en double',
  new Set(fr).size === toutes.length && new Set(en).size === toutes.length,
  `${new Set(fr).size} fr / ${new Set(en).size} en distinctes sur ${toutes.length}`);

// ── Chaque phrase est traduite ─────────────────────────────────────────────
verifier('tout est traduit', toutes.every(p => p.fr.trim() && p.en.trim()));

/* ── LA COHÉRENCE : UNE PIQUE DOIT PARLER DE CE QUI VIENT D'ARRIVER ───────
 *
 * C'est le défaut que le premier joueur a relevé, et il était de conception :
 * les phrases étaient tirées AU HASARD dans un sac, quelle que soit la
 * situation. On pouvait mourir de soif et s'entendre parler du froid, ou lire
 * « le carton a pris l'eau » après une nuit sèche. Une vanne à côté ne rate
 * pas de peu : elle apprend au joueur que le jeu ne regarde rien, et il cesse
 * de les lire, toutes les autres tombent avec elle.
 *
 * Ces contrôles-ci sont donc les plus importants du fichier.
 */
reinitialiserPiques();
let horloge = 5_000_000;
const tirer = (cat: CategoriePique, ctx: Contexte) => {
  horloge += 31_000;
  return piquer(cat, ctx, horloge);
};

// ① Chaque jauge critique tire une phrase qui parle D'ELLE.
const ATTENDU: Record<string, RegExp> = {
  hunger: /estomac|pigeon mange/i,
  thirst: /langue|fontaine/i,
  sleep: /cligné|debout/i,
  health: /évanouir|impôts/i,
  mental: /relisez|tête/i,
};
const horsSujet: string[] = [];
for (const jauge of Object.keys(ATTENDU)) {
  for (let i = 0; i < 30; i++) {
    const p = tirer('sante-critique', { jauge });
    if (!p) { horsSujet.push(`${jauge} : rien`); break; }
    if (!ATTENDU[jauge].test(p.fr)) horsSujet.push(`${jauge} → « ${p.fr} »`);
  }
}
verifier('la jauge qui lâche est toujours celle dont on parle',
  horsSujet.length === 0, horsSujet.slice(0, 3).join(' | '));

// ② Une nuit sèche et reposante ne mérite aucun commentaire.
const nuitDouce = tirer('reveil', { meteo: 'clear', sommeil: 4 });
verifier('après une bonne nuit, le jeu se tait',
  nuitDouce === null, nuitDouce ? `il a sorti « ${nuitDouce.fr} »` : '');

// ③ Une nuit sous la pluie parle de la pluie.
const nuitPluie = tirer('reveil', { meteo: 'rainy', sommeil: -6 });
verifier('après une nuit de pluie, il parle de l\'eau ou du dos',
  !!nuitPluie && /eau|plu|dos|sommeil|dormi/i.test(nuitPluie.fr),
  nuitPluie?.fr ?? 'rien');

// ④ Zéro n'est pas « presque rien » : « encadrez-le » n'a aucun sens quand on
//    est reparti les mains vides.
const rienDuTout = tirer('gain-miserable', { gain: 0 });
verifier('les mains vides, on ne parle pas d\'encadrer un centime',
  !!rienDuTout && !/encadrez|centime de l/i.test(rienDuTout.fr), rienDuTout?.fr ?? 'rien');
const unCentime = tirer('gain-miserable', { gain: 1 });
verifier('avec un centime, on en parle',
  !!unCentime && /centime|baguette/i.test(unCentime.fr), unCentime?.fr ?? 'rien');

/* ── LE DÉBIT ──────────────────────────────────────────────────────────────
 *
 * On avance une horloge fictive plutôt que d'attendre trente secondes : le
 * test doit mesurer la RÈGLE, pas la patience de celui qui le lance.
 */
reinitialiserPiques();
let t = 1_000_000;
const premiere = piquer('reveil', { meteo: 'rainy', sommeil: -6 }, t);
verifier('la première pique passe', premiere !== null);
verifier('la deuxième, une seconde après, est retenue', piquer('vol-rate', {}, t + 1000) === null);
verifier('  …et ce, quelle que soit la catégorie', piquer('reveil', { meteo: 'rainy' }, t + 29_000) === null);
verifier('trente secondes plus tard, ça repasse', piquer('reveil', { meteo: 'rainy' }, t + 30_000) !== null);

/* ── LA RÉPÉTITION ─────────────────────────────────────────────────────────
 *
 * Jamais deux fois la même phrase d'affilée dans une catégorie. On tire
 * beaucoup, en avançant l'horloge à chaque coup pour ne pas se faire brider.
 */
reinitialiserPiques();
t = 2_000_000;
const suite: string[] = [];
for (let i = 0; i < 200; i++) {
  const p = piquer('gain-miserable', { gain: 1 }, t);
  t += 31_000;
  if (p) suite.push(p.fr);
}
const colles = suite.filter((s, i) => i > 0 && s === suite[i - 1]);
verifier(`aucune répétition immédiate sur ${suite.length} tirages`,
  colles.length === 0, colles.slice(0, 2).join(' | '));
verifier('toutes les phrases qui collent finissent par sortir',
  new Set(suite).size === PIQUES['gain-miserable'].filter(p => !p.quand || p.quand({ gain: 1 })).length,
  `${new Set(suite).size} phrases distinctes vues`);

console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nTrente vannes, courtes, et qui savent se taire.');
process.exit(echecs ? 1 : 0);
