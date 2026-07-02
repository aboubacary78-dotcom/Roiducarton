/*
 * Génère l'icône de l'app et l'écran de démarrage (splash) en PNG,
 * dans la direction artistique "Carton Craft" (carton couronné).
 *
 * Sorties :
 *  - client/public/favicon.png          (256×256, onglet navigateur)
 *  - client/public/apple-touch-icon.png (180×180, écran d'accueil iOS web)
 *  - resources/icon.png                 (1024×1024, source stores)
 *  - resources/splash.png               (2732×2732, source splash Capacitor)
 *
 * Après `pnpm cap:add:android` / `cap:add:ios`, générer les déclinaisons
 * natives avec : npx @capacitor/assets generate  (voir STORE_PUBLISHING.md)
 *
 * Lancement :  node scripts/generate-assets.mjs
 * (nécessite le Chrome téléchargé : pnpm dlx @puppeteer/browsers install chrome@130.0.6723.116)
 */
import puppeteer from 'puppeteer-core';
import { readdirSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chromeBase = resolve(root, 'chrome');
const chromeDir = readdirSync(chromeBase).find(d => d.startsWith('linux-'));
const CHROME = resolve(chromeBase, chromeDir, 'chrome-linux64/chrome');

// Polices embarquées en base64 pour le texte du splash.
const font = (p) => readFileSync(resolve(root, 'client/public/fonts', p)).toString('base64');
const FONTS_CSS = `
@font-face { font-family: 'DM Serif Display'; src: url(data:font/woff2;base64,${font('dm-serif-display-400-latin.woff2')}) format('woff2'); }
@font-face { font-family: 'Outfit'; font-weight: 500; src: url(data:font/woff2;base64,${font('outfit-500-latin.woff2')}) format('woff2'); }
`;

// Motif central : carton ouvert + couronne dorée (cohérent avec l'écran-titre).
const CROWN_BOX_SVG = `
  <g stroke="#3A2A1E" stroke-width="14" stroke-linejoin="round">
    <!-- ombre au sol -->
    <ellipse cx="512" cy="812" rx="300" ry="46" fill="#3A2A1E" opacity="0.14" stroke="none"/>
    <!-- boîte : face avant / côté -->
    <path d="M232 500 L512 570 L512 812 L232 736 Z" fill="#C0814E"/>
    <path d="M792 500 L512 570 L512 812 L792 736 Z" fill="#A86C3C"/>
    <!-- rabats ouverts -->
    <path d="M232 500 L512 570 L400 442 L150 396 Z" fill="#B97C49"/>
    <path d="M792 500 L512 570 L624 442 L874 396 Z" fill="#8F5E33"/>
    <!-- bande de scotch -->
    <path d="M352 530 L512 570 L512 812 L352 768 Z" fill="#EAD3B0" opacity="0.5" stroke="none"/>
  </g>
  <!-- couronne dorée flottante -->
  <g transform="translate(512 300)">
    <ellipse cx="0" cy="26" rx="190" ry="140" fill="#F2C14E" opacity="0.16" stroke="none"/>
    <path d="M-150 60 L-150 -50 L-78 8 L0 -92 L78 8 L150 -50 L150 60 Z"
      fill="#E8B84B" stroke="#9B7209" stroke-width="14" stroke-linejoin="round"/>
    <rect x="-150" y="60" width="300" height="42" rx="14" fill="#D9A83A" stroke="#9B7209" stroke-width="12"/>
    <circle cx="0" cy="-104" r="22" fill="#F2D27A" stroke="#9B7209" stroke-width="10"/>
    <circle cx="-150" cy="-62" r="16" fill="#F2D27A" stroke="#9B7209" stroke-width="9"/>
    <circle cx="150" cy="-62" r="16" fill="#F2D27A" stroke="#9B7209" stroke-width="9"/>
  </g>`;

const ICON_HTML = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0}svg{display:block}</style>
<svg width="100vw" height="100vh" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="80%">
      <stop offset="0%" stop-color="#F4E3C6"/>
      <stop offset="62%" stop-color="#E9CFA4"/>
      <stop offset="100%" stop-color="#D8B583"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${CROWN_BOX_SVG}
</svg>`;

const SPLASH_HTML = `<!doctype html><meta charset="utf-8">
<style>
${FONTS_CSS}
html,body{margin:0;padding:0}
.wrap{width:2732px;height:2732px;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:
    radial-gradient(ellipse at 20% 8%, rgba(196,114,58,0.10) 0%, transparent 45%),
    radial-gradient(ellipse at 80% 92%, rgba(155,91,58,0.10) 0%, transparent 45%),
    linear-gradient(180deg,#FBF6F0 0%,#F3E7D8 100%);}
h1{font-family:'DM Serif Display',serif;font-weight:400;font-size:150px;color:#2A1F1A;margin:70px 0 0}
p{font-family:'Outfit',sans-serif;font-weight:500;font-size:64px;color:#8B6B4A;margin:26px 0 0;letter-spacing:0.04em}
</style>
<div class="wrap">
  <svg width="760" height="760" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">${CROWN_BOX_SVG}</svg>
  <h1>Le Roi du Carton</h1>
  <p>Une Épopée Urbaine</p>
</div>`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars'],
});
const page = await browser.newPage();

async function render(html, size, out) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: out });
  console.log(`  ✓ ${out} (${size}×${size})`);
}

if (!existsSync(resolve(root, 'resources'))) mkdirSync(resolve(root, 'resources'));
await render(ICON_HTML, 256, resolve(root, 'client/public/favicon.png'));
await render(ICON_HTML, 180, resolve(root, 'client/public/apple-touch-icon.png'));
await render(ICON_HTML, 1024, resolve(root, 'resources/icon.png'));
await render(SPLASH_HTML, 2732, resolve(root, 'resources/splash.png'));

await browser.close();
console.log('\nAssets générés.');
