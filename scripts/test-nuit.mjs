/*
 * LA NUIT : ce qu'elle prend, ce qu'elle épargne, et ce qu'elle propose.
 *
 * Trois défauts, tous invisibles à la lecture du code.
 *
 * ① LE MATÉRIEL QUI NE SE VOIT PAS. Le matelas et le réchaud ANNULENT une
 *    perte au lieu d'ajouter une jauge. Le bilan du matin n'affichait donc
 *    rien pour eux : pas de chiffre négatif, puisqu'il n'y avait plus de
 *    perte, et un chiffre positif aurait été faux. On lisait « le matelas vous
 *    a rendu votre nuit » sans jamais savoir ce que cette nuit valait, le
 *    matériel se payait et ne se voyait pas.
 *
 * ② LE SECOURS DE NUIT DEVENU INTROUVABLE. Le rattrapage du matin était compté
 *    avec les rencontres. Un joueur qui dormait sans avoir déclenché deux
 *    résultats de rencontre dans la journée trouvait le bouton absent : « tu
 *    l'as enlevé pour les personnes qui payent ». La nuit a maintenant sa
 *    propre cadence, qui ne dépend plus de la journée écoulée.
 *
 * ③ L'ATELIER DEPUIS LA MORT. C'est là qu'on pense à composer quelqu'un,
 *    juste après avoir enterré le précédent.
 *
 * PIÈGE ÉVITÉ ICI : constater qu'un bilan ne montre aucune perte de sommeil ne
 * prouve pas que le matelas a servi. Il faut la ligne « ce que votre matériel
 * vous a évité » ET un montant, sinon on mesure une nuit tranquille.
 *
 *     node scripts/test-nuit.mjs
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
await p.reload({ waitUntil: 'networkidle2' }); await pause(700);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(400);
await clic('Nouvelle|New Game'); await pause(1000);
await p.evaluate(() => {
  const c = [...document.querySelectorAll('[class*="cursor-pointer"]')][0];
  c?.click();
});
await pause(1400);
await clic('Commencer|Start'); await pause(1000);
for (const m of ['Regarder|Take a look', 'Merci|Thanks', 'compris|Got it']) {
  if (await clic(m)) await pause(400);
}

/** Pose un état, recharge, et rend la main sur le hub. */
async function situer(patch) {
  await p.evaluate((j) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    Object.assign(s.character, j);
    s.character.activeFlags = ['origin-vu'];
    s.dayActions = 3;   // la journée est finie : « Jour Suivant » est tout ce qui reste
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  }, patch);
  await p.reload({ waitUntil: 'networkidle2' }); await pause(1000);
  await clic('Reprendre|Continue'); await pause(1100);
  for (const m of ['compris|Got it', 'Regarder|Take a look', 'Merci|Thanks', '← Retour|← Back']) {
    if (await clic(m)) await pause(350);
  }
}

const SOLVABLE = { money: 30, dette: null, detteRefuseeJour: null };

// ── ① Une nuit SANS matelas : la perte de sommeil se voit ─────────────────
await situer({
  day: 4, ...SOLVABLE, location: 'parc',
  stats: { health: 90, mental: 90, hunger: 80, thirst: 80, sleep: 60, dignity: 70 },
  inventory: [],
});
await clic('Jour Suivant|Next Day'); await pause(2200);
const sansMatelas = await ecran();
const perteSommeil = /😴[^·\n]*?−?-?\d+/.test(sansMatelas) || /Sommeil\s*-\d+/i.test(sansMatelas);
verifier('sans matelas, la nuit coûte du sommeil', perteSommeil,
  (sansMatelas.match(/Bilan[^]{0,140}/) ?? [''])[0]);
verifier('  …et rien ne parle de matériel épargné',
  !/matériel vous a évité|gear spared/i.test(sansMatelas));

