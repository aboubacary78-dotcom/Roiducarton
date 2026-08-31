/*
 * L'ATELIER EN ESSAI LIBRE : composer d'abord, payer à la validation.
 *
 * L'écran ne s'ouvrait pas sans l'achat : le joueur ne voyait jamais ce qu'il
 * n'avait pas, et on lui vendait une fonctionnalité décrite par trois puces.
 * Il compose maintenant d'abord, et le péage tombe au moment de valider, là
 * où on ne lui vend plus une fonctionnalité mais CE personnage-là.
 *
 * Ce changement crée exactement un risque, et il est grave : **l'essai peut
 * devenir gratuit pour tout le monde**. Il suffit que la garde du paiement
 * saute pour que composer et valider suffise. Rien ne le signalerait, l'écran
 * serait identique, le bouton répondrait, le personnage partirait avec son
 * visage composé, et personne ne paierait.
 *
 * Quatre contrôles, tous sur le BUILD DE PRODUCTION :
 *
 *   ① L'ATELIER S'OUVRE SANS ACHAT. C'est la moitié du changement, et sans ce
 *     contrôle les trois autres passeraient sur un écran qui ne s'ouvre pas.
 *
 *   ② IL DIT CE QU'IL COÛTE, ET AVANT DE COMPOSER. Un péage annoncé seulement
 *     à la fin se lit comme un traquenard, et le bouton doit porter le prix :
 *     un bouton qui annonce autre chose que ce qu'il fait est la définition du
 *     piège, quelle que soit la note en petit.
 *
 *   ③ VALIDER SANS PAYER N'OUVRE RIEN. Le contrôle qui compte.
 *
 *   ④ ET LA PARTIE DÉMARRE QUAND MÊME. Bloquer quelqu'un devant un écran
 *     parce qu'il n'a pas payé transformerait un essai en otage.
 *
 *     node scripts/test-atelier-essai.mjs
 */
import puppeteer from 'puppeteer-core';

let echecs = 0;
const verifier = (nom, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 160)));
const pause = ms => new Promise(r => setTimeout(r, ms));
const ecran = () => p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
const boutons = () => p.evaluate(() =>
  [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean));
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x =>
    r.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '')) && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(800);
for (const m of ['Regarder|Take a look', 'Merci|Thanks']) { if (await clic(m)) await pause(300); }
await clic('Nouvelle|New Game'); await pause(1000);

// ── ① L'Atelier s'ouvre sans achat ────────────────────────────────────────
const possede = await p.evaluate(() => window.__pub.isAtelierOwned());
verifier('on part bien SANS l\'Atelier', possede === false, `possédé : ${possede}`);

/*
 * ON PASSE PAR LE CRAYON, ET C'EST TOUT LE SUJET.
 *
 * La première version faisait ouvrir l'Atelier en touchant la carte, pour
 * TOUT LE MONDE. Ça mettait une boutique sur le trajet de chaque joueur, y
 * compris de ceux qui n'achèteront jamais, et ça a cassé d'un coup les cinq
 * suites qui démarrent une partie, ce qui était le jeu en train de dire que le
 * chemin normal n'existait plus.
 *
 * Le geste principal reste « je prends celui-là ». Le crayon est pour qui a
 * envie de regarder, c'est-à-dire exactement le public de l'essai.
 */
const crayon = await p.evaluate(() => {
  const e = [...document.querySelectorAll('button')].find(x => /Composer son visage|Compose their face/i.test(x.getAttribute('aria-label') || ''));
  if (!e) return false;
  e.click(); return true;
});
verifier('un crayon discret ouvre l\'Atelier, sans forcer personne', crayon);
await pause(1300);
const ouvert = await ecran();
verifier('  …et il s\'ouvre sans rien payer',
  /Visage|Traits|Face/i.test(ouvert), ouvert.slice(0, 110));

// ── ② Il annonce son prix avant qu'on compose ────────────────────────────
verifier('  …et il annonce l\'essai',
  /Essai libre|Free trial/i.test(ouvert),
  /Essai/i.test(ouvert) ? '' : 'aucune mention : le péage serait une surprise');

