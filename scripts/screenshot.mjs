/*
 * Capture d'écran du jeu pour le travail UX/UI.
 *
 * Prérequis (une fois), télécharge Chrome for Testing dans ./chrome :
 *   pnpm dlx @puppeteer/browsers install chrome@130.0.6723.116
 *
 * Lancement :
 *   pnpm build && pnpm preview --port 4173   (dans un terminal)
 *   node scripts/screenshot.mjs              (dans un autre)
 *
 * Les images sont écrites dans OUT (par défaut /tmp).
 * Le chemin de Chrome est auto-détecté dans ./chrome, ou via la variable CHROME.
 */
import puppeteer from 'puppeteer-core';
import { readdirSync, existsSync } from 'node:fs';

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const base = new URL('../chrome/', import.meta.url).pathname;
  if (!existsSync(base)) throw new Error('Chrome introuvable. Lance d\'abord: pnpm dlx @puppeteer/browsers install chrome@130.0.6723.116');
  const dir = readdirSync(base).find((d) => d.startsWith('linux-'));
  return `${base}${dir}/chrome-linux64/chrome`;
}

const URL_APP = process.env.URL || 'http://localhost:4173/';
const OUT = process.env.OUT || '/tmp';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(page, text) {
  const handle = await page.evaluateHandle((t) => {
    const els = [...document.querySelectorAll('button, [role=button], a')];
    return els.find((e) => e.textContent && e.textContent.includes(t)) || null;
  }, text);
  const el = handle.asElement();
  if (!el) throw new Error(`Bouton introuvable: ${text}`);
  await el.click();
}

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
await page.goto(URL_APP, { waitUntil: 'networkidle2' });
await sleep(1200);
await page.screenshot({ path: `${OUT}/01-title.png` });

await clickText(page, 'Nouvelle Partie');
await sleep(1200);
await page.screenshot({ path: `${OUT}/02-select.png` });

await page.click('.cursor-pointer');
await sleep(1200);
await page.screenshot({ path: `${OUT}/03-main.png` });

try {
  await clickText(page, 'Bagarre');
  await sleep(1200);
  await page.screenshot({ path: `${OUT}/04-combat.png` });
  await clickText(page, 'Viser');
  await sleep(900);
  await page.screenshot({ path: `${OUT}/05-aim.png` });
} catch (e) {
  console.log('étape combat ignorée:', e.message);
}

await browser.close();
console.log('OK, captures dans', OUT);
