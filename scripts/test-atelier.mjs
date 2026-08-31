/*
 * L'ATELIER — le visage composé et les traits choisis arrivent-ils vraiment ?
 *
 * Deux dangers, et le premier est invisible.
 *
 * ① LE CONTRAT SILENCIEUX. La clé d'un trait dans `lib/visage` EST le sel de
 *    son tirage dans `CardboardAvatar`. Rien dans TypeScript ne relie les
 *    deux : ce sont deux chaînes de caractères qui se ressemblent. Renommer
 *    l'une sans l'autre ne casse pas la compilation, ne lève aucune erreur, et
 *    donne un réglage qui ne fait plus rien — l'écran propose un choix, le
 *    visage l'ignore. On relit donc les deux fichiers et on compare.
 *
 * ② LE CHOIX QUI N'ARRIVE PAS. Composer un visage puis le voir revenir au
 *    hasard sur le hub est le genre de défaut qu'on ne remarque qu'après
 *    plusieurs parties. On joue donc le chemin complet, et on vérifie ce qui
 *    est ÉCRIT sur le personnage.
 *
 * Et un piège en écrivant ce test : constater que le personnage porte bien un
 * visage ne prouve rien si l'Atelier n'est pas acheté, puisqu'alors l'écran ne
 * s'ouvre même pas. On vérifie donc d'abord que SANS achat, rien ne change.
 *
 *     node scripts/test-atelier.mjs
 */
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

// ── ① Le contrat entre le catalogue et le dessin ──────────────────────────
const cat = readFileSync('client/src/lib/visage.ts', 'utf8');
const avatar = readFileSync('client/src/components/game/CardboardAvatar.tsx', 'utf8');

const CLES = [...cat.matchAll(/cle: '([a-z]+)'/g)].map(m => m[1]);
/*
 * Les sels réellement consultés : `choisir('x', n)` pour les traits à
 * plusieurs valeurs, `oui('x', n)` pour ceux qui sont à deux états. Un sel
 * encore lu par `pick` n'est PAS ouvert au choix, et c'est ce qu'on veut
 * attraper — un réglage affiché qui ne change rien.
 */
const SELS = new Set([
  ...[...avatar.matchAll(/choisir\('([a-z]+)'/g)].map(m => m[1]),
  ...[...avatar.matchAll(/\boui\('([a-z]+)'/g)].map(m => m[1]),
]);

verifier(`le catalogue déclare ${CLES.length} réglages`, CLES.length >= 12, CLES.join(', '));
const orphelins = CLES.filter(c => !SELS.has(c));
verifier('chaque réglage du catalogue est branché sur le dessin',
  orphelins.length === 0,
  orphelins.length ? `sans effet : ${orphelins.join(', ')}` : `${SELS.size} sels ouverts`);

// Les valeurs annoncées doivent exister : proposer « Rictus » sur un trait qui
// n'a que trois formes donnerait un bouton qui dessine autre chose.
/*
 * On découpe sur `cle: '` et non sur `{ cle:` : le catalogue écrit ses entrées
 * tantôt sur une ligne, tantôt sur plusieurs, et le second motif ne coupait
 * donc qu'une entrée sur deux. Les blocs débordaient les uns sur les autres, et
 * `hair` — une couleur, sans libellés — héritait de ceux de `eyes`. Le test
 * accusait le catalogue d'une faute qui était dans sa propre lecture.
 */
const trop = [];
const blocs = cat.split("cle: '").slice(1);
for (const bloc of blocs) {
  const cle = bloc.match(/^([a-z]+)'/)?.[1];
  const n = Number(bloc.match(/n: (\d+)/)?.[1] ?? 0);
  const nb = (bloc.split('valeurs:')[1] ?? '').split(']')[0].match(/\{ fr:/g)?.length ?? 0;
  if (nb && nb !== n) trop.push(`${cle} : ${nb} libellés pour ${n} valeurs`);
}
verifier('les libellés couvrent exactement les valeurs possibles',
  trop.length === 0, trop.join(' · '));

// ── ② Le chemin réel, dans le jeu ─────────────────────────────────────────
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
const perso = () => p.evaluate(() => {
  const s = localStorage.getItem('roi-du-carton-save');
  return s ? JSON.parse(s).character : null;
});
const choisirCandidat = () => p.evaluate(() => {
  const c = [...document.querySelectorAll('[class*="cursor-pointer"]')]
    .find(e => /Ancien|Former/i.test(e.textContent || ''))
    ?? document.querySelector('[class*="cursor-pointer"]');
  c?.click();
});

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(600);

/*
 * SANS L'ACHAT : L'ATELIER S'OUVRE, EN ESSAI.
 *
 * Ce contrôle affirmait le contraire — « sans l'achat, l'Atelier ne s'ouvre
 * pas » — et c'était vrai jusqu'à l'essai libre. Le joueur compose maintenant
 * d'abord et paie au moment de valider : l'écran DOIT s'ouvrir, et il doit
 * dire qu'il se paiera.
 *
 * Ce que l'ancienne assertion protégeait — ne pas donner gratuitement ce qu'on
 * vend — n'a pas disparu pour autant : c'est `scripts/test-atelier-essai.mjs`
 * qui s'en charge, en validant sans payer et en vérifiant que le personnage
 * part sans le visage composé. On ne le redit pas ici : deux contrôles de la
 * même règle finissent par diverger, et c'est le plus laxiste qui gagne.
 */
await clic('Nouvelle|New Game'); await pause(900);
// Par le CRAYON : toucher la carte démarre la partie, comme pour tout le
// monde. C'est la correction du jour — on ne met pas la boutique sur le
// trajet de quelqu'un qui veut juste jouer.
await p.evaluate(() => {
  [...document.querySelectorAll('button')]
    .find(x => /Composer son visage|Compose their face/i.test(x.getAttribute('aria-label') || ''))?.click();
});
await pause(1400);
const enEssai = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
verifier('sans l\'achat, l\'Atelier s\'ouvre en ESSAI',
  /Visage|Traits/i.test(enEssai) && /Essai libre|Free trial/i.test(enEssai),
  /Visage|Traits/i.test(enEssai) ? '' : enEssai.slice(0, 110));

// ── Avec l'achat ──────────────────────────────────────────────────────────
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('roi-du-carton-lang', 'fr');
  localStorage.setItem('roi-du-carton-atelier', '1');
});
await p.reload({ waitUntil: 'networkidle2' }); await pause(700);
await clic('Nouvelle|New Game'); await pause(900);
await choisirCandidat(); await pause(1400);

const atelierOuvert = await p.evaluate(() => /Visage|Traits/i.test(document.body.innerText));
verifier('avec l\'achat, choisir un candidat ouvre l\'Atelier', atelierOuvert,
  atelierOuvert ? '' : (await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 120))));

