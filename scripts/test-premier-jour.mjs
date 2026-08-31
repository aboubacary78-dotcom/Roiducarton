/*
 * LE PREMIER JOUR SE RACONTE EN QUATRE TEMPS.
 *
 * Neuf actions d'un coup au premier écran, dont deux qu'un débutant ne peut
 * pas évaluer : la Bagarre et le Vol quittent le tout premier écran, et
 * reviennent dès la première action faite. Ce test éprouve les deux moitiés de
 * l'idée (le masquage ET son alibi narratif) parce que l'un sans l'autre ne
 * vaut rien : une option qui manque sans raison n'est pas de la pédagogie,
 * c'est un bug.
 *
 * Il vérifie aussi que la règle ne déborde pas : à la deuxième partie, la rue
 * ne prend plus de gants.
 */
import puppeteer from 'puppeteer-core';

const SCRATCH = '/tmp/claude-0/-home-user-Roiducarton/5ae19fe6-213b-5a4c-978c-4dbf051229f6/scratchpad';
const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 160)));

const pause = ms => new Promise(r => setTimeout(r, ms));
const clic = (m) => p.evaluate((s) => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);
const tuile = (m) => p.evaluate((s) => {
  const r = new RegExp(s, 'i');
  return [...document.querySelectorAll('button')].some(x => r.test(x.textContent || '') && x.offsetWidth > 0);
}, m);
const texte = () => p.evaluate(() => document.body.innerText);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

/** Ouvre une partie neuve et s'arrête sur l'écran principal, jour 1. */
async function nouvellePartie() {
  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
  await pause(700);
  await clic('New Game|Nouvelle');
  await pause(900);
  await p.evaluate(() => {
    const c = [...document.querySelectorAll('[class*="cursor-pointer"]')].find(e => /Former|Ancien/i.test(e.textContent || ''));
    c?.click();
  });
  await pause(1500);
  await clic('Start surviving|Commencer à survivre');
  await pause(900);
  await clic('Regarder|Take a look'); await pause(600);
  await clic('Merci|Thanks'); await pause(900);
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. L'arrivée, deux actions en moins, et une phrase qui le justifie
// ═══════════════════════════════════════════════════════════════════════════
await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => localStorage.clear());   // une toute première partie
await nouvellePartie();

verifier('la Bagarre est absente du tout premier écran', !(await tuile('Fight|Bagarre')));
verifier('le Vol est absent du tout premier écran', !(await tuile('Steal|Voler')));
verifier('Explorer, Mendier et Dormir sont là',
  (await tuile('Explore|Explorer')) && (await tuile('Beg|Mendier')) && (await tuile('Sleep|Dormir')));

const arrivee = await texte();
verifier('le texte d\'arrivée dit pourquoi on regarde avant d\'agir',
  /Nobody is expecting you anywhere|Personne ne vous attend nulle part/i.test(arrivee));
/*
 * Le quartier de départ est tiré au sort : gare, marché, parc, centre-ville.
 * Un texte d'arrivée qui nommerait la gare serait faux trois fois sur quatre.
 */
verifier('le texte d\'arrivée ne nomme aucun lieu',
  !/gare|station|marché|market|parc|park/i.test(
    (arrivee.match(/(Nobody is expecting[^"]*?wrong\.|Personne ne vous attend[^"]*?faux pas\.)/i) || [''])[0]));
await p.screenshot({ path: `${SCRATCH}/jour1-arrivee.png` });

// ═══════════════════════════════════════════════════════════════════════════
// 2. La révélation, une action, et la rue montre ses prises
// ═══════════════════════════════════════════════════════════════════════════
await p.evaluate(() => {
  const e = [...document.querySelectorAll('button')].find(x => /(Explore|Explorer)/i.test(x.textContent || '') && !x.disabled && x.offsetWidth);
  e?.click();
});
await pause(1500);
for (let i = 0; i < 6; i++) {
  if (await p.evaluate(() => !!document.getElementById('tuto-nextday')
    && ![...document.querySelectorAll('.fixed.inset-0')].some(v => v.offsetWidth > 0))) break;
  await clic('← Back|← Retour|Back|Retour|Continue|Continuer|Suivant|Next|Regarder|Take a look|Merci|Thanks');
  await pause(700);
}
await pause(1400);   // le conseil du moment attend 900 ms

verifier('la Bagarre apparaît après la première action', await tuile('Fight|Bagarre'));
verifier('le Vol apparaît après la première action', await tuile('Steal|Voler'));
verifier('la révélation est dite, pas seulement affichée',
  /Observation over|Fin du tour d'observation/i.test(await texte()));
verifier('le texte d\'arrivée a cédé la place',
  !/Nobody is expecting you anywhere|Personne ne vous attend nulle part/i.test(await texte()));
await p.screenshot({ path: `${SCRATCH}/jour1-revelation.png` });

// ═══════════════════════════════════════════════════════════════════════════
// 3. Le crépuscule, le bouton ne reste pas seul
// ═══════════════════════════════════════════════════════════════════════════
await p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
  s.dayActions = 3;
  localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
});
await p.reload({ waitUntil: 'networkidle2' });
await pause(1200);
await clic('Continue|Reprendre');
await pause(1400);
await clic('Regarder|Take a look'); await pause(500);
await clic('Merci|Thanks'); await pause(900);

verifier('le premier soir a sa phrase au-dessus du bouton',
  /concrete cools faster|béton refroidit plus vite/i.test(await texte()));
/*
 * Une seule voix à la fois : le conseil mécanique de la nuit se tait le
 * premier soir, sinon deux textes disent la même chose au même endroit.
 */
verifier('le conseil « plus d\'action » ne double pas le texte du soir',
  !/No actions left|Plus d'action\./i.test(await texte()));
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await pause(500);
await p.screenshot({ path: `${SCRATCH}/jour1-crepuscule.png` });

// ═══════════════════════════════════════════════════════════════════════════
// 4. La deuxième partie, la rue ne prend plus de gants
// ═══════════════════════════════════════════════════════════════════════════
await p.evaluate(() => {
  localStorage.clear();
  // Un score au compteur suffit : ce n'est plus une première partie.
  localStorage.setItem('roi-du-carton-scores', JSON.stringify([{ name: 'Feu Robert', days: 4, score: 120 }]));
});
await nouvellePartie();
verifier('la Bagarre est là dès le premier écran d\'une seconde partie', await tuile('Fight|Bagarre'));
verifier('le Vol aussi', await tuile('Steal|Voler'));
verifier('et le texte d\'arrivée ne s\'invite pas',
  !/Nobody is expecting you anywhere|Personne ne vous attend nulle part/i.test(await texte()));

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLe premier jour se raconte, et la deuxième partie n\'y a pas droit.');
process.exit(echecs ? 1 : 0);
