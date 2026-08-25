/*
 * LA DETTE — le seul rendez-vous que le joueur emporte dans sa tête.
 *
 * Tout le reste du jeu ARRIVE : les rencontres, les suites, la météo. La dette
 * est la première chose qui ATTEND, à un jour connu d'avance. Ce test suit le
 * cycle entier, parce que chacune de ses trois sorties peut casser seule :
 *
 *   · le prêteur ne doit se montrer QU'AU MOMENT DE LA FAIBLESSE — sinon ce
 *     n'est plus un prêteur sur gages, c'est un distributeur ;
 *   · l'échéance doit trouver le joueur DANS N'IMPORTE QUEL QUARTIER, sans
 *     quoi il suffirait de déménager ;
 *   · et l'insolvabilité doit avoir deux issues distinctes — il se sert, ou la
 *     note monte. Une seule des deux, et c'est soit une punition, soit rien.
 */
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

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
const texte = () => p.evaluate(() => document.body.innerText);
const perso = () => p.evaluate(() => JSON.parse(localStorage.getItem('roi-du-carton-save')).character);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => {
  localStorage.clear();
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
await clic('Merci|Thanks'); await pause(700);

/*
 * `null` EFFACE, `undefined` NE FAIT RIEN — ET C'EST UN PIÈGE.
 *
 * Puppeteer sérialise en JSON l'argument passé à `evaluate`, et JSON supprime
 * purement et simplement les clés dont la valeur est `undefined`. Écrire
 * `{ dette: undefined }` ne remet donc RIEN à zéro dans la page : la clé
 * n'arrive jamais, la dette reste, et le test observe l'état précédent en
 * croyant observer celui qu'il vient de poser. On efface avec `null`, qui, lui,
 * traverse.
 */
function appliquer(cible, patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete cible[k];
    else cible[k] = v;
  }
}

/** Se place dans une situation donnée, puis rouvre l'écran principal. */
async function situer(patch) {
  await p.evaluate((j, src) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    (new Function('cible', 'patch', `return (${src})(cible, patch)`))(s.character, j);
    s.character.activeFlags = ['origin-vu'];
    s.dayActions = 0;
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  }, patch, appliquer.toString());
  await p.reload({ waitUntil: 'networkidle2' });
  await pause(1000);
  await clic('Continue|Reprendre'); await pause(1100);
  await clic('Regarder|Take a look'); await pause(300);
  await clic('Merci|Thanks'); await pause(500);
}

const RICHE = { day: 4, money: 40, location: 'gare', dette: null, detteRefuseeJour: null };
const FAUCHE = { ...RICHE, money: 1 };

// ── Le prêteur n'arrive qu'au moment de la faiblesse ───────────────────────
await situer(RICHE);
verifier('avec de l\'argent, personne ne propose rien',
  !/tout de suite|right now/i.test(await texte()));

await situer({ ...FAUCHE, day: 1 });
verifier('le premier jour, personne ne propose rien',
  !/tout de suite|right now/i.test(await texte()));

await situer(FAUCHE);
const offre = /tout de suite|right now/i.test(await texte());
verifier('fauché et passé le premier jour, le prêteur se présente', offre);

// ── Le refus est un vrai refus ─────────────────────────────────────────────
if (offre) {
  await clic('Refuser|Refuse'); await pause(700);
  verifier('refuser fait disparaître l\'offre du jour',
    !/tout de suite|right now/i.test(await texte()));
  verifier('et ne crée aucune dette', !(await perso()).dette);
}

/*
 * ── Accepter ───────────────────────────────────────────────────────────────
 *
 * On repasse par un AUTRE JOUR que celui du refus, et ce n'est pas de la
 * décoration : l'application se sauvegarde d'elle-même à chaque changement
 * d'état, et sa sauvegarde peut écraser celle du test entre l'écriture et le
 * rechargement. En changeant de jour, le refus d'hier ne peut plus masquer
 * l'offre d'aujourd'hui, quelle que soit celle des deux écritures qui gagne.
 */
await situer({ ...FAUCHE, day: 5 });
const avant = (await perso()).money;
const aPrisPret = await clic('Prendre les|Take the');
verifier('le prêteur revient un autre jour après un refus', aPrisPret);
await pause(900);
const apres = await perso();
verifier('accepter verse les 10 €', apres.money === avant + 10, `${avant} → ${apres.money}`);
verifier('la dette est inscrite à 15 €', apres.dette?.montant === 15, String(apres.dette?.montant));
verifier('l\'échéance est à trois jours', apres.dette?.echeance === apres.day + 3,
  `jour ${apres.day}, échéance ${apres.dette?.echeance}`);
verifier('le compteur s\'affiche dans l\'en-tête', /⏳\s*15€/.test(await texte()));

