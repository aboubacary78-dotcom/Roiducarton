/*
 * LA PLANCHE DES ÉTATS — ce que le visage dit de ce qui se passe.
 *
 * Les deux axes d'état (la condition, tirée des jauges ; la dignité) sont ce
 * que le joueur regarde le plus souvent : le portrait est en haut de l'écran
 * tout le temps. Quatre vignettes n'ont pas suffi à les juger — un axe
 * CONTINU se juge sur toute son étendue, et surtout aux tailles réelles.
 *
 * Trois choses qu'une grille montre et qu'une paire d'exemples cache :
 *
 *   · LES PALIERS MORTS. Si rien ne bouge entre 0,35 et 0,70, les deux tiers
 *     de la course ne disent rien, et le joueur croit le portrait figé.
 *   · LES MARCHES. Un signe qui apparaît d'un coup à un seuil se lit comme un
 *     bug, pas comme une dégradation.
 *   · LA TAILLE. Ce qui se lit à 96 px peut n'être qu'un pixel sale à 40 —
 *     et 40, c'est la taille du hub.
 *
 *     pnpm planche-etat [sortie.png]
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { createElement } from 'react';
import puppeteer from 'puppeteer-core';
import CardboardAvatar from '../client/src/components/game/CardboardAvatar';

const sortie = process.argv[2] ?? '/tmp/etats.png';
const GRAINE = 'sdf-45';
/*
 * ON FIXE LES TRAITS QUI GÊNENT LA MESURE.
 *
 * La première version de cette planche jugeait les paupières sur un visage
 * dont les yeux sont DÉJÀ deux traits horizontaux, et la barbe de trois jours
 * sur un menton qui portait déjà un bouc blanc. On ne mesurait rien. Regard
 * rond, tête nue, menton rasé : le calque d'état n'a plus où se cacher.
 */
const NEUTRE = { eyes: 1, beard: 0, hat: 0, glasses: 0, hairstyle: 1 };

const rendu = (props: Parameters<typeof CardboardAvatar>[0]) =>
  renderToStaticMarkup(createElement(CardboardAvatar, props));
const vignette = (c: string, l: string) =>
  `<figure><div>${c}</div><figcaption>${l}</figcaption></figure>`;
const bloc = (t: string, c: string) =>
  `<section><h2>${t}</h2><div class="grille">${c}</div></section>`;

// ① Les cinq jauges ensemble, de bout en bout. Onze crans : aucun palier ne
//    peut se cacher entre deux exemples.
const CRANS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const toutes = (v: number) => ({ health: v, mental: v, hunger: v, thirst: v, sleep: v });
const condition = CRANS.map(v =>
  vignette(rendu({ seed: GRAINE, gender: 'm', size: 88, visage: NEUTRE, jauges: toutes(v), dignity: 80 }), String(v))
).join('');

/*
 * ①bis CHAQUE JAUGE SEULE, LES QUATRE AUTRES AU MAXIMUM.
 *
 * C'est LE contrôle du nouveau calque : si les cinq colonnes se ressemblent,
 * le visage dit la gravité et rien d'autre — exactement ce qu'on reprochait à
 * la moyenne. Elles doivent se distinguer d'un coup d'œil.
 */
const JAUGES = ['sleep', 'hunger', 'thirst', 'mental', 'health'] as const;
const isolees = JAUGES.map(j => {
  const t = { fr: { sleep: 'sommeil', hunger: 'faim', thirst: 'soif', mental: 'mental', health: 'santé' } }.fr[j];
  return [0, 25, 50].map(v =>
    vignette(rendu({ seed: GRAINE, gender: 'm', size: 88, visage: NEUTRE, jauges: { ...toutes(100), [j]: v }, dignity: 85 }), `${t} ${v}`)
  ).join('');
}).join('');

// ② La dignité seule, de bout en bout.
const dignite = CRANS.map(d =>
  vignette(rendu({ seed: GRAINE, gender: 'm', size: 88, visage: NEUTRE, jauges: toutes(85), dignity: d }), String(d))
).join('');

// ③ Les deux ensemble, à la taille du hub — là où ça se joue vraiment.
const croix = [10, 40, 70, 100].map(c =>
  [10, 40, 70, 100].map(d =>
    vignette(rendu({ seed: GRAINE, gender: 'm', size: 44, visage: NEUTRE, jauges: toutes(c), dignity: d }), `${c}/${d}`)
  ).join('')
).join('');

// ④ Le pire état, à toutes les tailles du jeu.
const tailles = [32, 40, 56, 88, 130].map(t =>
  vignette(rendu({ seed: GRAINE, gender: 'm', size: t, visage: NEUTRE, jauges: toutes(5), dignity: 5 }), `${t}px`)
).join('');

const html = `<style>
  body { margin: 0; padding: 16px; background: #fff; font: 12px system-ui, sans-serif; color: #333; }
  h2 { font-size: 13px; margin: 18px 0 8px; text-transform: uppercase; letter-spacing: .08em; color: #777; }
  .grille { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; }
  figure { margin: 0; text-align: center; }
  figcaption { font-size: 9px; color: #999; margin-top: 3px; }
</style>
${bloc('Les cinq jauges ensemble — 0 → 100 (dignité 80)', condition)}
${bloc('Chaque jauge seule, les autres au maximum', isolees)}
${bloc('Dignité — 0 → 100 (jauges à 85)', dignite)}
${bloc('Jauges × dignité, à 44 px (taille du hub)', croix)}
${bloc('Le pire état, à toutes les tailles', tailles)}`;

const page = '/tmp/planche-etat.html';
writeFileSync(page, html);
const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const p = await b.newPage();
await p.setViewport({ width: 1060, height: 900, deviceScaleFactor: 2 });
await p.goto(`file://${page}`, { waitUntil: 'load' });
await p.screenshot({ path: sortie, fullPage: true });
await b.close();
console.log(`planche écrite : ${sortie}`);
