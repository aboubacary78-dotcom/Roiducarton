/*
 * LES PIQUES, DANS LE JEU — ET PAS SEULEMENT DANS LE FICHIER.
 *
 * `test-piques.ts` vérifie les trente phrases et le débit. Il ne peut pas dire
 * si elles ARRIVENT : une pique parfaitement écrite, correctement bridée, et
 * branchée sur un moment qui ne se produit jamais, passe tous les contrôles et
 * n'existe pas pour le joueur.
 *
 * Deux moments se testent d'un bout à l'autre sans tricher :
 *
 *   · LE RÉVEIL, qui est l'écran le plus vu du jeu — une fois par nuit ;
 *   · L'AGONIE, quand une jauge du corps passe sous dix.
 *
 * Le vol raté et les gains misérables demandent de jouer un mini-jeu entier
 * jusqu'à un résultat précis ; ils sont couverts côté données, et leur
 * branchement se lit en trois lignes au point d'appel.
 */
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

// Les phrases, lues à la source : le test ne redit pas ce que le jeu dira.
const src = readFileSync('client/src/contexts/data/piques.ts', 'utf8');
const bloc = (cat) => {
  const d = src.indexOf(`'${cat}': [`);
  if (d < 0) return [];
  const f = src.indexOf('],', d);
  return [...src.slice(d, f).matchAll(/fr: '((?:[^'\\]|\\.)*)'/g)]
    .map(m => m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
};
const REVEIL = bloc('reveil');
const AGONIE = bloc('sante-critique');

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 140)));

const pause = ms => new Promise(r => setTimeout(r, ms));
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

/*
 * On SURVEILLE les toasts au lieu de les cueillir à un instant donné : ils
 * vivent trois secondes et arrivent avec un décalage volontaire, pour ne pas
 * se poser sur l'animation qu'ils commentent. Un `innerText` pris au hasard
 * les rate une fois sur deux.
 */
async function guetterToasts(ms) {
  const vus = new Set();
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    const t = await p.evaluate(() => [...document.querySelectorAll('.fixed.top-3 span')]
      .map(e => e.textContent.trim()).filter(Boolean));
    t.forEach(x => vus.add(x));
    await pause(120);
  }
  return [...vus];
}

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('roi-du-carton-lang', 'fr');
  localStorage.setItem('roi-du-carton-scores', JSON.stringify([{ name: 'Feu Robert', days: 3, score: 40 }]));
});
await p.reload({ waitUntil: 'networkidle2' }); await pause(500);
await clic('Nouvelle|New Game'); await pause(900);
await p.evaluate(() => {
  const c = [...document.querySelectorAll('[class*="cursor-pointer"]')].find(e => /Ancien|Former/i.test(e.textContent || ''));
  c?.click();
});
await pause(1500);
await clic('Commencer|Start'); await pause(900);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(900);

/** Pose un état, recharge, et rend la main sur le hub. */
async function situer(patch) {
  await p.evaluate((j) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    for (const [k, v] of Object.entries(j)) {
      if (v === null) delete s.character[k]; else s.character[k] = v;
    }
    s.character.activeFlags = ['origin-vu'];
    s.dayActions = 0;
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
    location.reload();
  }, patch).catch(() => { /* le rechargement coupe l'évaluation */ });
  await p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await pause(1100);
  await clic('Continuer la partie|Continue'); await pause(1400);
  await clic('Regarder|Take a look'); await pause(300);
  await clic('Merci|Thanks'); await pause(500);
}

// ── ① L'agonie : une jauge du corps sous dix ───────────────────────────────
// Argent en poche pour que le prêteur ne s'invite pas dans le décor.
await situer({
  day: 4, money: 20, location: 'gare', dette: null, detteRefuseeJour: null,
  stats: { health: 80, mental: 80, hunger: 80, thirst: 80, sleep: 80, dignity: 60 },
});
await situer({
  day: 4, money: 20, location: 'gare',
  stats: { health: 80, mental: 80, hunger: 4, thirst: 80, sleep: 80, dignity: 60 },
});
const vusAgonie = await guetterToasts(3500);
const piqueAgonie = vusAgonie.find(t => AGONIE.some(a => t.includes(a.slice(0, 22))));
verifier(`le ventre à 4, la rue commente (${AGONIE.length} phrases possibles)`,
  !!piqueAgonie, piqueAgonie || vusAgonie.join(' | ') || 'aucun toast');

// ── ② Le réveil : le bilan du matin ────────────────────────────────────────
/*
 * On passe une vraie nuit plutôt que de forcer l'écran : c'est le chemin du
 * joueur, et c'est le seul qui prouve que la pique arrive là où il la verra.
 * Les actions du jour sont consommées d'avance pour que « Jour Suivant » soit
 * la seule chose qui reste à faire.
 */
/*
 * ET ON REMET LE PERSONNAGE D'APLOMB AVANT LA NUIT.
 *
 * Ce n'est pas de la commodité : avec un ventre à 4, la nuit fait replonger
 * les jauges sous le seuil d'agonie, la pique de santé part la première, et le
 * verrou de trente secondes avale celle du matin. Le jeu a raison — quelqu'un
 * qui est en train de mourir doit l'entendre plutôt que d'entendre parler de
 * carton humide — mais le test, lui, mesurait alors deux choses à la fois.
 *
 * Même raison pour la dignité : à 60 on est à dix points du palier suivant, et
 * une nuit dehors coûte plus que ça. On part à 95, loin de toute frontière.
 */
await pause(31000);   // on laisse retomber le verrou de débit
await p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
  s.character.stats = { health: 90, mental: 90, hunger: 90, thirst: 90, sleep: 90, dignity: 95 };
  s.dayActions = 3;
  localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  location.reload();
}).catch(() => {});
await p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
await pause(1100);
await clic('Continuer la partie|Continue'); await pause(1400);
await clic('compris|Got it'); await pause(400);
verifier('la nuit se lance', await clic('Jour Suivant|Next Day'));
const vusMatin = await guetterToasts(6000);
const piqueMatin = vusMatin.find(t => REVEIL.some(r => t.includes(r.slice(0, 22))));
verifier(`au réveil, la rue commente (${REVEIL.length} phrases possibles)`,
  !!piqueMatin, piqueMatin || vusMatin.join(' | ') || 'aucun toast');

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLa rue a son mot à dire, et elle le place.');
process.exit(echecs ? 1 : 0);