const b1 = await boutons();
const valider = b1.find(t => /Le prendre|Take this one/i.test(t));
verifier('  …et le bouton porte le prix, pas « Commencer »',
  !!valider && /\d[,.]\d\d/.test(valider),
  valider ?? b1.slice(-3).join(' · '));

// On compose quelque chose : c'est tout l'objet de l'essai.
await clic('🎭 Traits'); await pause(400);
await p.evaluate(() => {
  const t = [...document.querySelectorAll('button')].filter(x => /handicap|drawback|\+/.test(x.textContent || ''));
  t[2]?.click();
});
await pause(300);

// ── ③ Valider sans payer n'ouvre rien ────────────────────────────────────
await clic('Le prendre|Take this one');
await pause(1600);
const apres = await p.evaluate(() => ({
  possede: window.__pub.isAtelierOwned(),
  stocke: localStorage.getItem('roi-du-carton-atelier'),
  perso: (() => { try { return JSON.parse(localStorage.getItem('roi-du-carton-save'))?.character ?? null; } catch { return null; } })(),
}));
verifier('valider sans payer n\'ouvre PAS l\'Atelier',
  apres.possede === false && apres.stocke !== '1',
  `possédé ${apres.possede}, stocké ${apres.stocke}`);

/*
 * ET LE VISAGE COMPOSÉ N'EST PAS PARTI AVEC.
 *
 * C'est le vrai risque de ce chemin : la garde du paiement peut tenir tout en
 * laissant passer le RÉSULTAT de la composition. Le joueur aurait alors payé
 * zéro et gardé exactement ce qu'on vend.
 */
verifier('  …et le personnage part SANS le visage composé ni les traits choisis',
  !!apres.perso && apres.perso.visage === undefined && apres.perso.traitsChoisis !== true,
  apres.perso ? `visage ${JSON.stringify(apres.perso.visage)}, traitsChoisis ${apres.perso.traitsChoisis}` : 'aucun personnage');

// ── ④ Mais la partie démarre quand même ──────────────────────────────────
const jeu = await ecran();
verifier('la partie démarre quand même, avec le personnage tel quel',
  !!apres.perso && !/Choisissez votre Destin|Choose Your Fate/i.test(jeu),
  jeu.slice(0, 110));
verifier('  …et le joueur sait pourquoi',
  /pas à son carton|Nobody at the stall/i.test(jeu),
  /pas à son carton|Nobody at the stall/i.test(jeu) ? '' : 'aucun message : l\'échec serait muet');

/*
 * ── ET AVEC L'ACHAT, LE CHEMIN NORMAL MARCHE TOUJOURS ────────────────────
 *
 * Sans ce dernier cas, tout ce qui précède serait satisfait par un Atelier
 * définitivement cassé : « valider n'ouvre rien » est trivialement vrai quand
 * la validation ne fait plus rien du tout.
 */
await p.evaluate(() => {
  const l = localStorage.getItem('roi-du-carton-lang');
  localStorage.clear();
  localStorage.setItem('roi-du-carton-lang', l);
  localStorage.setItem('roi-du-carton-atelier', '1');
});
await p.reload({ waitUntil: 'networkidle2' }); await pause(800);
for (const m of ['Regarder|Take a look', 'Merci|Thanks']) { if (await clic(m)) await pause(300); }
await clic('Nouvelle|New Game'); await pause(1000);
await p.evaluate(() => { [...document.querySelectorAll('[class*="cursor-pointer"]')][0]?.click(); });
await pause(1300);
const achete = await ecran();
verifier('avec l\'achat, l\'Atelier ne parle plus d\'essai',
  /Visage|Traits/i.test(achete) && !/Essai libre|Free trial/i.test(achete));
await clic('C\'est (lui|elle)\\. Commencer|That\'s (him|her)\\. Start');
await pause(1600);
const paye = await p.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('roi-du-carton-save'))?.character ?? null; } catch { return null; }
});
verifier('  …et la composition arrive bien sur le personnage',
  !!paye && paye.traitsChoisis === true,
  paye ? `traitsChoisis ${paye.traitsChoisis}` : 'aucun personnage');

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : "\nOn compose librement, et ce qu'on emporte se paie.");
process.exit(echecs ? 1 : 0);