/* ── LES DEUX RENDEZ-VOUS SONT DES RENCONTRES, PAS DES ENCARTS ─────────────
 *
 * Ils vivaient dans une carte du hub avec une bande d'image de 96 pixels,
 * coincée entre la météo et les boutons — au même rang qu'un rappel de
 * contrat. Toute la mécanique repose pourtant sur un visage qu'on reconnaît
 * trois jours plus tard, et un visage ne fait pas ça en vignette.
 *
 * Trois choses à tenir, et chacune casse séparément :
 *   · la rencontre s'OUVRE toute seule en arrivant sur le hub ;
 *   · elle montre LA BONNE IMAGE — celle du prêteur qui propose, puis celle
 *     du même qui attend ;
 *   · et l'échéance ne se QUITTE PAS. Un bouton « Retour » viderait de leur
 *     sens les trois jours qu'on vient de passer à compter ses euros.
 */
async function rendezVous(patch) {
  /*
   * L'ÉCRITURE ET LE RECHARGEMENT DANS LE MÊME SOUFFLE.
   *
   * L'application se sauvegarde d'elle-même à chaque changement d'état. Entre
   * un `setItem` et un `reload` pilotés depuis Node, elle a tout le temps de
   * réécrire par-dessus — et le test se retrouvait à examiner l'état
   * précédent, en croyant examiner celui qu'il venait de poser. Ici, le
   * `reload()` part depuis la page, sur la ligne suivante : il ne reste aucune
   * fenêtre pour que React s'intercale.
   */
  await p.evaluate((j, src) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    (new Function('cible', 'patch', `return (${src})(cible, patch)`))(s.character, j);
    s.character.activeFlags = ['origin-vu'];
    s.dayActions = 0;
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
    location.reload();
  }, patch, appliquer.toString()).catch(() => { /* le rechargement coupe l'évaluation : c'est voulu */ });
  await p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await pause(1100);
  await clic('Continuer la partie|Continue'); await pause(1500);
  await clic('Regarder|Take a look'); await pause(300);
  await clic('Merci|Thanks'); await pause(1200);
  return p.evaluate(() => ({
    // Le badge « Rencontre » n'existe que sur l'écran des rencontres.
    surEcranRencontre: /Rencontre|Encounter/.test(document.body.innerText),
    image: [...document.querySelectorAll('img')].map(i => i.src.split('/').pop()).find(s => /npc-preteur/.test(s)) || null,
    retour: [...document.querySelectorAll('button')].some(b => b.offsetWidth && /^←/.test(b.textContent || '')),
    choix: [...document.querySelectorAll('button.action-btn')].filter(b => b.offsetWidth).length,
    ecran: document.body.innerText.replace(/\s+/g, ' ').slice(0, 130),
  }));
}

const OFFRE = await rendezVous({ day: 4, money: 1, location: 'gare', dette: null, detteRefuseeJour: null });
verifier('l\'offre s\'ouvre comme une rencontre', OFFRE.surEcranRencontre, OFFRE.ecran);
verifier('  …avec le visage de celui qui propose',
  OFFRE.image === 'npc-preteur.webp', OFFRE.image || 'aucune image de prêteur');
verifier('  …et on peut passer son chemin', OFFRE.retour);

const dueDette = { nom: 'Marcel', seed: 'x', gender: 'm', quartier: 'gare', montant: 15, echeance: 9 };
const ECHEANCE = await rendezVous({ day: 9, money: 2, location: 'parc', inventory: [], dette: dueDette });
verifier('l\'échéance s\'ouvre comme une rencontre', ECHEANCE.surEcranRencontre);
verifier('  …avec le MÊME visage, trois jours plus tard',
  ECHEANCE.image === 'npc-preteur-echeance.webp', ECHEANCE.image || 'aucune image de prêteur');
verifier('  …et elle, on ne la quitte pas', !ECHEANCE.retour,
  ECHEANCE.retour ? 'un bouton Retour permet de fuir l\'échéance' : 'aucune sortie');
verifier('  …payer reste affiché, verrouillé, quand on n\'a pas la somme',
  /15€ requis|15€ needed/.test(await texte()));

// ── L'échéance trouve le joueur, même ailleurs ─────────────────────────────
const dette = apres.dette;
await situer({ day: dette.echeance, money: 40, location: 'parc', dette });
const surPlace = await texte();
verifier('le jour dit, il vous trouve dans un AUTRE quartier',
  new RegExp(`${dette.nom}`).test(surPlace) && /15€/.test(surPlace));

