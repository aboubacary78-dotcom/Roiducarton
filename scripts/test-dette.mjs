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

/** Se place dans une situation donnée, puis rouvre l'écran principal. */
async function situer(patch) {
  await p.evaluate((j) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    Object.assign(s.character, j);
    s.character.activeFlags = ['origin-vu'];
    s.dayActions = 0;
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  }, patch);
  await p.reload({ waitUntil: 'networkidle2' });
  await pause(1000);
  await clic('Continue|Reprendre'); await pause(1100);
  await clic('Regarder|Take a look'); await pause(300);
  await clic('Merci|Thanks'); await pause(500);
}

const RICHE = { day: 4, money: 40, location: 'gare', dette: undefined, detteRefuseeJour: undefined };
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

// ── Ne pas pouvoir payer, sac vide : la note monte ─────────────────────────
await situer({ day: dette.echeance, money: 0, location: 'gare', dette, inventory: [] });
await clic('Je n\'ai pas|don\'t have it'); await pause(1000);
const relance = await perso();
verifier('sac vide, la dette n\'est PAS effacée', !!relance.dette);
verifier('elle monte de 4 €', relance.dette?.montant === 19, String(relance.dette?.montant));
verifier('et il revient dans deux jours', relance.dette?.echeance === relance.day + 2,
  `jour ${relance.day}, échéance ${relance.dette?.echeance}`);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nOn emprunte quand on n\'a rien, et on paie de ce qu\'on a.');
process.exit(echecs ? 1 : 0);
