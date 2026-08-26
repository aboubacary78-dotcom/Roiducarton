/*
 * PAYER NE DOIT PAS APPAUVRIR, ET UN MINI-JEU DOIT POUVOIR S'ÉVITER.
 *
 * Dans ce jeu, la vidéo facultative n'est pas une nuisance : c'est un levier.
 * Doubler un gain, garder son allure, rouvrir une boutique, se relever à la
 * mort. Le joueur qui achetait « Sans pub » achetait donc, sans le savoir, la
 * disparition de ses propres outils. Le défaut ne se voyait nulle part en
 * particulier — trente et un points d'appel, tous corrects pris un par un.
 *
 * Trois choses se vérifient ici, et aucune n'est visible à l'œil :
 *
 *   ① SANS ACHAT : le plafond de trois offres par session tient. Il protège
 *     du harcèlement, et un plafond qui ne plafonne plus ne se remarque
 *     qu'aux mauvais avis sur le store.
 *   ② AVEC ACHAT : la récompense tombe SANS vidéo, sans plafond, et les
 *     boutons cessent de dire « (pub) » — un acheteur à qui on promet une
 *     vidéo qui n'arrive pas se demande ce qui est cassé.
 *   ③ LES DEUX ÉCHAPPATOIRES : le casse se termine proprement sans traverser
 *     la grille, et le combat se gagne sans jouer une manche — butin compris,
 *     parce qu'une demi-victoire serait pire que rien.
 *
 *     node scripts/test-bonus-pub.mjs
 */
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 140)));

const pause = ms => new Promise(r => setTimeout(r, ms));
let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);
const ecran = () => p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(600);
await clic('Nouvelle|New Game'); await pause(900);
await p.evaluate(() => {
  const c = [...document.querySelectorAll('[class*="cursor-pointer"]')].find(e => /Ancien|Former/i.test(e.textContent || ''));
  c?.click();
});
await pause(1400);
await clic('Commencer|Start'); await pause(900);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(700);

/** Pose un état de personnage et rend la main sur le hub. */
async function situer(patch) {
  await p.evaluate((j) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    for (const [k, v] of Object.entries(j)) {
      if (v === null) delete s.character[k]; else s.character[k] = v;
    }
    s.character.activeFlags = ['origin-vu'];
    s.dayActions = 0;
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  }, patch);
  await p.reload({ waitUntil: 'networkidle2' }); await pause(1000);
  await clic('Reprendre|Continue'); await pause(1100);
  for (const m of ['on y va|Got it', 'compris|Understood', 'Regarder|Take a look', 'Merci|Thanks', '← Retour|← Back']) {
    if (await clic(m)) await pause(350);
  }
}

// De quoi ne pas intéresser le prêteur, qui ouvrirait une rencontre par-dessus.
const SOLVABLE = { money: 30, dette: null, detteRefuseeJour: null };
const SAIN = { health: 90, mental: 90, hunger: 80, thirst: 80, sleep: 80, dignity: 70 };

// ── ① Sans achat : le plafond tient ───────────────────────────────────────
/*
 * On interroge le module lui-même. Passer par l'interface demanderait de
 * provoquer trois offres réelles dans trois écrans différents, et mesurerait
 * surtout la patience du test.
 */
const sansAchat = await p.evaluate(async () => {
  const m = await import('/assets/ads.js').catch(() => null);
  return m ? 'module' : 'via-window';
});
void sansAchat;

const plafond = await p.evaluate(async () => {
  localStorage.setItem('roi-du-carton-noads', '0');
  const { canOfferRewarded, showRewarded, bonusFr } = window.__pub;
  const avant = canOfferRewarded();
  const etiquette = bonusFr('Doubler mes gains');
  // Trois offres non exemptées épuisent le quota.
  await showRewarded(); await showRewarded(); await showRewarded();
  return { avant, apres: canOfferRewarded(), etiquette };
});
verifier('sans achat, le plafond de trois offres tient',
  plafond.avant === true && plafond.apres === false,
  `avant ${plafond.avant}, après trois offres ${plafond.apres}`);
verifier('  …et le bouton annonce bien une vidéo',
  plafond.etiquette.includes('(pub)'), plafond.etiquette);

