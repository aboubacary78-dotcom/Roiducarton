/*
 * LES CAPTURES BRUTES POUR LA FICHE DU PLAY STORE.
 *
 * Pas des images finies : la matière première que le graphiste habille. Il a
 * besoin du VRAI jeu, sinon il dessine ce qu'il imagine, et la fiche promet
 * autre chose que ce qu'on installe. C'est le premier motif de désinstallation
 * dans l'heure, et ça se paie ensuite en note moyenne.
 *
 * LE PIÈGE DE FORMAT, ET IL EST CHER.
 *
 * Le Play Store accepte des captures de 320 à 3840 px de côté, mais impose que
 * le côté le plus long ne dépasse pas DEUX FOIS le plus court. L'écran de
 * référence du jeu est en 390 × 844, soit un rapport de 2,16 : une capture
 * prise à la taille naturelle est REFUSÉE, et l'erreur ne se voit qu'au moment
 * du téléversement, une fois le graphiste payé.
 *
 * On capture donc en 390 × 780 logiques, à l'échelle 2,7692, ce qui donne
 * 1080 × 2160, exactement 2:1. C'est la plus haute capture acceptée pour cette
 * largeur, et la mise en page du jeu y tient sans rien perdre d'important.
 *
 *   pnpm build && (cd dist/public && python3 -m http.server 8099)
 *   node scripts/captures-store.mjs
 *
 * Sortie : captures-store/ à la racine, ignoré par git (ce sont des images
 * régénérables, pas des sources).
 */
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LARGE = 390, HAUT = 780, ECHELLE = 1080 / LARGE;   // 1080 × 2160
const SORTIE = process.env.OUT || join(process.cwd(), 'captures-store');
mkdirSync(SORTIE, { recursive: true });

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: LARGE, height: HAUT, deviceScaleFactor: ECHELLE });

const pause = ms => new Promise(r => setTimeout(r, ms));
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x =>
    r.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '')) && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);
/*
 * ON LIT TOUT LE TEXTE, ET ON NE TRONQUE QUE L'AFFICHAGE.
 *
 * Les surcouches (récit d'origine, conseil du coach) se posent par-dessus le
 * hub à l'écran, mais APRÈS lui dans le DOM : `innerText` commence donc par le
 * hub, et une lecture tronquée déclarait ratées des captures parfaitement
 * bonnes. Deux longueurs ont été essayées avant de comprendre que le seuil
 * n'était pas le problème : il ne faut pas tronquer du tout.
 */
const texte = () => p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));

const prises = [];
async function prendre(nom, attendu) {
  const vu = await texte();
  const ok = !attendu || new RegExp(attendu, 'i').test(vu);
  const fichier = join(SORTIE, `${nom}.png`);
  await p.screenshot({ path: fichier });
  prises.push({ nom, ok, vu });
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom.padEnd(22)} ${ok ? '' : `· attendait « ${attendu} », a vu « ${vu.slice(0, 50)} »`}`);
}

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
/*
 * LE CARTON DU MATIN EST NEUTRALISÉ, ET C'EST UNE PRÉCAUTION, PAS UNE TRICHE.
 *
 * Il passe volontairement par-dessus tout, y compris le récit d'origine. Une
 * capture sur deux le montrait donc à la place de l'écran voulu, et le
 * fichier partait chez le graphiste sous une étiquette fausse. On le marque
 * comme déjà relevé aujourd'hui : le jeu n'est pas modifié, on choisit juste
 * le jour où l'on prend la photo.
 */
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('roi-du-carton-lang', 'fr');
  const j = new Date();
  const p2 = n => String(n).padStart(2, '0');
  const jour = `${j.getFullYear()}-${p2(j.getMonth() + 1)}-${p2(j.getDate())}`;
  localStorage.setItem('roi-du-carton-carton-matin', JSON.stringify({
    lastClaim: jour, streak: 1, best: 1, saves: 0, lastSaveGrant: null,
  }));
});
await p.reload({ waitUntil: 'networkidle2' }); await pause(1200);
for (const m of ['Regarder', 'Merci']) { if (await clic(m)) await pause(400); }

// ── 1. L'écran-titre ────────────────────────────────────────────────────────
await prendre('01-titre', 'Roi du Carton');

// ── 2. Le choix du personnage ───────────────────────────────────────────────
await clic('Nouvelle'); await pause(1200);
await prendre('02-choix-personnage', 'Destin|Choisissez');

// ── 3. L'histoire d'origine ─────────────────────────────────────────────────
await p.evaluate(() => { [...document.querySelectorAll('[class*="cursor-pointer"]')][0]?.click(); });
await pause(1400);
await prendre('03-origine', 'La Chute de|Commencer à survivre');

// ── 4. Le hub ───────────────────────────────────────────────────────────────
await clic('Commencer à survivre'); await pause(1600);
// Le conseil du premier jour se pose par-dessus le hub : on le referme, la
// photo doit montrer l'écran de jeu, pas son tutoriel.
for (const m of ['Compris|Got it|OK|D\'accord']) { if (await clic(m)) await pause(600); }
await prendre('04-hub', 'CONTRAT DU JOUR');

// ── 5. La manche ────────────────────────────────────────────────────────────
await clic('Mendier'); await pause(1800);
await prendre('05-mendier');

// ── 6. Le marché noir ───────────────────────────────────────────────────────
await p.evaluate(() => { localStorage.setItem('roi-du-carton-cimetiere', JSON.stringify(
  Array.from({ length: 11 }, (_, i) => ({ seed: 'g' + i, name: 'X', day: i + 1 })))); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(1200);
for (const m of ['Regarder', 'Merci']) { if (await clic(m)) await pause(400); }
await clic('Continuer la partie'); await pause(1400);
await clic('Le marché noir'); await pause(1600);
await prendre('06-marche-noir', 'MARCHÉ NOIR');

// ── 7. La garde-robe ────────────────────────────────────────────────────────
await clic('Retour'); await pause(800);
await clic('Personnaliser mon personnage'); await pause(1400);
await prendre('07-garde-robe', 'Garde-robe');

// ── 8. Le registre des morts ────────────────────────────────────────────────
await clic('Retour|←'); await pause(800);
const registre = await p.evaluate(() => {
  const e = [...document.querySelectorAll('button')].find(x => /⚰️|Registre|Cimetière/i.test((x.textContent || '') + (x.getAttribute('aria-label') || '')));
  if (e) { e.click(); return true; } return false;
});
if (registre) { await pause(1400); await prendre('08-registre'); }
else console.log('  note  registre des morts : aucun bouton trouvé depuis le hub, à prendre à la main');

await b.close();
const rates = prises.filter(x => !x.ok);
console.log(`\n${prises.length} capture(s) dans ${SORTIE}, en 1080 × 2160 (rapport 2:1, dans les clous du Play Store).`);
if (rates.length) console.log(`${rates.length} n'ont pas montré l'écran attendu : à revoir avant de les envoyer.`);
process.exit(rates.length ? 1 : 0);