// ── Payer ──────────────────────────────────────────────────────────────────
await clic(`Rembourser|Pay `); await pause(900);
const paye = await perso();
verifier('rembourser retire l\'argent', paye.money === 25, `${paye.money}€`);
verifier('la dette est éteinte', !paye.dette);
verifier('et ça vaut du respect', paye.respect >= 3, `⭐ ${paye.respect}`);

// ── Ne pas pouvoir payer, sac plein : il se sert ───────────────────────────
const manteau = { id: 'manteau', name: 'Manteau', emoji: '🧥', type: 'armor', value: 12, defenseBonus: 2 };
const pain = { id: 'pain', name: 'Pain rassis', emoji: '🥖', type: 'food', value: 2, effect: { hunger: 12 } };
await situer({ day: dette.echeance, money: 0, location: 'gare', dette, inventory: [pain, manteau] });
await clic('Je n\'ai pas|don\'t have it'); await pause(1000);
const saisi = await perso();
verifier('sans argent, il prend l\'objet le plus cher',
  saisi.inventory.length === 1 && saisi.inventory[0].id === 'pain',
  saisi.inventory.map(i => i.id).join(', '));
verifier('et la dette est éteinte : c\'est un paiement, pas une punition', !saisi.dette);

/*
 * ── Ne pas pouvoir payer, sac vide : il se paie sur votre peau ─────────────
 *
 * Première version : la note montait de quatre euros et il revenait dans deux
 * jours. C'était une non-conséquence — on empruntait, on dépensait tout, on
 * encaissait un report, et le prêteur devenait une banque gratuite. Il tabasse
 * désormais, et la dette est éteinte : il s'est payé à sa façon, ce qui est
 * plus dissuasif qu'un report et plus juste qu'une spirale sans issue.
 */
await situer({ day: dette.echeance, money: 0, location: 'gare', dette, inventory: [],
  stats: { health: 90, mental: 80, hunger: 70, thirst: 70, sleep: 70, dignity: 70 } });
await clic('Je n\'ai pas|don\'t have it'); await pause(1200);
const battu = await perso();
verifier('sac vide, ça coûte beaucoup de santé', battu.stats.health <= 60,
  `${battu.stats.health} pour 90 avant`);
verifier('et beaucoup de dignité', battu.stats.dignity <= 45,
  `${battu.stats.dignity} pour 70 avant`);
verifier('la dette est éteinte : il s\'est payé', !battu.dette);
verifier('le personnage est encore en vie à 90 de santé', battu.alive !== false);

// ── Et ça peut tuer : c'est un roguelite, la mort est le principe ──────────
await situer({ day: dette.echeance, money: 0, location: 'gare', dette, inventory: [],
  stats: { health: 12, mental: 80, hunger: 70, thirst: 70, sleep: 70, dignity: 70 } });
await clic('Je n\'ai pas|don\'t have it'); await pause(1400);
const mort = await p.evaluate(() => {
  const brut = localStorage.getItem('roi-du-carton-save');
  return { save: brut, ecran: document.body.innerText.slice(0, 60) };
});
verifier('à 12 de santé, la raclée tue', !mort.save || /game.?over|fin|score|repose/i.test(mort.ecran),
  mort.save ? mort.ecran : 'sauvegarde effacée');

/*
 * ── ET CETTE MORT-LÀ SE NOMME ─────────────────────────────────────────────
 *
 * Elle laisse une santé à zéro, exactement comme une bagarre : l'écran de fin
 * la rangeait donc dans « trop de coups », et la seule mort du jeu que le
 * joueur ait signée lui-même — trois jours plus tôt, en prenant dix euros —
 * ne laissait aucune trace, ni dans la une ni dans le Registre.
 */
