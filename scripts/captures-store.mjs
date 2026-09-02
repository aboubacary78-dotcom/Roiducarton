/*
 * LES CAPTURES BRUTES POUR LA FICHE DU PLAY STORE.
 *
 * Pas des images finies : la matière première que le graphiste habille. Il a
 * besoin du VRAI jeu, sinon il dessine ce qu'il imagine, et la fiche promet
 * autre chose que ce qu'on installe. C'est le premier motif de désinstallation
 * dans l'heure, et ça se paie ensuite en note moyenne.
 *
 * ON NE MONTRE PAS LA BOUTIQUE, ET C'EST DÉLIBÉRÉ.
 *
 * La première version de ce script en faisait une capture. Une fiche de store
 * qui montre un écran de paiement apprend au visiteur qu'il devra payer avant
 * même de lui avoir donné une raison d'installer. On montre ce qui se joue :
 * les mini-jeux et les rencontres, c'est-à-dire ce qu'on fait avec ses doigts
 * et ce qui se raconte. La boutique existe, elle se découvre dans le jeu.
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
 * 1080 × 2160, exactement 2:1.
 *
 *   pnpm build && (cd dist/public && python3 -m http.server 8099)
 *   pnpm captures-store
 *
 * Sortie : captures-store/, ignoré par git (images régénérables, pas sources).
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
  await p.screenshot({ path: join(SORTIE, `${nom}.png`) });
  prises.push({ nom, ok });
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom.padEnd(22)}${ok ? '' : ` · attendait « ${attendu} », a vu « ${vu.slice(0, 70)} »`}`);
  return ok;
}

/*
 * UNE PARTIE NEUVE PAR CAPTURE, ET C'EST LA SEULE FAÇON FIABLE.
 *
 * Le jeu donne TROIS actions par jour. Enchaîner quatre mini-jeux dans la même
 * journée trouvait les tuiles grisées, et le script aurait photographié un hub
 * inerte en croyant tenir un mini-jeu.
 *
 * Deux réglages posés avant chaque partie, et aucun ne modifie le jeu :
 *
 *   · LE CARTON DU MATIN est marqué comme déjà relevé. Il passe volontairement
 *     par-dessus tout, y compris le récit d'origine, et une capture sur deux
 *     le montrait à la place de l'écran voulu, sous une étiquette fausse.
 *
 *   · DES TOMBES. Le tout premier écran d'une toute première partie cache la
 *     Bagarre, le Vol et la Récup', pour ne pas noyer un débutant. Un
 *     cimetière garni dit au jeu qu'on n'en est plus là.
 */
async function partirDeZero() {
  await p.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('roi-du-carton-lang', 'fr');
    const j = new Date();
    const d = n => String(n).padStart(2, '0');
    localStorage.setItem('roi-du-carton-carton-matin', JSON.stringify({
      lastClaim: `${j.getFullYear()}-${d(j.getMonth() + 1)}-${d(j.getDate())}`,
      streak: 1, best: 1, saves: 0, lastSaveGrant: null,
    }));
    localStorage.setItem('roi-du-carton-cimetiere', JSON.stringify(
      Array.from({ length: 11 }, (_, i) => ({ seed: 'g' + i, name: 'Anonyme', day: i + 1 }))));
  });
  await p.reload({ waitUntil: 'networkidle2' }); await pause(1100);
  for (const m of ['Regarder', 'Merci']) { if (await clic(m)) await pause(350); }
}

async function nouvellePartie() {
  await partirDeZero();
  await clic('Nouvelle'); await pause(1100);
  await p.evaluate(() => { [...document.querySelectorAll('[class*="cursor-pointer"]')][0]?.click(); });
  await pause(1300);
  await clic('Commencer à survivre'); await pause(1500);
  // Le conseil du premier jour se pose par-dessus le hub : la photo doit
  // montrer l'écran de jeu, pas son tutoriel.
  for (const m of ['Compris|Got it|OK|D\'accord']) { if (await clic(m)) await pause(500); }
}

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });

// ── 1. L'écran-titre ────────────────────────────────────────────────────────
// Le même départ que partout ailleurs : la première version de ce bloc
// nettoyait le stockage à la main, sans neutraliser le carton du matin, et le
// récit d'origine se retrouvait caché derrière lui deux fois sur trois.
await partirDeZero();
await prendre('01-titre', 'Roi du Carton');

// ── 2. Le choix du personnage ───────────────────────────────────────────────
await clic('Nouvelle'); await pause(1200);
await prendre('02-choix-personnage', 'Destin|Choisissez');

// ── 3. Le récit d'origine ───────────────────────────────────────────────────
await p.evaluate(() => { [...document.querySelectorAll('[class*="cursor-pointer"]')][0]?.click(); });
await pause(1400);
await prendre('03-origine', 'La Chute de');

// ── 4. Le hub ───────────────────────────────────────────────────────────────
await nouvellePartie();
await prendre('04-hub', 'CONTRAT DU JOUR');

