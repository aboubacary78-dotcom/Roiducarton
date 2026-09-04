/*
 * LES PORTRAITS QUI PEUPLENT LES VISUELS DE LA FICHE.
 *
 *     pnpm portraits-store                  français
 *     LANG_JEU=en pnpm portraits-store      anglais
 *
 * POURQUOI. Les six visuels de la fiche ne montraient qu'un écran de téléphone
 * posé sur du carton. C'est propre, c'est exact, et c'est mort : rien n'y
 * regarde le visiteur. Or le jeu parle de GENS — un ancien sommelier, une
 * ancienne infirmière, un musicien qui a connu de meilleurs jours — et aucun
 * n'apparaissait sur la fiche censée les vendre.
 *
 * D'OÙ ILS VIENNENT. Pas d'un dessin refait pour l'occasion : du jeu lui-même.
 * L'avatar est un SVG en `viewBox="0 0 100 100"`, donc vectoriel, donc
 * agrandissable sans perte. On ouvre l'écran de choix, on force la taille du
 * SVG à 640 px et on le photographie SEUL, fond transparent. Ce qui finit sur
 * la fiche est exactement ce que le joueur verra, au pixel près, et le jour où
 * les visages changent, ces portraits changent avec eux.
 *
 * ET LE FOND FAIT PARTIE DU PORTRAIT. L'avatar n'est pas une tête détourée :
 * c'est un morceau de carton découpé, cannelure visible, avec la tête posée
 * dessus en seconde épaisseur. On ne le retire donc pas — c'est lui qui fait
 * qu'un portrait posé sur la fiche ressemble à une photo punaisée sur un mur
 * plutôt qu'à un autocollant.
 *
 * Sortie : portraits-store/<langue>/, ignoré par git.
 */
import puppeteer from 'puppeteer-core';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TAILLE = 640;
const TOURS = 4;                       // 4 tirages × 3 candidats = 12 portraits
const LANGUE = process.env.LANG_JEU === 'en' ? 'en' : 'fr';
const SORTIE = process.env.OUT || join(process.cwd(), `portraits-store/${LANGUE}`);
rmSync(SORTIE, { recursive: true, force: true });
mkdirSync(SORTIE, { recursive: true });

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
/*
 * L'ÉCHELLE EST SUR LA PAGE, PAS SUR LE SVG SEUL.
 *
 * Forcer le SVG à 640 px suffirait à le rendre net — il est vectoriel. Mais la
 * capture d'un élément se fait à la résolution de la PAGE : à l'échelle 1, on
 * récupérerait 640 px d'une image dessinée pour 640 px, ce qui est correct,
 * et à l'échelle 2 on récupère le double, ce qui laisse de la marge pour les
 * poser en grand sans jamais les agrandir après coup.
 */
await p.setViewport({ width: 430, height: 900, deviceScaleFactor: 2 });

const pause = ms => new Promise(r => setTimeout(r, ms));
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x =>
    r.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '')) && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate((langue) => {
  localStorage.clear();
  localStorage.setItem('roi-du-carton-lang', langue);
  const j = new Date();
  const d = n => String(n).padStart(2, '0');
  // Le carton du matin passe par-dessus tout : neutralisé, comme pour les captures.
  localStorage.setItem('roi-du-carton-carton-matin', JSON.stringify({
    lastClaim: `${j.getFullYear()}-${d(j.getMonth() + 1)}-${d(j.getDate())}`,
    streak: 1, best: 1, saves: 0, lastSaveGrant: null,
  }));
  localStorage.setItem('roi-du-carton-cimetiere', JSON.stringify(
    Array.from({ length: 11 }, (_, i) => ({ seed: 'g' + i, name: 'Anonyme', day: i + 1 }))));
}, LANGUE);
await p.reload({ waitUntil: 'networkidle2' }); await pause(1100);
for (const m of ['Regarder|Take a look', 'Merci|Thanks']) { if (await clic(m)) await pause(350); }
if (!(await clic('Nouvelle|New Game'))) {
  console.log('ARRÊT : le bouton de nouvelle partie est introuvable.');
  await b.close(); process.exit(1);
}
await pause(1300);

/*
 * ON RÉCOLTE LE CODE DES SVG, PUIS ON LES REND À PART. ET C'EST UNE CORRECTION.
 *
 * La première version agrandissait les SVG SUR PLACE, à 640 px, puis
 * photographiait chaque élément. La boîte ainsi gonflée dépassait largement un
 * écran de 430 px de large : la capture d'élément a rendu la PAGE ENTIÈRE,
 * douze fois, et douze écrans de choix de personnage sont arrivés dans le
 * dossier des portraits sans que rien ne proteste.
 *
 * On prend donc leur `outerHTML` tel quel — l'avatar est du SVG autonome,
 * formes et couleurs en attributs — et on les rend ensuite un par un dans une
 * page vide à la bonne taille. Plus de mise en page à bousculer, et le fond
 * transparent vient tout seul.
 */
const recoltes = [];
for (let tour = 0; tour < TOURS; tour++) {
  const lot = await p.evaluate(() => {
    const svgs = [...document.querySelectorAll('svg[role="img"]')];
    const titres = [...document.querySelectorAll('h3')];
    return svgs.map((s, i) => {
      const h = titres[i];
      /*
       * ON RÉCOLTE AUSSI LA RÉPLIQUE, et c'est elle qui compte le plus.
       * Chaque candidat porte une ligne de description de son ancien métier,
       * écrite au ton du jeu — « Peut distinguer un Bordeaux d'un jus de
       * poubelle. Parfois. » C'est l'humour noir du jeu en une phrase, et il
       * n'apparaissait nulle part sur la fiche.
       */
      const carte = h?.closest('.craft-card');
      const italique = carte
        ? [...carte.querySelectorAll('p')].find(x => /italic/.test(x.className))
        : null;
      return {
        svg: s.outerHTML,
        nom: (h?.textContent || '').trim(),
        metier: (h?.parentElement?.querySelector('p')?.textContent || '').trim(),
        citation: (italique?.textContent || '').trim().replace(/^"|"$/g, ''),
      };
    });
  });
  if (!lot.length) break;
  recoltes.push(...lot);
  if (tour < TOURS - 1) {
    if (!(await clic('Relancer|Reroll'))) break;
    await pause(1200);
  }
}

await p.setViewport({ width: TAILLE, height: TAILLE, deviceScaleFactor: 2 });
const fiches = [];
for (const r of recoltes) {
  const n = `${String(fiches.length + 1).padStart(2, '0')}.png`;
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0}
    html,body{width:${TAILLE}px;height:${TAILLE}px;background:transparent}
    svg{display:block;width:${TAILLE}px;height:${TAILLE}px}
  </style></head><body>${r.svg}</body></html>`, { waitUntil: 'load' });
  await p.screenshot({ path: join(SORTIE, n), omitBackground: true });
  fiches.push({ fichier: n, nom: r.nom, metier: r.metier, citation: r.citation });
  console.log(`  ok   ${n}   ${r.nom.padEnd(13)} ${r.metier.padEnd(28)} « ${r.citation} »`);
}

writeFileSync(join(SORTIE, 'fiches.json'), JSON.stringify(fiches, null, 2));
await b.close();

if (fiches.length < 6) {
  console.log(`\nARRÊT : ${fiches.length} portrait(s) seulement, il en faut au moins six.`);
  process.exit(1);
}
console.log(`\n${fiches.length} portrait(s) dans ${SORTIE}, en ${TAILLE * 2} px, fond transparent.`);
