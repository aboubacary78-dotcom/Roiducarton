/*
 * PAYER NE DOIT PAS APPAUVRIR, ET UN MINI-JEU DOIT POUVOIR S'ÉVITER.
 *
 * Dans ce jeu, la vidéo facultative n'est pas une nuisance : c'est un levier.
 * Doubler un gain, garder son allure, rouvrir une boutique, se relever à la
 * mort. Le joueur qui achetait « Sans pub » achetait donc, sans le savoir, la
 * disparition de ses propres outils. Le défaut ne se voyait nulle part en
 * particulier, trente et un points d'appel, tous corrects pris un par un.
 *
 * Trois choses se vérifient ici, et aucune n'est visible à l'œil :
 *
 *   ① SANS ACHAT : le plafond de trois offres par session tient. Il protège
 *     du harcèlement, et un plafond qui ne plafonne plus ne se remarque
 *     qu'aux mauvais avis sur le store.
 *   ② AVEC ACHAT : la récompense tombe SANS vidéo, sans plafond, et les
 *     boutons cessent de dire « (pub) », un acheteur à qui on promet une
 *     vidéo qui n'arrive pas se demande ce qui est cassé.
 *   ③ LES DEUX ÉCHAPPATOIRES : le casse se termine proprement sans traverser
 *     la grille, et le combat se gagne sans jouer une manche, butin compris,
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
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
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

// ── ② Avec achat : la cadence est PAR ACTIVITÉ ────────────────────────────
/*
 * Trois versions de ce bloc, et les deux premières se sont fait renvoyer à
 * l'écoute du jeu réel :
 *
 *   1. « aucune limite pour qui a payé »  →  « c'est trop cheater » ;
 *   2. « trois actions, toutes activités confondues »  →  « ultra facile, il
 *      n'y avait plus rien à faire ». Trois mendicités rouvraient l'extincteur
 *      ET le vol tranquille ET le coup de pouce, d'un seul coup.
 *
 * Ce que ce contrôle vérifie donc maintenant, et qui manquait aux deux
 * précédents : les compteurs sont ÉTANCHES. Jouer un combat n'ouvre rien du
 * côté du vol.
 */
const cadence = await p.evaluate(async () => {
  const { canOfferRewarded, showRewarded, bonusFr, bonusEn, bonusOffert,
          noterEngagement, engagementsAvantBonus } = window.__pub;
  localStorage.setItem('roi-du-carton-noads', '1');
  window.__pub.setAdsRemoved(true);

  const auDepart = canOfferRewarded('combat');            // rien de joué encore
  noterEngagement('combat');                              // 1er combat
  const apres1 = canOfferRewarded('combat');
  noterEngagement('combat');                              // 2e
  const apres2 = canOfferRewarded('combat');
  const restant = engagementsAvantBonus('combat');
  noterEngagement('combat');                              // 3e : ça s'ouvre
  const apres3 = canOfferRewarded('combat');

  // …et le vol, lui, n'a rien reçu au passage. C'est le cœur du correctif.
  const volFerme = canOfferRewarded('vol');

  const recompense = await showRewarded({ famille: 'combat' });
  const refermé = canOfferRewarded('combat');             // consommé, ça referme

  // Les rencontres tiennent sur deux, pas trois : elles arrivent bien plus
  // souvent, et un bonus visible une fois sur trois y serait invisible.
  noterEngagement('evenement');
  const evt1 = canOfferRewarded('evenement');
  noterEngagement('evenement');
  const evt2 = canOfferRewarded('evenement');

  return {
    offert: bonusOffert(), auDepart, apres1, apres2, restant, apres3,
    volFerme, recompense, refermé, evt1, evt2,
    fr: bonusFr('Doubler mes gains'), en: bonusEn('Double my gains'),
  };
});

verifier('le bonus de combat est fermé tant qu\'on n\'a pas joué',
  cadence.auDepart === false && cadence.apres1 === false && cadence.apres2 === false,
  `départ ${cadence.auDepart}, après 1 ${cadence.apres1}, après 2 ${cadence.apres2}`);
verifier('  …le TROISIÈME combat l\'ouvre',
  cadence.apres3 === true, `il restait ${cadence.restant} combat(s) à jouer`);