// ── ② La même nuit AVEC le matelas : le montant épargné s'affiche ─────────
await clic('compris|Got it'); await pause(500);
await situer({
  day: 5, ...SOLVABLE, location: 'parc',
  stats: { health: 90, mental: 90, hunger: 80, thirst: 80, sleep: 60, dignity: 70 },
  inventory: [{ id: 'craft-matelas', name: 'Matelas de carton', emoji: '🛏️', type: 'tool', value: 6 }],
});
await clic('Jour Suivant|Next Day'); await pause(2200);
const avecMatelas = await ecran();
verifier('avec le matelas, le bilan dit ce qu\'il a évité',
  /matériel vous a évité|gear spared/i.test(avecMatelas),
  (avecMatelas.match(/matériel vous a évité[^]{0,80}/) ?? ['absent'])[0]);
/*
 * Et il annonce un MONTANT. Sans chiffre, la ligne ne dit rien de plus que la
 * phrase qui existait déjà, c'est justement ce qui manquait.
 */
const montant = avecMatelas.match(/Matelas de carton[^]{0,40}?−(\d+)/);
verifier('  …avec le nombre de points sauvés',
  !!montant && Number(montant[1]) > 0, montant ? `−${montant[1]} évités` : 'aucun montant lisible');

// ── ③ Le secours de nuit revient pour qui a payé ──────────────────────────
/*
 * On l'ouvre par la cadence de la NUIT, pas par celle des rencontres : c'est
 * tout l'objet du correctif. Deux nuits vues, la troisième propose.
 */
await clic('compris|Got it'); await pause(500);
/*
 * ON REPART D'UN COMPTEUR NEUF.
 *
 * Les compteurs de cadence vivent en mémoire et se remplissent en JOUANT :
 * les deux nuits passées plus haut en avaient déjà déposé une. Mesurer par
 * dessus donnait « après 1 nuit : ouvert », ce qui accusait le code d'une
 * avance que le test avait prise lui-même. Un rechargement les remet à zéro,
 * exactement comme pour un joueur qui rouvre le jeu.
 */
await p.evaluate(() => { localStorage.setItem('roi-du-carton-noads', '1'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(900);
const cadenceNuit = await p.evaluate(() => {
  const { canOfferRewarded, noterEngagement, engagementsAvantBonus } = window.__pub;
  const avant = canOfferRewarded('nuit');
  noterEngagement('nuit');
  const apres1 = canOfferRewarded('nuit');
  const reste = engagementsAvantBonus('nuit');
  noterEngagement('nuit');
  return { avant, apres1, reste, apres2: canOfferRewarded('nuit') };
});
verifier('la nuit a sa propre cadence, indépendante des rencontres',
  cadenceNuit.apres2 === true && cadenceNuit.apres1 === false,
  `départ ${cadenceNuit.avant}, après 1 nuit ${cadenceNuit.apres1}, après 2 ${cadenceNuit.apres2}`);
const etanche = await p.evaluate(() => window.__pub.canOfferRewarded('evenement'));
verifier('  …et les nuits n\'ouvrent rien du côté des rencontres', etanche === false);

// ── ④ L'écran de mort invite à composer ───────────────────────────────────
await p.evaluate(() => {
  localStorage.setItem('roi-du-carton-atelier', '1');
  const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
  s.character.stats.health = 1;
  localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
});
await p.reload({ waitUntil: 'networkidle2' }); await pause(1000);
await clic('Reprendre|Continue'); await pause(1100);
for (const m of ['compris|Got it', 'Regarder|Take a look', 'Merci|Thanks']) {
  if (await clic(m)) await pause(350);
}
/*
 * ON FORCE LA MORT PAR LA NUIT, ET UNE SEULE NUIT NE SUFFISAIT PAS TOUJOURS.
 *
 * La version d'avant posait la santé à 1 en laissant faim, soif et sommeil à
 * 5, puis comptait sur une nuit unique. C'est trop juste : la nuit doit à la
 * fois vider ces trois jauges ET appliquer la pénalité de privation dans le
 * même passage pour retirer le dernier point. Quand l'ordre ne tombait pas
 * bien, le personnage se réveillait vivant, le contrôle suivant lisait l'écran
 * du village au lieu de l'écran de fin, et l'échec accusait le message de mort
 * d'avoir disparu alors que personne n'était mort.
 *
 * On met donc les trois jauges au plancher, ce qui rend la privation certaine,
 * et on s'autorise trois nuits. Le compte rendu dit la santé relue à chaque
 * nuit, pour qu'une prochaine occurrence se lise au lieu de se deviner.
 */
const nuitsMortelles = [];
for (let nuit = 0; nuit < 3; nuit++) {
  await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save') || 'null');
    if (!s?.character) return;
    s.dayActions = 3;
    s.character.stats = { health: 1, mental: 40, hunger: 0, thirst: 0, sleep: 0, dignity: 20 };
    s.character.inventory = [];
    // « Métabolisme » rend 6 points de santé par nuit : un personnage tiré
    // avec lui se relève indéfiniment, et le test n'atteignait jamais l'écran
    // de mort. On retire ce seul trait, le sujet est le bilan de la nuit.
    s.character.traits = (s.character.traits || []).filter(t => t.id !== 'metabolisme');
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  });
  await p.reload({ waitUntil: 'networkidle2' }); await pause(1000);
  if (!(await clic('Reprendre|Continue'))) { nuitsMortelles.push(`n${nuit + 1} plus de reprise`); break; }
  await pause(1100);
  for (const m of ['compris|Got it', 'Regarder|Take a look', 'Merci|Thanks']) {
    if (await clic(m)) await pause(350);
  }
  await clic('Jour Suivant|Next Day'); await pause(2500);
  await clic('compris|Got it'); await pause(1500);
  const reste = await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save') || 'null');
    return s?.character?.stats?.health ?? 'personnage effacé';
  });
  nuitsMortelles.push(`n${nuit + 1} santé ${reste}`);
  if (/Pas tout de suite|Not just yet|Recommencer|Play Again|Reprendre la rue|Take the street/i.test(await ecran())) break;
}

