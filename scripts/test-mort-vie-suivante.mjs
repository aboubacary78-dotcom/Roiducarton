/*
 * MOURIR, PUIS REPRENDRE LA RUE : SANS QUE LE JEU S'EFFONDRE.
 *
 * Ce parcours a planté en production. Un hook ajouté sous le
 * `if (!char) return null` de l'écran de mort disparaissait du rendu à
 * l'instant précis où le personnage passe à null, c'est-à-dire quand on
 * repart pour une nouvelle vie. React refuse de rendre un composant qui compte
 * soudain un hook de moins, et l'application affichait « Le carton s'est
 * effondré » (erreur React #300).
 *
 * Deux garde-fous valent mieux qu'un :
 *   - `test-hooks-apres-retour.mjs` interdit la FORME du défaut ;
 *   - ce test-ci refait le CHEMIN, dans un vrai navigateur.
 *
 * Le chemin est long parce qu'il n'y a pas de raccourci honnête : la
 * sauvegarde ne restaure que des personnages vivants, et l'écran de fin ne
 * s'atteint qu'en mourant.
 */
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });

const erreursPage = [];
p.on('pageerror', e => erreursPage.push(String(e).slice(0, 180)));

const pause = (ms) => new Promise(r => setTimeout(r, ms));
const clic = (motif) => p.evaluate((m) => {
  const r = new RegExp(m, 'i');
  const e = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, motif);
const choisirCarte = () => p.evaluate(() => {
  const c = [...document.querySelectorAll('[class*="cursor-pointer"]')]
    .find(e => /Former|Ancien/i.test(e.textContent || ''));
  if (c) { c.click(); return true; }
  return false;
});
const effondre = () => p.evaluate(() =>
  /carton s'est effondré|cardboard collapsed|Minified React error/i.test(document.body.innerText));

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await pause(700);

// ---- Une première vie ------------------------------------------------------
await clic('New Game|Nouvelle');
await pause(900);
await choisirCarte();
await pause(1500);
await clic('Start surviving|Commencer à survivre');
await pause(700);

/*
 * On vide les jauges par la sauvegarde. Mourir « à la loyale » demanderait des
 * dizaines d'actions et rendrait le test capricieux ; ce qu'on éprouve ici est
 * la TRANSITION d'après la mort, pas le chemin qui y mène.
 */
const prete = await p.evaluate(() => {
  const brut = localStorage.getItem('roi-du-carton-save');
  if (!brut) return false;
  const s = JSON.parse(brut);
  s.character.stats = { health: 1, mental: 1, hunger: 0, thirst: 0, sleep: 0, dignity: 1 };
  localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  return true;
});
verifier('une partie est en cours', prete);

// Un rechargement ramène à l'écran-titre : la partie se reprend de là.
await p.reload({ waitUntil: 'networkidle2' });
await pause(1300);
await clic('Continue|Reprendre');
await pause(1200);
await clic('got it|Compris');
await pause(500);

// ---- On passe les nuits jusqu'à l'offre de résurrection --------------------
let atteinte = false;
/*
 * Le bilan de la nuit se referme par « Nouvelle journée », et par rien
 * d'autre. Ce motif manquait, et le test avançait quand même, parce qu'une
 * seconde nuit partait sur un bilan resté ouvert. Ce défaut-là est corrigé
 * (voir le garde-fou de NEXT_DAY) : la boucle doit désormais refermer ce
 * qu'elle ouvre, comme un joueur.
 */
for (let i = 0; i < 6; i++) {
  await clic('Next Day|Jour Suivant');
  await pause(1400);
  await clic('New day|Nouvelle journée');
  await pause(500);
  await clic('got it|Compris|Continue|Continuer');
  await pause(600);
  // Le carton du matin peut s'intercaler : il se referme en deux gestes.
  await clic('Regarder|Take a look'); await pause(400);
  await clic('Merci|Thanks'); await pause(400);
  if (await effondre()) break;
  if (await p.evaluate(() => /Not just yet|Pas encore|kind soul|âme charitable/i.test(document.body.innerText))) {
    atteinte = true;
    break;
  }
}
verifier('le personnage meurt', atteinte);

/*
 * On refuse la seconde chance : c'est le chemin vers l'écran de fin. Le refus
 * demande deux gestes depuis que l'offre au pic a été durcie, un appui
 * réflexe ne referme plus rien. Le second bouton nomme le personnage, d'où le
 * motif large.
 */
await clic("No, it's over|Non, c'est fini");
await pause(400);
await clic("Let .* go|Laisser .* partir");
await pause(1500);
verifier("l'offre de résurrection est bien refermée",
  !(await p.evaluate(() => /Not just yet|Pas tout de suite/i.test(document.body.innerText))));
const surLaFin = await p.evaluate(() => /OBITUARY|NÉCROLOGIE|GAZETTE/i.test(document.body.innerText));
verifier("l'écran de fin s'affiche", surLaFin);
verifier("l'écran de fin ne s'effondre pas", !(await effondre()));

// ---- LA transition qui plantait -------------------------------------------
const repris = await clic('Take the street|Reprendre la rue');
await pause(1600);
verifier('« reprendre la rue » mène au choix du personnage',
  repris && await p.evaluate(() => /Choose Your Fate|Choisissez votre destin|lost souls|âmes perdues/i.test(document.body.innerText)));
verifier('aucun effondrement à la reprise', !(await effondre()));

const choisi = await choisirCarte();
await pause(1800);
verifier('un nouveau personnage se choisit', choisi);
verifier('AUCUN EFFONDREMENT APRÈS LE CHOIX', !(await effondre()),
  await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 60)));

const react300 = erreursPage.filter(e => /Minified React error #300|Rendered fewer hooks/i.test(e));
verifier('aucune erreur React #300', react300.length === 0, react300[0] || '');

if (erreursPage.length) {
  console.log(`\nerreurs de page (${erreursPage.length}) :`);
  for (const e of [...new Set(erreursPage)].slice(0, 5)) console.log('  · ' + e);
}

await b.close();
console.log(echecs ? `\n${echecs} vérification(s) en échec.` : '\nLa vie suivante démarre proprement.');
process.exit(echecs ? 1 : 0);