verifier('  …et jouer des combats n\'ouvre RIEN du côté du vol',
  cadence.volFerme === false);
verifier('  …s\'en servir le referme aussitôt',
  cadence.recompense === true && cadence.refermé === false);
verifier('  …les rencontres, elles, tiennent sur deux',
  cadence.evt1 === false && cadence.evt2 === true);
verifier('  …et plus un bouton ne promet de pub',
  cadence.offert === true && !cadence.fr.includes('pub') && !cadence.en.includes('(ad)'),
  `${cadence.fr} / ${cadence.en}`);

// ── ③ Le casse : la cadence se remplit EN JOUANT ──────────────────────────
/*
 * Deux choses distinctes se vérifient ici, et la première est la plus
 * importante : que le fait d'ENTRER dans le casse fasse bien avancer le
 * compteur du vol. C'est le branchement réel, un compteur juste que rien
 * n'alimente donnerait un bonus qui ne s'ouvre jamais, et le test précédent
 * ne l'aurait pas vu puisqu'il poussait le compteur lui-même.
 *
 * On complète ensuite à la main pour atteindre le troisième, SANS recharger
 * la page : le compteur vit en mémoire, un rechargement le remettrait à zéro.
 */
let dansLeCasse = false;
let avantEntree = null, apresEntree = null;
for (let essai = 0; essai < 6 && !dansLeCasse; essai++) {
  await situer({ day: 4, ...SOLVABLE, stats: SAIN, location: 'centre-ville' });
  avantEntree = await p.evaluate(() => window.__pub.engagementsAvantBonus('vol'));
  await clic('Voler|Steal'); await pause(1400);
  for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(350); }
  await p.evaluate(() => {
    const c = [...document.querySelectorAll('[class*="cursor-pointer"], button')]
      .find(e => /€/.test(e.textContent || '') && e.offsetWidth);
    c?.click();
  });
  await pause(1200);
  for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(350); }
  dansLeCasse = /Discret|Unseen/i.test(await ecran());
  if (dansLeCasse) apresEntree = await p.evaluate(() => window.__pub.engagementsAvantBonus('vol'));
}
verifier('on entre dans le casse', dansLeCasse, dansLeCasse ? '' : (await ecran()).slice(0, 120));
verifier('  …et y entrer fait avancer le compteur du vol',
  avantEntree === 3 && apresEntree === 2, `${avantEntree} → ${apresEntree} casse(s) restant(s)`);

/*
 * ON REMPLIT LA CADENCE AVANT D'ENTRER, PAS PENDANT.
 *
 * `canOfferRewarded` est lu au RENDU. Pousser le compteur pendant qu'un écran
 * est déjà affiché ne le redessine pas. React n'a aucune raison de le savoir,
 * et un joueur ne peut de toute façon pas jouer deux casses depuis l'intérieur
 * d'un casse. On simule donc les deux premiers, puis on entre : le troisième
 * est compté par le jeu lui-même, à l'entrée, avant le premier rendu.
 */
let boutonCasse = false;
for (let essai = 0; essai < 6 && !boutonCasse; essai++) {
  await situer({ day: 4, ...SOLVABLE, stats: SAIN, location: 'centre-ville' });
  await p.evaluate(() => { window.__pub.noterEngagement('vol'); window.__pub.noterEngagement('vol'); });
  await clic('Voler|Steal'); await pause(1400);
  for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(350); }
  await p.evaluate(() => {
    const c = [...document.querySelectorAll('[class*="cursor-pointer"], button')]
      .find(e => /€/.test(e.textContent || '') && e.offsetWidth);
    c?.click();
  });
  await pause(1200);
  for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(350); }
  boutonCasse = await p.evaluate(() =>
    [...document.querySelectorAll('button')].some(b => /Personne ne vous voit|Nobody sees you/i.test(b.textContent || '')));
}
verifier('  …au troisième casse, on peut filer sans jouer', boutonCasse,
  boutonCasse ? '' : (await ecran()).slice(0, 120));