await pause(900);
const une = await p.evaluate(() => document.body.innerText);
verifier('la une parle de la dette, pas d\'une bagarre',
  /QUINZE EUROS|FIFTEEN EUROS/i.test(une),
  (une.match(/[A-ZÉÈÀÇ' ,]{16,}/) || ['—'])[0].trim().slice(0, 52));
const registre = await p.evaluate(() => {
  try { return Object.keys(JSON.parse(localStorage.getItem('roi-du-carton-deathbook') || '{}')); }
  catch { return []; }
});
verifier('le Registre des Morts enregistre « La Note Réglée »',
  registre.includes('mort-dette'), registre.join(', ') || 'registre vide');

/*
 * ── LES SIX IMAGES, ET CE QUE LA UNE EN MONTRE VRAIMENT ───────────────────
 *
 * Deux choses distinctes, et la seconde est celle qui s'est déjà produite.
 *
 * Qu'un fichier manque se voit : le repli prend la main. Qu'une image soit
 * LÀ mais que le cadre n'en montre rien ne se voit pas du tout — la une
 * découpe un bandeau dans une image en 3:2 et jette 40 % de la hauteur. La
 * photo de la mort par dette a son sujet au sol : recadrée au centre, elle
 * n'affichait qu'un trottoir vide, la chaussure coupée en deux et la pièce
 * hors champ. Rien n'aurait signalé la perte.
 */
const images = await p.evaluate(async (liste) => {
  const out = {};
  for (const f of liste) {
    const r = await fetch(`/assets/${f}.webp`, { method: 'HEAD' });
    out[f] = r.ok;
  }
  return out;
}, ['npc-preteur', 'npc-preteur-echeance', 'result-dette-payee',
  'result-dette-saisie', 'result-dette-raclee', 'death-dette']);
const absentes = Object.keys(images).filter(k => !images[k]);
verifier('les six images de la dette sont en place',
  absentes.length === 0, absentes.join(', ') || '6/6');

// Le sujet de `death-dette` est en bas de cadre : la une doit le savoir.
const cadrage = await p.evaluate(async () => {
  const LARGE = 306, HAUT = 144, ZOOM = 1.12;   // la une, telle qu'elle est
  const i = new Image();
  i.src = '/assets/death-dette.webp';
  await i.decode().catch(() => {});
  const ratio = i.naturalWidth / i.naturalHeight;
  // `object-cover` remplit la largeur : l'image rendue déborde en hauteur.
  const rendue = LARGE / ratio;
  const part = HAUT / rendue;                   // part de hauteur visible
  // Le sur-zoom du travelling resserre encore la fenêtre, des deux côtés.
  const partZoom = part / ZOOM;
  return { haut: (1 - partZoom) / 2, bas: (1 + partZoom) / 2 };
});
// Sujet (chaussure + pièce) mesuré entre 68 % et 84 % de la hauteur d'image.
const SUJET_BAS = 0.84;
verifier('recadrée au centre, la une couperait le sujet de la mort par dette',
  cadrage.bas < SUJET_BAS,
  `bande centrale : ${(cadrage.haut * 100).toFixed(0)} % → ${(cadrage.bas * 100).toFixed(0)} %,`
  + ` le sujet descend à ${SUJET_BAS * 100} %`);
// Et c'est bien ce que fait la une : on lit le cadrage sur l'image RENDUE,
// pas dans le code. Une constante qu'on renomme sans rebrancher casserait le
// cadrage en silence, et le test doit tomber là-dessus.
const rendu = await p.evaluate(() => {
  const img = [...document.querySelectorAll('img')].find(i => i.src.includes('death-dette'));
  if (!img) return null;
  return getComputedStyle(img).objectPosition;
});
verifier('  …c\'est pourquoi la une la cadre par le bas',
  !!rendu && /bottom|100%/.test(rendu), rendu ?? 'image absente de la une');

/*
 * ── TOUS LES PRÉNOMS DU JEU ONT UN GENRE ──────────────────────────────────
 *
 * `genderFromName` répond « homme » par défaut. C'est un repli honnête et
 * parfaitement silencieux : six prénoms de femmes de la liste des PNJ n'y
 * figuraient pas, et le jeu écrivait « Jacqueline vous a regardé compter vos
 * pièces, et IL a attendu » — avec le mauvais visage sur l'avatar, en prime.
 * Rien ne l'aurait signalé sans une lecture attentive au bon moment.
 *
 * On lit les listes à la source plutôt que dans le bundle : c'est là qu'on
 * ajoute un prénom, et c'est donc là que l'oubli se produira.
 */
const listes = (fichier, nom) => {
  const src = readFileSync(fichier, 'utf8');
  // Ancré sur `const` : sans ça, chercher MALE_NAMES tombe dans FEMALE_NAMES,
  // qui le contient — et les deux listes n'en faisaient plus qu'une.
  const m = src.match(new RegExp(`const ${nom}\\s*=\\s*(?:new Set\\()?\\[([^\\]]*)\\]`));
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : [];
};
const tousPrenoms = new Set([
  ...listes('client/src/contexts/data/world.ts', 'NAMES'),
  ...listes('client/src/contexts/data/npc.ts', 'NPC_NAMES'),
]);
const classes = new Set([
  ...listes('client/src/contexts/data/world.ts', 'FEMALE_NAMES'),
  ...listes('client/src/contexts/data/world.ts', 'MALE_NAMES'),
]);
const oublies = [...tousPrenoms].filter(n => !classes.has(n));
verifier(`les ${tousPrenoms.size} prénoms du jeu ont tous un genre déclaré`,
  tousPrenoms.size > 20 && oublies.length === 0,
  oublies.length ? `sans genre : ${oublies.join(', ')}` : `${classes.size} classés`);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nOn emprunte quand on n\'a rien, et on paie de ce qu\'on a.');
process.exit(echecs ? 1 : 0);