/*
 * LA SECONDE CHANCE S'INTERPOSE, ET C'EST NORMAL.
 *
 * Tomber à zéro n'ouvre pas l'écran de fin : le jeu propose d'abord de se
 * relever, une fois par partie. Le test lisait donc « Pas tout de suite,
 * Maurice est encore là » et concluait que l'invitation à composer manquait.
 * On refuse la seconde chance, comme un joueur qui accepte la mort.
 */
if (/Pas tout de suite|Not just yet/i.test(await ecran())) {
  // Le refus se fait en DEUX temps : « Non, c'est fini », puis « Laisser X
  // partir ». C'est délibéré côté jeu, on ne renonce pas à une vie d'un
  // pouce distrait, et le test doit suivre le même chemin que le joueur.
  await clic('Non, c\'est fini|No, it\'s over'); await pause(700);
  await clic('Laisser .* partir|Let .* go'); await pause(2200);
}

const mort = await ecran();
/*
 * DEUX FORMULATIONS, SELON L'ÉCRAN.
 *
 * Sans successeur annoncé, le bouton du bas devient « Composer une nouvelle
 * âme perdue ». Avec un successeur, c'est SON bouton que le joueur touche, et
 * la mention passe dans la ligne qui l'accompagne. Chercher la seule première
 * formulation faisait échouer le test dans le cas le plus fréquent, et le
 * défaut était réel : l'invitation ne s'affichait que dans le cas le plus rare.
 */
const invite = /Composer une nouvelle âme perdue|Compose a new lost soul/i.test(mort)
  || /composer son visage|compose their face/i.test(mort);
verifier('à la mort, on propose de composer une nouvelle âme perdue', invite,
  invite ? '' : `${nuitsMortelles.join(' · ')} · écran ${mort.slice(0, 100)}`);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLa nuit dit ce qu\'elle a pris ET ce qu\'elle n\'a pas pu prendre.');
process.exit(echecs ? 1 : 0);