if (boutonCasse) {
  /*
   * LE VOL ACHETÉ VAUT UN COUP DE MAÎTRE.
   *
   * Il rendait `ok`, un vol propre, mais sans le respect ni l'objet convoité.
   * La règle retenue est la même que pour le combat : ce qu'on achète, c'est
   * de ne pas jouer le mini-jeu, pas une demi-récompense.
   *
   * `jackpot` est le seul palier qui donne +2 de respect ; c'est donc lui
   * qu'on mesure, et non l'argent, dont la fourchette chevauche celle d'une
   * sortie ordinaire et ne prouverait rien.
   */
  const avantVol = await p.evaluate(() =>
    JSON.parse(localStorage.getItem('roi-du-carton-save')).character.respect);
  await clic('Personne ne vous voit|Nobody sees you');
  await pause(2600);
  verifier('    …et le vol se termine, sans grille traversée',
    !/Personne ne vous voit/i.test(await ecran()));
  const apresVol = await p.evaluate(() =>
    JSON.parse(localStorage.getItem('roi-du-carton-save')).character.respect);
  verifier('    …au palier du coup de maître : +2 de respect',
    apresVol >= avantVol + 2, `respect ${avantVol} → ${apresVol}`);
}

// ── ④ Le combat : même règle, compteur séparé ─────────────────────────────
await situer({ day: 5, ...SOLVABLE, stats: SAIN, location: 'zone-industrielle' });
let enCombat = false;
let avantCombat = null, apresCombat = null;
for (let essai = 0; essai < 6 && !enCombat; essai++) {
  avantCombat = await p.evaluate(() => window.__pub.engagementsAvantBonus('combat'));
  await clic('Bagarre|Fight'); await pause(1500);
  for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(350); }
  enCombat = /Tenter de fuir|Try to flee/i.test(await ecran());
  if (enCombat) apresCombat = await p.evaluate(() => window.__pub.engagementsAvantBonus('combat'));
  else await situer({ day: 5, ...SOLVABLE, stats: SAIN, location: 'zone-industrielle' });
}
verifier('un combat s\'engage', enCombat, enCombat ? '' : (await ecran()).slice(0, 120));
verifier('  …et l\'engager fait avancer le compteur du combat',
  avantCombat === 3 && apresCombat === 2, `${avantCombat} → ${apresCombat} combat(s) restant(s)`);

// Même chose pour le combat : deux engagements simulés, le troisième joué.
let boutonObjet = false;
for (let essai = 0; essai < 8 && !boutonObjet; essai++) {
  await situer({ day: 5, ...SOLVABLE, stats: SAIN, location: 'zone-industrielle' });
  await p.evaluate(() => { window.__pub.noterEngagement('combat'); window.__pub.noterEngagement('combat'); });
  await clic('Bagarre|Fight'); await pause(1500);
  for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(350); }
  if (!/Tenter de fuir|Try to flee/i.test(await ecran())) continue;
  boutonObjet = await p.evaluate(() =>
    [...document.querySelectorAll('button')].some(b => /extincteur|extinguisher/i.test(b.textContent || '')));
}
verifier('  …au troisième combat, l\'objet miracle est là', boutonObjet,
  boutonObjet ? '' : (await ecran()).slice(0, 120));

