/*
 * LA PLANCHE DE CONTACT DES VISAGES.
 *
 * Un portrait généré ne se juge pas au code : il se juge à l'œil, et en
 * nombre. Un visage isolé peut être charmant pendant que la série entière se
 * ressemble — c'est justement le défaut que la lecture du fichier ne montre
 * jamais.
 *
 * Ce script rend une grille de visages tirés de vraies graines, aux tailles
 * où le jeu les affiche, et l'écrit en PNG. On regarde, on corrige, on
 * regarde à nouveau.
 *
 * Il passe par esbuild et non par `tsx` : le tsconfig du projet est en
 * `jsx: "preserve"` — c'est Vite qui transforme le JSX — et `tsx` le suit,
 * donc il produit du `React.createElement` sans React en portée. Une ligne
 * plutôt qu'un second tsconfig à maintenir.
 *
 * Le bundle doit rester DANS le dépôt : `--packages=external` laisse les
 * imports nus, que Node résout depuis le dossier du fichier de sortie — écrit
 * dans /tmp, il ne trouve aucun node_modules.
 *
 *     pnpm planche [sortie.png]
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { createElement } from 'react';
import puppeteer from 'puppeteer-core';
import CardboardAvatar from '../client/src/components/game/CardboardAvatar';

const sortie = process.argv[2] ?? '/tmp/visages.png';

// Des graines quelconques mais stables : la planche doit être comparable
// d'une version à l'autre, sinon « c'est mieux » ne veut rien dire.
const graines = Array.from({ length: 24 }, (_, i) => `sdf-${i * 7 + 3}`);

const vignette = (contenu: string, legende: string) =>
  `<figure><div>${contenu}</div><figcaption>${legende}</figcaption></figure>`;

const bloc = (titre: string, corps: string) =>
  `<section><h2>${titre}</h2><div class="grille">${corps}</div></section>`;

const rendu = (props: Parameters<typeof CardboardAvatar>[0]) =>
  renderToStaticMarkup(createElement(CardboardAvatar, props));

// ① La série : 24 inconnus, à la taille des rencontres de rue.
const serie = graines.map((g, i) =>
  vignette(rendu({ seed: g, gender: i % 3 === 0 ? 'f' : 'm', size: 96 }), g)
).join('');

// ② Les tailles réelles du jeu, sur une même tête : 32 (compagnon), 40 (hub),
//    56 (rencontre), 96 (atelier). Ce qui tient à 96 peut disparaître à 32.
const tailles = [32, 40, 56, 96, 140].map(t =>
  vignette(rendu({ seed: 'sdf-31', gender: 'm', size: t }), `${t}px`)
).join('');

// ③ Les deux axes d'état, du pire au meilleur.
const etats = [
  { condition: 0.08, dignity: 10, l: 'ruine' },
  { condition: 0.3, dignity: 40, l: 'mal' },
  { condition: 0.6, dignity: 70, l: 'moyen' },
  { condition: 0.95, dignity: 95, l: 'forme' },
].map(e => vignette(rendu({ seed: 'sdf-17', gender: 'm', size: 96, condition: e.condition, dignity: e.dignity }), e.l)).join('');

/*
 * ④ Les coiffures, une par une — TÊTE NUE.
 *
 * La première version de cette planche prenait une graine qui portait un
 * bonnet : les sept coiffures rendaient exactement la même image, et la
 * planche donnait l'air d'un défaut là où il n'y en avait pas. On force
 * `hat: 0`, sans quoi on ne mesure que le bonnet.
 */
const coiffures = Array.from({ length: 7 }, (_, i) =>
  vignette(rendu({ seed: 'sdf-3', gender: 'm', size: 96, visage: { hairstyle: i, hat: 0, glasses: 0, beard: 0 } }), `coiffure ${i}`)
).join('');

// ⑤ Les formes de crâne et les barbes, isolées : ce sont les deux ajouts.
const formes = ['ovale', 'carré', 'allongé', 'rond'].map((l, i) =>
  vignette(rendu({ seed: 'sdf-45', gender: 'm', size: 96, visage: { face: i, hat: 0, glasses: 0, beard: 0, hairstyle: 1 } }), l)
).join('');
const barbes = ['rasé', 'moustache', 'bouc', 'barbe pleine'].map((l, i) =>
  vignette(rendu({ seed: 'sdf-45', gender: 'm', size: 96, visage: { beard: i, hat: 0, glasses: 0 } }), l)
).join('');

