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
    /*
     * DE QUOI NE PAS INTÉRESSER LE PRÊTEUR.
     *
     * Il aborde qui a moins de trois euros en poche, et sa proposition est
     * elle aussi une rencontre à part entière depuis peu : le test tombait
     * dessus une fois sur trois et lisait SON texte au lieu de celui d'une
     * exploration. Ce test-ci porte sur le brouillage des rencontres, pas sur
     * la dette — on écarte donc la dette du décor.
     */
    s.character.money = 20;
    s.character.stats.mental = m;
    s.character.activeFlags = ['origin-vu'];
    s.dayActions = 0;
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  }, mental);
  await p.reload({ waitUntil: 'networkidle2' }); await pause(1000);
  await clic('Continue|Reprendre'); await pause(1000);
  /*
   * LE HUB N'EST PAS TOUJOURS NU EN ARRIVANT.
   *
   * Selon le personnage tiré et ses jauges, le récit d'origine, la carte du
   * tutoriel ou un conseil du coach peuvent être posés devant — et ils avalent
   * le clic sur « Explorer ». Une fois sur trois, le test ne trouvait donc
   * aucune rencontre et accusait le brouillage de ne pas s'appliquer, alors
   * qu'il n'avait jamais atteint l'écran où on l'aurait vu.
   *
   * On balaie ce qui peut recouvrir, puis on insiste.
   */
  for (const bouton of ['Regarder|Take a look', 'Merci|Thanks', 'compris|Got it', 'Continuer|Continue']) {
    if (await clic(bouton)) await pause(400);
  }
  let ouvert = false;
  for (let essai = 0; essai < 3 && !ouvert; essai++) {
    if (await clic('Explorer|Explore')) { await pause(1200); }
    ouvert = await p.evaluate(() => !!document.querySelector('.craft-card p'));
    if (!ouvert) { await clic('compris|Got it'); await pause(400); }
  }
  if (!ouvert) return null;
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

/*
 * ET LA PONCTUATION NE BOUGE PAS.
 *
 * Le brouillage traitait « l'histoire » comme un seul mot : l'apostrophe
 * partait se promener au milieu des lettres, et « qq'uuueln » pour
 * « quelqu'un » ne se lit pas comme une lecture difficile mais comme un
 * caractère déplacé. C'est ce qui a fait signaler toute la mécanique comme
 * « des phrases parasites ».
 *
 * On lit donc le texte affiché à mental bas et on vérifie qu'aucun mot ne
 * porte une apostrophe ou un trait d'union AILLEURS qu'en position plausible.
 * Le contrôle exhaustif, sur les 1 303 phrases du jeu, est dans
 * `scripts/audit-charabia.ts` — celui-ci garde le chemin réel.
 */
/*
 * ET LE MOT PERDU EST FAIT DE SIGNES, PAS DE LETTRES MÉLANGÉES.
 *
 * Mélanger les lettres produisait exactement l'aspect d'une faute de frappe,
 * et se faisait signaler comme telle. Le contrôle vérifie donc la forme
 * VOULUE — des formes géométriques — et non seulement que « le texte a
 * changé », ce qu'une coquille satisferait tout aussi bien.
 */
const signes = await p.evaluate(() =>
  (document.body.innerText.match(/[■□▲△▼▽◆◇●○◈◉◊◐◑]/g) ?? []).length);
verifier('à mental bas, les mots perdus sont des signes illisibles',
  signes > 0, `${signes} signe(s) à l'écran`);

/*
 * LES MOTS PONCTUÉS SONT ÉPARGNÉS, ET C'EST CE QU'ON VÉRIFIE.
 *
 * Première version de ce contrôle : une expression censée décrire « une
 * apostrophe française plausible ». Elle refusait « quelqu'un » et
 * « L'Escalator », qui sont l'un et l'autre du français parfaitement correct
 * — le test accusait le jeu d'une faute qui était dans sa propre grammaire.
 *
 * La règle réelle est plus simple et se vérifie directement : le brouillage
 * ne touche pas un mot porteur d'apostrophe ou de trait d'union. Aucun de ces
 * mots ne doit donc contenir de signe illisible.
 */
const ponctuesAbimes = await p.evaluate(() =>
  (document.body.innerText.match(/\S*[■□▲△▼▽◆◇●○◈◉◊◐◑]\S*/g) ?? [])
    .filter(j => /['’-]/.test(j)));
verifier('les mots à apostrophe ou trait d\'union restent intacts',
  ponctuesAbimes.length === 0, ponctuesAbimes.slice(0, 5).join(', '));

/*
 * ET LE JEU DIT POURQUOI.
 *
 * Le brouillage était entièrement muet : rien ne reliait le texte troué à la
 * jauge de mental, et il se faisait donc prendre pour un bug — c'est le
 * retour qui est arrivé, capture à l'appui. Une pique tombe maintenant au
 * franchissement du seuil, dans la voix du jeu plutôt qu'en mode d'emploi.
 *
 * On la cherche à la source : les phrases sont dans le catalogue, et les
 * réécrire ici donnerait un contrôle vert sur un texte que le jeu n'affiche
 * pas.
 */
const { readFileSync: lire } = await import('node:fs');
const src = lire('client/src/contexts/data/piques.ts', 'utf8');
const bloc = src.slice(src.indexOf("'tete-qui-part': ["), src.indexOf('],', src.indexOf("'tete-qui-part': [")));
const PHRASES = [...bloc.matchAll(/fr: '((?:[^'\\]|\\.)*)'/g)]
  .map(m => m[1].replace(/\\'/g, "'"));
if (PHRASES.length < 5) throw new Error('les piques du mental sont introuvables dans le catalogue');

/*
 * On refait descendre le mental depuis un état LUCIDE : la pique ne sonne
 * qu'au FRANCHISSEMENT, et le personnage était déjà sous le seuil depuis les
 * contrôles précédents. Sans ce passage par le haut, on mesurerait un silence
 * parfaitement correct.
 */
await rencontre(90);
await clic('Retour|Back'); await pause(600);
await rencontre(30);
const vus = await p.evaluate(async () => {
  const vu = new Set();
  for (let i = 0; i < 40; i++) {
    document.querySelectorAll('[data-toasts] span').forEach(e => vu.add(e.textContent.trim()));
    await new Promise(r => setTimeout(r, 120));
  }
  return [...vu].filter(Boolean);
});
const prevenu = PHRASES.find(f => vus.some(v => v.includes(f.slice(0, 24))));
verifier(`le jeu prévient que c'est la tête (${PHRASES.length} phrases possibles)`,
  !!prevenu, prevenu || vus.join(' | ') || 'aucun bandeau');

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nOn lit mal, on décide encore.');
process.exit(echecs ? 1 : 0);