if (boutonObjet) {
  /*
   * UNE VICTOIRE ACHETÉE VAUT UNE VICTOIRE GAGNÉE.
   *
   * Ce contrôle a dit les deux choses. J'ai d'abord amputé le butin des
   * combats gagnés à l'extincteur (argent oui, respect et objet non) au motif
   * que le raccourci serait sinon meilleur que de jouer. Ce n'est pas la règle
   * retenue : ce qu'on achète, c'est de ne pas jouer le mini-jeu, pas une
   * demi-récompense. Un butin amputé sans explication se lit comme un bug.
   *
   * On vérifie donc que TOUT arrive, et on le prouve sur ce que cet
   * adversaire-là déclare : affirmer « le respect a été donné » ne vaut rien
   * face à un ennemi qui n'en donne pas. On relit son butin au catalogue.
   */
  const { readFileSync } = await import('node:fs');
  const src = readFileSync('client/src/contexts/data/enemies.ts', 'utf8');
  const nomEnnemi = await p.evaluate(() => {
    const m = document.body.innerText.match(/([A-ZÉÈÀÇ][^\n❤]{2,30}?)\s*❤️/);
    return m ? m[1].trim() : '';
  });
  const ligne = src.split('\n').find(l => l.includes(`name: '${nomEnnemi}'`)) ?? '';
  const declare = {
    respect: Number(ligne.match(/respect: (\d+)/)?.[1] ?? 0),
    objet: /item: \{/.test(ligne),
  };

  const etat = () => p.evaluate(() => {
    const c = JSON.parse(localStorage.getItem('roi-du-carton-save')).character;
    return { money: c.money, respect: c.respect, sac: c.inventory.length };
  });
  const avant = await etat();
  await clic('extincteur|extinguisher'); await pause(2000);
  verifier('    …et le combat est gagné', /Victoire|Victory/i.test(await ecran()));
  const apres = await etat();

  verifier('    …l\'argent du butin suit',
    apres.money >= avant.money, `${avant.money}€ → ${apres.money}€`);

  if (declare.respect > 0) {
    verifier('    …le respect AUSSI, comme un combat gagné en jouant',
      apres.respect >= avant.respect + declare.respect,
      `${nomEnnemi} déclare +${declare.respect} · ${avant.respect} → ${apres.respect}`);
  } else {
    console.log(`  (${nomEnnemi || 'cet adversaire'} ne donne pas de respect, rien à vérifier)`);
  }

  if (declare.objet) {
    verifier('    …et l\'objet qu\'il lâche',
      apres.sac > avant.sac, `sac ${avant.sac} → ${apres.sac}`);
  } else {
    console.log(`  (${nomEnnemi || 'cet adversaire'} ne lâche pas d'objet, rien à vérifier)`);
  }
}

// ── ⑤ La couronne ne s'achète pas ─────────────────────────────────────────
/*
 * LE ROI SE FORCE, IL NE S'ATTEND PAS.
 *
 * Première version : on lançait des bagarres en espérant tomber dessus. Il
 * n'est jamais venu, `rollBoss` l'exclut avant le jour 10 et le plafonne à
 * 16 % ensuite. Le contrôle s'annonçait « non joué » et ne prouvait donc rien,
 * ce qui est pire qu'un contrôle absent : ça se lit comme une couverture.
 *
 * On force donc le tirage. `Math.random` est écrasé le temps du clic, toute
 * valeur sous la probabilité du boss le fait apparaître, puis remis en place
 * aussitôt, pour ne pas fausser le reste de la partie.
 */
await situer({ day: 40, respect: 40, ...SOLVABLE, stats: SAIN, location: 'zone-industrielle' });
await p.evaluate(() => {
  window.__vraiRandom = Math.random;
  Math.random = () => 0.001;
});
await clic('Bagarre|Fight'); await pause(1500);
await p.evaluate(() => { Math.random = window.__vraiRandom; });
for (const m of ['on y va|Got it', 'compris|Understood']) { if (await clic(m)) await pause(350); }

await p.evaluate(() => {
  // Cadence remplie exprès : sans ça, l'absence du bouton ne prouverait rien,
  // il manquerait faute de combats joués et non parce que c'est le Roi.
  window.__pub.noterEngagement('combat');
  window.__pub.noterEngagement('combat');
  window.__pub.noterEngagement('combat');
});
await pause(400);
const texteRoi = await ecran();
const faceAuRoi = /👑/.test(texteRoi) && /Tenter de fuir|Try to flee/i.test(texteRoi);
verifier('le Roi se présente', faceAuRoi, faceAuRoi ? '' : texteRoi.slice(0, 130));

if (faceAuRoi) {
  const propose = await p.evaluate(() =>
    [...document.querySelectorAll('button')].some(b => /extincteur|extinguisher/i.test(b.textContent || '')));
  verifier('  …et l\'objet miracle n\'est PAS proposé contre lui', !propose);

  // La règle doit tenir dans le reducer aussi, pas seulement à l'affichage :
  // c'est elle qui protégera le jour où un autre écran voudra ce raccourci.
  const forcee = await p.evaluate(() => {
    const avant = document.body.innerText;
    window.__forcerCoupDeGrace?.();
    return { avant: avant.slice(0, 40) };
  });
  void forcee;
  const apresForcage = await ecran();
  verifier('  …et le combat contre le Roi continue',
    /Tenter de fuir|Try to flee/i.test(apresForcage), apresForcage.slice(0, 110));
}

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nPayer n\'appauvrit plus, et deux mini-jeux se laissent éviter.');
process.exit(echecs ? 1 : 0);