/*
 * ON PASSE LES RÈGLES, ET C'EST TOUT LE SUJET DE CES QUATRE CAPTURES.
 *
 * Chaque mini-jeu s'ouvre sur son panneau « COMMENT JOUER ». La première
 * version photographiait ce panneau : un mur d'instructions, aucune action,
 * rien qui donne envie d'installer quoi que ce soit. On veut le jeu EN TRAIN
 * de se jouer, le doigt sur les détritus et le tas qui s'agite.
 */
async function jouer(action, attente = 2200) {
  await clic(action); await pause(1600);
  for (const m of ['Compris, on y va|Compris|Got it|On y va']) { if (await clic(m)) await pause(500); }
  await pause(attente);
}

// ── 5. La manche ────────────────────────────────────────────────────────────
/*
 * ON TIENT UN REGARD AVANT DE PHOTOGRAPHIER.
 *
 * Le mini-jeu demande de poser le doigt sur un passant et de le suivre. Sans
 * ça, le chapeau est à zéro et la fierté à zéro : le décor est superbe, mais
 * rien ne se passe, et une fiche de store doit montrer une partie en cours,
 * pas un menu de départ. On accroche donc un passant et on le suit quelques
 * instants, exactement comme un joueur.
 */
await nouvellePartie();
await jouer('Mendier', 700);
const passant = await p.evaluate(() => {
  const e = [...document.querySelectorAll('div,button,span')]
    .map(x => ({ x, b: x.getBoundingClientRect() }))
    .filter(o => o.b.width > 26 && o.b.width < 60 && Math.abs(o.b.width - o.b.height) < 12 && o.b.y > 120 && o.b.y < 480)
    .sort((a2, b2) => a2.b.y - b2.b.y)[0];
  return e ? { x: e.b.x + e.b.width / 2, y: e.b.y + e.b.height / 2 } : null;
});
if (passant) {
  await p.mouse.move(passant.x, passant.y);
  await p.mouse.down();
  // Le passant se déplace : on le suit à petits pas plutôt que de tenir un
  // point fixe, qui décrocherait à la première seconde.
  for (let i = 0; i < 26; i++) {
    await p.mouse.move(passant.x + i * 2.2, passant.y + Math.sin(i / 3) * 4);
    await pause(70);
  }
  await p.mouse.up();
  await pause(600);
}
await prendre('05-mendier');

// ── 6. La Récup' ────────────────────────────────────────────────────────────
/*
 * ON GRATTE AVANT DE PHOTOGRAPHIER.
 *
 * Le tas s'ouvre intact : six colonnes de tuiles brunes identiques, aucune
 * trouvaille, la jauge d'agitation à zéro. C'est le jeu, mais ça ne raconte
 * rien, et une grille vierge sur une fiche de store ressemble à un écran de
 * chargement. Trois passages du doigt suffisent à faire apparaître ce qu'il y
 * a dessous, ce qui EST le mini-jeu.
 */
await nouvellePartie();
await jouer("La Récup'", 900);
const tas = await p.$('[class*="grid"], canvas, svg');
if (tas) {
  const r = await p.evaluate(() => {
    const e = [...document.querySelectorAll('div')].find(x => {
      const b = x.getBoundingClientRect();
      return b.width > 300 && b.height > 380 && b.height < 620;
    });
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  });
  if (r) {
    for (const part of [0.28, 0.5, 0.72]) {
      const y = r.y + r.h * part;
      await p.mouse.move(r.x + 20, y);
      await p.mouse.down();
      for (let i = 1; i <= 14; i++) await p.mouse.move(r.x + 20 + (r.w - 40) * (i / 14), y);
      await p.mouse.up();
      await pause(180);
    }
    await pause(700);
  }
}
await prendre('06-recup');

// ── 7. Une rencontre ────────────────────────────────────────────────────────
// Pas de panneau de règles ici : une rencontre se lit, elle ne se joue pas.
await nouvellePartie();
await clic('Explorer'); await pause(2100);
await prendre('07-rencontre');

// ── 8. La bagarre ───────────────────────────────────────────────────────────
await nouvellePartie();
await jouer('Bagarre', 2600);
await prendre('08-bagarre');

// ── 9. La garde-robe ────────────────────────────────────────────────────────
await nouvellePartie();
await clic('Personnaliser mon personnage'); await pause(1500);
await prendre('09-garde-robe', 'Garde-robe');

await b.close();
const rates = prises.filter(x => !x.ok);
console.log(`\n${prises.length} capture(s) dans ${SORTIE}, en 1080 × 2160 (rapport 2:1, dans les clous).`);
console.log('Le Play Store en accepte huit au plus : il y en a une de trop, à choisir.');
if (rates.length) console.log(`${rates.length} n'ont pas montré l'écran attendu : à revoir avant de les envoyer.`);
process.exit(rates.length ? 1 : 0);
