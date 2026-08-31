/*
 * LE VISAGE DIT-IL VRAIMENT L'ÉTAT ?
 *
 * Ce calque a été refait après une plainte simple : « c'est le point noir du
 * personnage ». La grille de onze crans a montré pourquoi, de 0 à 30, quatre
 * visages identiques ; de 40 à 70, rien ; de 80 à 100, identiques. Un axe
 * continu avec trois valeurs.
 *
 * Le défaut n'était visible NULLE PART dans le code : chaque seuil, pris
 * isolément, se lisait comme une intention. C'est en rendant la série entière
 * qu'il saute aux yeux. Un test qui rend la série et compare les voisins
 * attrape donc ce que ni TypeScript ni une relecture ne peuvent attraper, et
 * il l'attrapera encore quand quelqu'un remettra un `if (x < 0.34)` en croyant
 * bien faire.
 *
 * Trois exigences :
 *
 *   ① AUCUNE ZONE MORTE. Deux crans voisins doivent produire deux dessins
 *     différents, sur TOUTE la course. C'est la définition d'un axe continu.
 *   ② LA CAUSE, PAS SEULEMENT LA GRAVITÉ. Cinq jauges au plus bas, une par
 *     une, doivent donner cinq visages distincts, sinon on est revenu à la
 *     moyenne, qui ne pouvait dire que « ça va mal ».
 *   ③ AUCUN NOMBRE CASSÉ. Une interpolation ratée écrit `NaN` dans un
 *     attribut SVG : le navigateur ignore la forme en silence, et le signe
 *     disparaît sans que rien ne plante.
 *
 *     pnpm test-etat
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import CardboardAvatar, { type JaugesVisage } from '../client/src/components/game/CardboardAvatar';

let echecs = 0;
const verifier = (nom: string, ok: boolean, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

const GRAINE = 'controle-etat';
// Regard rond et menton rasé : les paupières et la barbe de trois jours ne
// peuvent pas se cacher derrière un trait déjà horizontal ou un bouc.
const NEUTRE = { eyes: 1, beard: 0, hat: 0, glasses: 0, hairstyle: 1 };
const toutes = (v: number): JaugesVisage => ({ health: v, mental: v, hunger: v, thirst: v, sleep: v });

const rendu = (jauges: JaugesVisage, dignity: number) =>
  renderToStaticMarkup(createElement(CardboardAvatar, {
    seed: GRAINE, gender: 'm', size: 96, visage: NEUTRE, jauges, dignity,
  }));

/*
 * COMBIEN DEUX DESSINS DIFFÈRENT.
 *
 * L'inégalité de chaîne ne suffit pas : une opacité qui bouge d'un millième
 * suffirait à la satisfaire alors que rien ne se voit. On compte les JETONS
 * qui changent, un jeton, c'est une coordonnée, une couleur, une opacité,
 * et on exige qu'il y en ait plusieurs.
 */
function ecart(a: string, b: string): number {
  const ja = a.split(/[\s"=]+/), jb = b.split(/[\s"=]+/);
  const n = Math.max(ja.length, jb.length);
  let d = 0;
  for (let i = 0; i < n; i++) if (ja[i] !== jb[i]) d++;
  return d;
}

// ── ① Aucune zone morte, sur les deux axes ────────────────────────────────
const CRANS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const MINIMUM = 3;

for (const [nom, faire] of [
  ['les jauges', (v: number) => rendu(toutes(v), 80)],
  ['la dignité', (v: number) => rendu(toutes(85), v)],
] as const) {
  const morts: string[] = [];
  let plusFaible = Infinity;
  for (let i = 1; i < CRANS.length; i++) {
    const d = ecart(faire(CRANS[i - 1]), faire(CRANS[i]));
    plusFaible = Math.min(plusFaible, d);
    if (d < MINIMUM) morts.push(`${CRANS[i - 1]}→${CRANS[i]} (${d})`);
  }
  verifier(`${nom} : aucun palier mort sur toute la course`,
    morts.length === 0,
    morts.length ? `identiques ou presque : ${morts.join(', ')}` : `écart minimal ${plusFaible} jetons`);
}

// ── ② Chaque jauge écrit son propre signe ─────────────────────────────────
/*
 * PIÈGE ÉVITÉ ICI : comparer une jauge basse à un visage en forme ne prouve
 * rien, ça montre seulement que « bas » diffère de « haut ». Ce sont les cinq
 * jauges basses ENTRE ELLES qu'il faut comparer.
 */
const JAUGES = ['sleep', 'hunger', 'thirst', 'mental', 'health'] as const;
const dessins = new Map<string, string>();
for (const j of JAUGES) dessins.set(j, rendu({ ...toutes(100), [j]: 0 }, 85));

const confondues: string[] = [];
let leMoinsSepare = Infinity;
for (let i = 0; i < JAUGES.length; i++) {
  for (let k = i + 1; k < JAUGES.length; k++) {
    const d = ecart(dessins.get(JAUGES[i])!, dessins.get(JAUGES[k])!);
    leMoinsSepare = Math.min(leMoinsSepare, d);
    if (d < MINIMUM) confondues.push(`${JAUGES[i]}/${JAUGES[k]}`);
  }
}
verifier('les cinq jauges donnent cinq visages distincts',
  confondues.length === 0,
  confondues.length ? `confondues : ${confondues.join(', ')}` : `paire la plus proche : ${leMoinsSepare} jetons`);

/*
 * Et chacune doit se distinguer du visage en forme, sinon une jauge pourrait
 * différer des quatre autres tout en ne dessinant rien du tout.
 */
const enForme = rendu(toutes(100), 85);
const muettes = JAUGES.filter(j => ecart(dessins.get(j)!, enForme) < MINIMUM);
verifier('  …et chacune se voit par rapport au visage en forme',
  muettes.length === 0, muettes.length ? `sans effet : ${muettes.join(', ')}` : '');

// ── ③ Aucun nombre cassé, nulle part ──────────────────────────────────────
const casses: string[] = [];
for (const v of CRANS) {
  for (const d of CRANS) {
    const m = rendu(toutes(v), d);
    if (/NaN|Infinity|undefined/.test(m)) casses.push(`jauges ${v} / dignité ${d}`);
  }
}
verifier('aucun attribut SVG cassé sur les 121 combinaisons',
  casses.length === 0, casses.slice(0, 3).join(' · '));

/*
 * ── ④ ET LE VISAGE SANS ÉTAT RESTE INTACT ────────────────────────────────
 *
 * Les passants n'ont pas de jauges. S'ils héritaient d'un teint blafard parce
 * qu'une valeur manquante vaut zéro quelque part, toute la rue aurait l'air
 * mourante, et c'est exactement le genre de défaut qu'on ne remarque qu'en
 * comparant deux écrans.
 */
const passant = renderToStaticMarkup(createElement(CardboardAvatar, { seed: GRAINE, gender: 'm', size: 96, visage: NEUTRE }));
verifier('un passant sans jauges n\'a ni cerne, ni sueur, ni pâleur',
  ecart(passant, enForme) > 0 && !/8FB8D8/.test(passant) && !/6E5A4E/.test(passant),
  /8FB8D8/.test(passant) ? 'il transpire sans raison' : '');

console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLe visage dit la gravité ET la cause, sans palier mort.');
process.exit(echecs ? 1 : 0);