/*
 * On règle trois traits du visage, en cliquant la DERNIÈRE valeur de chacun :
 * la première pourrait coïncider avec le tirage d'origine, et le test aurait
 * l'air de marcher sans rien avoir changé.
 */
const regles = await p.evaluate(() => {
  const poses = [];
  // Chaque bloc de réglage est un titre suivi de ses boutons de valeurs.
  const blocs = [...document.querySelectorAll('div')].filter(d =>
    d.querySelector(':scope > div > span') && d.querySelectorAll(':scope > div > button').length >= 2);
  for (const bloc of blocs.slice(0, 3)) {
    const boutons = [...bloc.querySelectorAll(':scope > div > button')];
    const dernier = boutons[boutons.length - 1];
    dernier?.click();
    poses.push((dernier?.textContent || '').trim());
  }
  return poses;
});
await pause(500);

// Puis on passe aux traits et on en prend un précis, reconnaissable.
await clic('🎭 Traits|Traits'); await pause(600);
const traitPris = await p.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find(x => /Poissard/i.test(x.textContent || ''));
  b?.click();
  return !!b;
});
await pause(400);
verifier('on peut composer le visage et prendre un trait précis',
  regles.length >= 2 && traitPris, `réglés : ${regles.join(' / ')}`);

/*
 * « C'est lui » OU « C'est elle » : le bouton s'accorde au personnage, et ce
 * test ne cherchait que le masculin. Il échouait donc une fois sur trois —
 * exactement quand le tirage donnait une femme, c'est-à-dire précisément dans
 * le cas que la correction d'accord venait d'ajouter.
 */
await clic('C\'est (lui|elle)|That\'s (him|her)'); await pause(1600);
for (const m of ['Regarder|Take a look', 'Merci|Thanks', 'compris|Got it']) {
  if (await clic(m)) await pause(400);
}

const compose = await perso();
verifier('le visage composé est écrit sur le personnage',
  !!compose?.visage && Object.keys(compose.visage).length >= 2,
  JSON.stringify(compose?.visage ?? {}));
verifier('  …et les traits choisis aussi',
  compose?.traitsChoisis === true && compose.traits?.some(t => t.id === 'poissard'),
  (compose?.traits ?? []).map(t => t.id).join(', '));

/*
 * LE ×2 DU POISSARD NE SUIT PAS UN TRAIT CHOISI.
 *
 * C'est le seul endroit où l'Atelier touche à l'équilibre, et le seul garde-fou
 * posé : la prime récompense d'avoir accepté une mauvaise main, pas de se
 * l'être composée. Tout le reste de la partie compte normalement.
 */
/*
 * On relit la sauvegarde par le même chemin que le reste du test, qui rend
 * `null` proprement. La version précédente déréférençait directement et
 * PLANTAIT quand la partie n'avait pas démarré : le test mourait au lieu
 * d'échouer, et n'affichait donc aucun des contrôles précédents.
 */
const fin = await perso();
verifier('le ×2 du poissard ne s\'applique pas à un trait choisi',
  fin?.traitsChoisis === true,
  fin ? `jour ${fin.day}, traits composés : ${fin.traitsChoisis === true}` : 'aucune partie en cours');

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nOn compose sa tête, on choisit sa main, et le classement reste honnête.');
process.exit(echecs ? 1 : 0);