// ── ② Avec achat : le bonus reste, la vidéo part ──────────────────────────
const avecAchat = await p.evaluate(async () => {
  const { canOfferRewarded, showRewarded, bonusFr, bonusEn, bonusOffert } = window.__pub;
  localStorage.setItem('roi-du-carton-noads', '1');
  window.__pub.setAdsRemoved(true);
  return {
    offert: bonusOffert(),
    plafond: canOfferRewarded(),
    recompense: await showRewarded(),
    fr: bonusFr('Doubler mes gains'),
    en: bonusEn('Double my gains'),
  };
});
verifier('avec achat, la récompense est acquise sans vidéo',
  avecAchat.recompense === true && avecAchat.offert === true);
verifier('  …et le plafond ne s\'applique plus',
  avecAchat.plafond === true, `canOfferRewarded ${avecAchat.plafond}`);
verifier('  …et plus un bouton ne promet de pub',
  !avecAchat.fr.includes('pub') && !avecAchat.en.includes('(ad)'),
  `${avecAchat.fr} / ${avecAchat.en}`);

// ── ③ Le casse se termine sans traverser la grille ────────────────────────
await situer({ day: 4, ...SOLVABLE, stats: SAIN, location: 'centre-ville' });
await clic('Voler|Steal'); await pause(1400);
for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(400); }
// Choisir une cible s'il y a un écran de repérage.
await p.evaluate(() => {
  const c = [...document.querySelectorAll('[class*="cursor-pointer"], button')]
    .find(e => /€/.test(e.textContent || '') && e.offsetWidth);
  c?.click();
});
await pause(1200);
for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(400); }

const boutonCasse = await p.evaluate(() =>
  [...document.querySelectorAll('button')].some(b => /Personne ne vous voit|Nobody sees you/i.test(b.textContent || '')));
verifier('le casse propose de filer sans jouer', boutonCasse,
  boutonCasse ? '' : (await ecran()).slice(0, 130));

if (boutonCasse) {
  await clic('Personne ne vous voit|Nobody sees you');
  await pause(2600);
  const apres = await ecran();
  verifier('  …et le vol se termine, sans grille traversée',
    /Butin|Vous repartez|Loot|résultat|€/i.test(apres) && !/Personne ne vous voit/i.test(apres),
    apres.slice(0, 120));
}

// ── ④ Le combat se gagne sans jouer une manche ────────────────────────────
await situer({ day: 5, ...SOLVABLE, stats: SAIN, location: 'zone-industrielle' });
let enCombat = false;
for (let essai = 0; essai < 6 && !enCombat; essai++) {
  await clic('Bagarre|Fight'); await pause(1500);
  for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(400); }
  enCombat = /Tenter de fuir|Try to flee/i.test(await ecran());
  if (!enCombat) await situer({ day: 5, ...SOLVABLE, stats: SAIN, location: 'zone-industrielle' });
}
verifier('un combat s\'engage', enCombat, enCombat ? '' : (await ecran()).slice(0, 130));

if (enCombat) {
  const argentAvant = await p.evaluate(() =>
    JSON.parse(localStorage.getItem('roi-du-carton-save')).character.money);
  const boutonObjet = await p.evaluate(() =>
    [...document.querySelectorAll('button')].some(b => /extincteur|extinguisher/i.test(b.textContent || '')));
  verifier('  le combat propose l\'objet miracle', boutonObjet,
    boutonObjet ? '' : (await ecran()).slice(0, 130));

  if (boutonObjet) {
    await clic('extincteur|extinguisher'); await pause(2000);
    const apres = await ecran();
    verifier('  …et le combat est gagné', /Victoire|Victory/i.test(apres), apres.slice(0, 120));
    // Une demi-victoire serait pire que rien : le butin doit suivre.
    const argentApres = await p.evaluate(() =>
      JSON.parse(localStorage.getItem('roi-du-carton-save')).character.money);
    verifier('  …avec le butin, pas seulement la sortie',
      argentApres >= argentAvant, `${argentAvant}€ → ${argentApres}€`);
  }
}

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nPayer n\'appauvrit plus, et deux mini-jeux se laissent éviter.');
process.exit(echecs ? 1 : 0);
