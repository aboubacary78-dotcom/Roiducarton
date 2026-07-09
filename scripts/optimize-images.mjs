/*
 * Ré-encode en VRAI WebP les images trop lourdes de client/public/assets/
 * (ex. des PNG déposés avec l'extension .webp), via Chrome headless (canvas),
 * donc sans dépendance native (pas besoin de cwebp/sharp).
 *
 *  - redimensionne à LARGEUR_MAX de large maximum (ratio conservé)
 *  - exporte en WebP qualité QUALITE
 *  - ne touche que les fichiers dépassant SEUIL_KO
 *
 * Lancement :  node scripts/optimize-images.mjs
 */
import puppeteer from 'puppeteer-core';
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = resolve(root, 'client/public/assets');
const LARGEUR_MAX = 1600;
const QUALITE = 0.78;
const SEUIL_KO = 600; // on ne ré-encode que ce qui dépasse ~600 Ko

function findChrome() {
  const base = resolve(root, 'chrome');
  if (!existsSync(base)) throw new Error('Chrome introuvable dans ./chrome');
  const dir = readdirSync(base).find((d) => d.startsWith('linux-'));
  return `${base}/${dir}/chrome-linux64/chrome`;
}

const files = readdirSync(ASSET_DIR).filter((f) => /\.(webp|png|jpe?g)$/i.test(f))
  .filter((f) => statSync(resolve(ASSET_DIR, f)).size > SEUIL_KO * 1024);

if (files.length === 0) {
  console.log('Rien à optimiser.');
  process.exit(0);
}

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();

for (const f of files) {
  const p = resolve(ASSET_DIR, f);
  const before = statSync(p).size;
  const buf = readFileSync(p);
  // Type réel d'après la signature (l'extension peut mentir).
  const mime = buf[0] === 0x89 && buf[1] === 0x50 ? 'image/png'
    : buf[0] === 0xff && buf[1] === 0xd8 ? 'image/jpeg'
    : 'image/webp';
  const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
  const out = await page.evaluate(async (src, maxW, q) => {
    const img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = src; });
    const scale = Math.min(1, maxW / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/webp', q).split(',')[1];
  }, dataUrl, LARGEUR_MAX, QUALITE);
  const webp = Buffer.from(out, 'base64');
  writeFileSync(p, webp);
  console.log(`  ✓ ${f} : ${(before / 1024 / 1024).toFixed(1)} Mo → ${(webp.length / 1024).toFixed(0)} Ko`);
}

await browser.close();
console.log(`\n${files.length} image(s) ré-encodée(s).`);