/*
 * ⑥ LES ACCESSOIRES, UN PAR UN.
 *
 * Ils sont calés au pixel sur l'ancienne tête : tempes à 25/75, ligne de
 * chapeau à 33, yeux à 47, cou à partir de 70. Redessiner le crâne et poser
 * des épaules pouvait les décrocher tous à la fois — et c'est de la garde-robe
 * qu'on parle, donc de ce que le joueur a gagné. On les regarde.
 */
const HATS = ['halo', 'crown', 'tophat', 'santa', 'cap-back', 'party', 'beanie', 'cowboy', 'wizard', 'chef', 'flower-crown', 'pirate-hat', 'graduation', 'beret'];
const NECKS = ['scarf', 'gold-chain', 'bowtie', 'gold-medal', 'tie', 'bandana', 'cape', 'pearls', 'whistle'];
const EYES = ['monocle', '3d-glasses', 'eyepatch', 'heart-glasses', 'star-glasses', 'sunglasses', 'nerd-glasses', 'ski-goggles', 'thug-glasses'];
const FACES = ['blush', 'warpaint', 'mustache', 'goatee', 'unibrow', 'clown-nose', 'bandage', 'face-tattoo', 'star-cheeks'];
const acc = (slot: string, liste: string[]) => liste.map(id =>
  vignette(rendu({ seed: 'sdf-45', gender: 'm', size: 84, accessories: { [slot]: id } as never }), id)
).join('');

const html = `<style>
  body { margin: 0; padding: 16px; background: #FFFFFF; font: 12px system-ui, sans-serif; color: #333; }
  h2 { font-size: 13px; margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #777; }
  .grille { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
  figure { margin: 0; text-align: center; }
  figcaption { font-size: 9px; color: #999; margin-top: 3px; }
</style>
${bloc('La série — 24 inconnus', serie)}
${bloc('Aux tailles du jeu', tailles)}
${bloc("Les deux axes d'état", etats)}
${bloc('Les coiffures (tête nue)', coiffures)}
${bloc('Les formes de crâne', formes)}
${bloc('Barbes — chacune doit dessiner son propre nom', barbes)}
${bloc('Garde-robe — chapeaux', acc('hat', HATS))}
${bloc('Garde-robe — cou', acc('neck', NECKS))}
${bloc('Garde-robe — yeux', acc('eyes', EYES))}
${bloc('Garde-robe — visage', acc('face', FACES))}`;

/*
 * CE QUE LA PLANCHE NE PEUT PAS DIRE : LES PROPORTIONS.
 *
 * Vingt-quatre visages ne permettent pas de trancher « il y a trop de lunettes
 * noires » — on croit en compter neuf, il y en a peut-être cinq. On compte donc
 * sur quatre cents tirages, et on le fait sur le DESSIN RENDU plutôt que sur
 * une copie de la formule : une copie dériverait à la première retouche.
 */
const ECHANTILLON = 400;
const marques: Record<string, RegExp> = {
  'lunettes noires': /#242424/,
  'chapeau tiré': /Q26 14 50 14|Q27 15 50 15/,
  'crâne nu': /^(?!.*fill="#(2E2018|4A3320|6B4A2C|141414|7C7C7C|B8862F|CBCBCB|8A5A2A|E8E8E8|B5432F)"[^>]*\/>\s*<\/g>\s*<g clip)/,
};
const compte: Record<string, number> = { 'lunettes noires': 0, 'chapeau tiré': 0 };
for (let i = 0; i < ECHANTILLON; i++) {
  const m = rendu({ seed: `mesure-${i}`, gender: i % 3 === 0 ? 'f' : 'm', size: 40 });
  for (const k of Object.keys(compte)) if (marques[k].test(m)) compte[k]++;
}
console.log('  sur 400 tirages :');
for (const [k, v] of Object.entries(compte)) {
  console.log(`    ${k.padEnd(18)} ${String(`${(v / ECHANTILLON * 100).toFixed(1)} %`).padStart(7)}`);
}

const page = '/tmp/planche-visages.html';
writeFileSync(page, html);

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const p = await b.newPage();
await p.setViewport({ width: 900, height: 1200, deviceScaleFactor: 2 });
await p.goto(`file://${page}`, { waitUntil: 'load' });
await p.screenshot({ path: sortie, fullPage: true });
await b.close();
console.log(`planche écrite : ${sortie}`);
