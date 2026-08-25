/*
 * LA TÊTE QUI PART — ce que le mental fait au texte.
 *
 * Trois choses peuvent casser ici, et chacune transformerait une mécanique en
 * défaut :
 *
 *   · LA STABILITÉ. Si le brouillage se retirait à chaque redessin de React,
 *     les mots danseraient sous les yeux du joueur pendant qu'il lit. Ce
 *     serait un bug, et il aurait raison de le signaler.
 *   · L'INFORMATION. Les prix, les nombres et les noms propres doivent
 *     traverser intacts : brouiller ce dont dépend une décision ne rend pas le
 *     jeu inquiétant, il le rend injouable.
 *   · LES CHOIX. Le récit passe par la tête du personnage, les libellés de
 *     boutons non. Sinon on ne joue plus, on subit.
 */
import puppeteer from 'puppeteer-core';
import { readdirSync, readFileSync } from 'node:fs';

/*
 * Le catalogue des descriptions, lu à la source.
 *
 * C'est la seule preuve solide qu'un texte a bougé : une description brouillée
 * ne figure dans aucun fichier de données. Chercher des suites de consonnes
 * « impossibles », comme le faisait la version précédente de ce test, ne prouve
 * rien — un mélange de lettres tombe très souvent sur une suite parfaitement
 * prononçable, et le test passait alors à côté d'un brouillage pourtant
 * parfaitement visible à l'écran.
 */
const DOSSIER = 'client/src/contexts/data';
const CATALOGUE = new Set();
for (const f of readdirSync(DOSSIER).filter((n) => n.endsWith('.ts'))) {
  const src = readFileSync(`${DOSSIER}/${f}`, 'utf8');
  for (const m of src.matchAll(/description:\s*'((?:[^'\\]|\\.)*)'/g)) {
    CATALOGUE.add(m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
  }
}

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

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => {
  localStorage.clear();
  // En français : le catalogue lu ci-dessus contient les textes source, pas
  // leurs traductions.
  localStorage.setItem('roi-du-carton-lang', 'fr');
  localStorage.setItem('roi-du-carton-scores', JSON.stringify([{ name: 'Feu Robert', days: 3, score: 40 }]));
});
await pause(400);
await clic('New Game|Nouvelle'); await pause(900);
await p.evaluate(() => {
  const c = [...document.querySelectorAll('[class*="cursor-pointer"]')].find(e => /Former|Ancien/i.test(e.textContent || ''));
  c?.click();
});
await pause(1500);
await clic('Start surviving|Commencer'); await pause(900);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(600);

/** Ouvre une rencontre avec un mental donné, et rend ce qu'on lit. */
async function rencontre(mental) {
  await p.evaluate((m) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    s.character.day = 4;
    s.character.stats.mental = m;
    s.character.activeFlags = ['origin-vu'];
    s.dayActions = 0;
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  }, mental);
  await p.reload({ waitUntil: 'networkidle2' }); await pause(1000);
  await clic('Continue|Reprendre'); await pause(1000);
  await clic('Regarder|Take a look'); await pause(300);
  await clic('Merci|Thanks'); await pause(500);
  if (!await clic('Explorer|Explore')) return null;
  await pause(1200);
  return p.evaluate(() => {
    const desc = document.querySelector('.craft-card p');
    const choix = [...document.querySelectorAll('button.action-btn')]
      .filter(b => b.offsetWidth).map(b => b.textContent.replace(/\s+/g, ' ').trim());
    return { desc: desc ? desc.textContent : '', choix };
  });
}

const propre = (t) => (t || '').replace(/\s+/g, ' ').trim();

// ── Lucide : rien ne bouge ─────────────────────────────────────────────────
// À mental élevé, la description doit se retrouver TELLE QUELLE dans les
// données. C'est la moitié du test qu'on oublie facilement : sans elle, un
// brouillage permanent passerait pour un succès.
const clair = await rencontre(90);
verifier('une rencontre s\'ouvre', !!clair && clair.desc.length > 20, clair?.desc.slice(0, 50));
verifier('à mental haut, le texte est celui du catalogue, au caractère près',
  !!clair && CATALOGUE.has(propre(clair.desc)), clair?.desc.slice(0, 60));

// ── La tête qui part : le récit se mélange ─────────────────────────────────
const trouble = await rencontre(12);
verifier('à mental bas, une rencontre s\'ouvre encore',
  !!trouble && trouble.desc.length > 20, trouble?.desc.slice(0, 60));
verifier('à mental bas, le texte ne correspond plus à aucune description connue',
  !!trouble && !CATALOGUE.has(propre(trouble.desc)), trouble?.desc.slice(0, 70));

// ── Les chiffres et les choix restent lisibles ─────────────────────────────
if (trouble) {
  const chiffresIntacts = !/\d[a-z]|[a-z]\d/i.test(trouble.desc);
  verifier('les nombres ne sont pas touchés', chiffresIntacts);
  const choixLisibles = trouble.choix.every(c => !/[bcdfgjklmpqstvxz]{4,}/i.test(c));
  verifier('les libellés de choix restent intacts', choixLisibles,
    choixLisibles ? '' : trouble.choix.join(' | ').slice(0, 70));
}

// ── La stabilité : redessiner ne redistribue pas les lettres ───────────────
const avant = await p.evaluate(() => document.querySelector('.craft-card p')?.textContent);
await p.evaluate(() => window.dispatchEvent(new Event('resize')));
await pause(600);
const apres = await p.evaluate(() => document.querySelector('.craft-card p')?.textContent);
verifier('le texte ne danse pas d\'un redessin à l\'autre', avant === apres);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nOn lit mal, on décide encore.');
process.exit(echecs ? 1 : 0);
