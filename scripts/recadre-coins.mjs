/*
 * ENLÈVE LES COINS ARRONDIS GRAVÉS DANS UNE IMAGE.
 *
 * Certains générateurs appliquent un arrondi décoratif aux quatre angles et
 * le remplissent de blanc. Posée dans un cadre carré, l'image montre alors
 * quatre encoches pâles, voir `scripts/controle-images.mjs`, qui les trouve.
 *
 * On ne repeint pas les angles : on RECADRE. Pour un arc de rayon R, il suffit
 * de rentrer de R·(1 − 1/√2) ≈ 0,29 R pour que les quatre coins du nouveau
 * cadre tombent sur des pixels pleins. On rentre un peu plus, on garde le
 * rapport d'origine au pixel près, et on remet à la taille de départ : la
 * perte est de l'ordre de deux pour cent, invisible, et il ne reste aucun
 * artefact, ce qu'un rebouchage laisserait toujours.
 *
 *     node scripts/recadre-coins.mjs client/public/assets/xxx.webp [...]
 */
import puppeteer from 'puppeteer-core';
import { writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const cibles = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!cibles.length) {
  console.error('usage : node scripts/recadre-coins.mjs <image> [image…]');
  process.exit(2);
}

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--allow-file-access-from-files'],
});
const p = await b.newPage();
await p.goto('file:///tmp/');

for (const cible of cibles) {
  if (!existsSync(cible)) { console.log(` RATÉ  ${cible} · introuvable`); continue; }
  const avant = statSync(cible).size / 1024;
  const r = await p.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const blanc = d => d[0] > 235 && d[1] > 235 && d[2] > 235;
    const px = (x, y) => g.getImageData(x, y, 1, 1).data;

    // Le rayon apparent : la plus longue course de blanc le long d'un bord,
    // mesurée depuis chacun des quatre angles.
    let rayon = 0;
    for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const x0 = sx > 0 ? 0 : img.width - 1;
      const y0 = sy > 0 ? 0 : img.height - 1;
      if (!blanc(px(x0, y0))) continue;
      let n = 0;
      while (n < 120 && blanc(px(x0 + sx * n, y0))) n++;
      rayon = Math.max(rayon, n);
      let m = 0;
      while (m < 120 && blanc(px(x0, y0 + sy * m))) m++;
      rayon = Math.max(rayon, m);
    }
    if (!rayon) return { rayon: 0 };

    /*
     * La flèche de l'arc suffirait (0,29 R) ; on prend le double, arrondi au
     * pixel, pour absorber le lissage du bord, un arrondi n'est jamais net,
     * il est anticrénelé sur deux ou trois pixels.
     */
    const marge = Math.ceil(rayon * 0.58);
    // On rentre proportionnellement, pour garder le rapport EXACT.
    const dx = marge;
    const dy = Math.round(marge * img.height / img.width);

    const out = document.createElement('canvas');
    out.width = img.width; out.height = img.height;
    const go = out.getContext('2d');
    go.imageSmoothingQuality = 'high';
    go.drawImage(img, dx, dy, img.width - 2 * dx, img.height - 2 * dy, 0, 0, img.width, img.height);
    return { rayon, dx, dy, b64: out.toDataURL('image/webp', 0.86).split(',')[1] };
  }, `file://${resolve(cible)}`);

  if (!r.rayon) { console.log(`  --   ${cible}, aucun arrondi détecté, laissée telle quelle`); continue; }
  writeFileSync(cible, Buffer.from(r.b64, 'base64'));
  const apres = statSync(cible).size / 1024;
  console.log(`  ok   ${cible}, rayon ~${r.rayon} px, recadrée de ${r.dx}×${r.dy}, ${avant.toFixed(0)} → ${apres.toFixed(0)} ko`);
}

await b.close();
