/*
 * LES GESTES DU JOUEUR : UN APPUI VAUT UN, ET RIEN NE SE POSE SUR LE BOUTON.
 *
 * Deux défauts trouvés par un rapport de playtest, et l'un comme l'autre
 * s'étaient glissés sous les tests existants — parce qu'aucun ne tapait vite,
 * et qu'aucun ne regardait QUI reçoit le doigt.
 *
 *   1. Deux appuis sur « Jour Suivant » dans le même tick JavaScript faisaient
 *      passer du jour 1 au jour 3. React groupe les deux envois avant de rendre
 *      quoi que ce soit : le second arrivait sur un état où rien ne l'arrêtait,
 *      et le joueur encaissait deux nuits de dégradation en n'en voyant qu'une.
 *      Sur des jauges basses, cela tue. Même mécanique sur les cinq tuiles
 *      d'action : deux actions consommées sur trois pour un seul événement.
 *
 *   2. Le conseil du moment, barre flottante en bas d'écran, se posait
 *      exactement sur « Jour Suivant » une fois la page défilée. Le bouton
 *      était visible, cliquable en apparence, et pourtant le doigt refermait le
 *      conseil. C'est le pire genre de défaut : rien n'a l'air cassé.
 *
 * On ne mesure donc pas seulement l'état après coup, mais aussi ce que
 * `elementFromPoint` renvoie au centre du bouton — la seule question qui
 * compte pour un pouce.
 */
import puppeteer from 'puppeteer-core';

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
const jour = () => p.evaluate(() => {
  const m = document.body.innerText.match(/Day (\d+)|Jour (\d+)/);
  return m ? Number(m[1] || m[2]) : -1;
});
const actionsAffichees = () => p.evaluate(() => {
  const m = document.body.innerText.match(/(\d+)\s+actions?/i);
  return m ? Number(m[1]) : -1;
});

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

// ---- Une partie, et le carton du matin refermé -----------------------------
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
// Le cadeau quotidien se pose par-dessus tout : sans ça, c'est lui qu'on mesure.
await clic('Regarder|Take a look'); await pause(700);
await clic('Merci|Thanks'); await pause(700);

// ═══════════════════════════════════════════════════════════════════════════
// 1. Le conseil du moment ne recouvre pas « Jour Suivant »
// ═══════════════════════════════════════════════════════════════════════════
await pause(2000);   // le conseil attend 900 ms avant de paraître
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await pause(600);

const bas = await p.evaluate(() => {
  const nd = document.getElementById('tuto-nextday');
  const conseil = [...document.querySelectorAll('button')]
    .find(x => /got it|compris/i.test(x.textContent || '') && getComputedStyle(x).position === 'fixed');
  if (!nd) return null;
  const a = nd.getBoundingClientRect();
  const c = conseil?.getBoundingClientRect();
  const dessus = document.elementFromPoint(a.left + a.width / 2, a.top + a.height / 2);
  return {
    conseilPresent: !!conseil,
    recouvrement: c ? Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top)) : 0,
    leDoigtToucheLeBouton: nd.contains(dessus),
    dansLaFenetre: a.bottom <= window.innerHeight + 1 && a.top >= 0,
  };
});

if (!bas) {
  verifier('« Jour Suivant » est à l\'écran', false);
} else if (!bas.conseilPresent) {
  console.log('  (aucun conseil affiché sur cette partie — mesure d\'occlusion sautée)');
} else {
  verifier('le conseil du moment ne recouvre pas « Jour Suivant »',
    bas.recouvrement === 0, `${bas.recouvrement} px de recouvrement`);
  verifier('le doigt au centre de « Jour Suivant » touche le bouton',
    bas.leDoigtToucheLeBouton);
  verifier('« Jour Suivant » tient dans la fenêtre une fois défilé', bas.dansLaFenetre);
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Deux appuis dans la même image ne comptent qu'une fois
// ═══════════════════════════════════════════════════════════════════════════
const actAvant = await actionsAffichees();
await p.evaluate(() => {
  const e = [...document.querySelectorAll('button')]
    .find(x => /(Explore|Explorer)/i.test(x.textContent || '') && !x.disabled && x.offsetWidth);
  if (!e) throw new Error('tuile Explorer introuvable');
  e.click(); e.click();   // aucun rendu React entre les deux
});
await pause(1600);
// On revient à l'écran principal : le compteur d'actions n'est visible que là.
for (let i = 0; i < 6; i++) {
  if ((await actionsAffichees()) !== -1) break;
  await clic('← Back|← Retour|Back|Retour|Continue|Continuer|Suivant|Next|Regarder|Take a look|Merci|Thanks');
  await pause(700);
}
const actApres = await actionsAffichees();
verifier('deux appuis sur une tuile ne consomment qu\'une action',
  actAvant - actApres === 1, `${actAvant} → ${actApres} action(s) restante(s)`);

const jourAvant = await jour();
await p.evaluate(() => {
  const e = document.getElementById('tuto-nextday');
  e.click(); e.click();
});
await pause(1800);
const jourApres = await jour();
verifier('deux appuis sur « Jour Suivant » n\'avancent que d\'un jour',
  jourApres === jourAvant + 1, `jour ${jourAvant} → ${jourApres}`);

const effondre = await p.evaluate(() =>
  /carton s'est effondré|cardboard collapsed|Minified React error/i.test(document.body.innerText));
verifier('aucun effondrement après les doubles appuis', !effondre);
verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nUn appui vaut un, et le bouton principal reçoit le doigt.');
process.exit(echecs ? 1 : 0);
