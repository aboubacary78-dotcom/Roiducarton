/*
 * LE COMPAGNON, DANS UN VRAI NAVIGATEUR.
 *
 * `test-compagnon.mjs` éprouve la règle sur le réducteur. Celui-ci éprouve ce
 * que le joueur voit : le bouton qui annonce ce qu'il apporte AVANT le geste,
 * le visage qui s'ancre en haut de l'écran, et le trait écrit en toutes
 * lettres. Un effet actif qu'on ne voit pas n'existe pas, et cette moitié-là
 * ne se teste que sur pixels.
 *
 * Trouver quelqu'un demande un peu de patience : le tirage est stable par
 * (jour, quartier, joueur), donc on balaie les trois quartiers sociaux jusqu'à
 * tomber sur une rencontre. C'est aussi ce que fait le joueur.
 */
import puppeteer from 'puppeteer-core';

const SCRATCH = '/tmp/claude-0/-home-user-Roiducarton/5ae19fe6-213b-5a4c-978c-4dbf051229f6/scratchpad';
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
const texte = () => p.evaluate(() => document.body.innerText);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
// Une partie ordinaire : le premier jour a ses propres règles, on les évite.
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
await clic('Regarder|Take a look'); await pause(500);
await clic('Merci|Thanks'); await pause(700);

/** Se place à un jour et un quartier donnés, du pain en poche. */
async function seRendre(lieu, jour) {
  await p.evaluate(([l, j]) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    s.character.location = l;
    s.character.day = j;
    // On garde 'origin-vu' : sans lui, le récit d'origine se rouvre à chaque
    // rechargement et se pose sur l'écran qu'on veut photographier.
    s.character.activeFlags = ['origin-vu'];
    s.character.compagnon = undefined;
    s.character.inventory = [{ id: 'pain', name: 'Pain rassis', emoji: '🥖', type: 'food', value: 2, effect: { hunger: 12 } }];
    s.dayActions = 0;
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  }, [lieu, jour]);
  await p.reload({ waitUntil: 'networkidle2' });
  await pause(1100);
  await clic('Continue|Reprendre'); await pause(1100);
  await clic('Regarder|Take a look'); await pause(400);
  await clic('Merci|Thanks'); await pause(500);
}

/*
 * La rencontre se reconnaît à son intention, pas à sa phrase : elle vit
 * désormais dans la scène, et son libellé visible n'est plus qu'un prénom.
 * `aria-label` porte le sens, c'est aussi ce que lit un lecteur d'écran.
 */
const RENCONTRE = 'Aller voir|Go see';
let trouve = null;
for (const lieu of ['gare', 'marche', 'centre-ville']) {
  for (let jour = 2; jour <= 10 && !trouve; jour++) {
    await seRendre(lieu, jour);
    if (await p.evaluate((m) => [...document.querySelectorAll('button')]
      .some(x => new RegExp(m, 'i').test(x.getAttribute('aria-label') || '') && x.offsetWidth), RENCONTRE)) {
      trouve = { lieu, jour };
    }
  }
  if (trouve) break;
}
verifier('quelqu\'un traîne dans un quartier social', !!trouve,
  trouve ? `${trouve.lieu}, jour ${trouve.jour}` : 'aucune rencontre en 27 essais');
if (!trouve) { await b.close(); process.exit(1); }

await p.screenshot({ path: `${SCRATCH}/npc-sur-ecran.png` });
await p.evaluate((m) => {
  const e = [...document.querySelectorAll('button')].find(x => new RegExp(m, 'i').test(x.getAttribute('aria-label') || ''));
  e?.click();
}, RENCONTRE);
await pause(1200);

const carte = await texte();
verifier('la carte de rencontre s\'ouvre', /Share some food|Partager à manger/i.test(carte));
await p.screenshot({ path: `${SCRATCH}/compagnon-carte.png` });

/*
 * Le bouton doit annoncer la contrepartie AVANT le geste. Tous les PNJ n'ont
 * pas de trait à prêter (environ trois sur cinq) donc on ne l'exige que
 * lorsque l'annonce est là, et on vérifie alors qu'elle se tient jusqu'au bout.
 */
const annonce = await p.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find(x => /Share some food|Partager à manger/i.test(x.textContent || ''));
  return (b?.textContent || '').replace(/\s+/g, ' ').trim();
});
console.log(`    bouton : « ${annonce} »`);
const promet = /follows you today|vous suit aujourd'hui/i.test(annonce);

await clic('Share some food|Partager à manger');
await pause(1700);
const apres = await texte();
await p.screenshot({ path: `${SCRATCH}/compagnon-actif.png` });

if (promet) {
  const nomPromis = annonce.match(/^🤝?\s*[^·]*?([A-ZÉÈÀ][a-zéèêàçï-]+)\s+(?:follows you today|vous suit)/)?.[1];
  verifier('le compagnon annoncé est bien celui qui reste',
    !!nomPromis && apres.includes(nomPromis), nomPromis || annonce);
  verifier('le trait prêté est écrit sur l\'écran principal',
    /🤝/.test(apres) && /🔨|✨|🧭|👃|🐦|❄️|🏃/.test(apres));
  const ligne = apres.split('\n').find(l => l.includes('🤝'));
  console.log(`    en-tête : « ${(ligne || '').trim()} »`);
} else {
  console.log('    (ce PNJ n\'avait aucun trait à prêter, rien à annoncer)');
  verifier('sans trait à prêter, aucune compagnie n\'est promise',
    !/🤝 /.test(apres.split('\n').slice(0, 6).join('\n')));
}

// ═══════════════════════════════════════════════════════════════════════════
// Le concurrent : celui qui est parti avec quelque chose
// ═══════════════════════════════════════════════════════════════════════════
await p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
  s.character.day = 6;
  s.character.location = 'gare';
  s.character.compagnon = undefined;
  s.character.vole = {
    nom: 'Gaston', seed: 'g', gender: 'm', quartier: 'gare', jour: 6,
    objet: { id: 'manteau', name: 'Manteau', emoji: '🧥', type: 'armor', value: 12, defenseBonus: 2 },
  };
  s.dayActions = 0;
  localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
});
await p.reload({ waitUntil: 'networkidle2' });
await pause(1100);
await clic('Continue|Reprendre'); await pause(1100);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(600);

verifier('le voleur est à retrouver dans son quartier',
  /Track down Gaston|Retrouver Gaston/i.test(await texte()));
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await pause(400);
await p.screenshot({ path: `${SCRATCH}/voleur-bouton.png` });

await clic('Track down Gaston|Retrouver Gaston');
await pause(1600);
// Le combat s'ouvre sur son rappel des règles : on le referme, comme un
// joueur, avant de regarder qui se tient en face.
for (let i = 0; i < 3; i++) {
  if (!/HOW TO PLAY|RÈGLES|COMMENT/i.test(await texte())) break;
  await clic('Got it|Compris|Start|Commencer|Continue|Continuer|En piste|Allez');
  await pause(900);
}
const enCombat = await texte();
verifier('le combat contre lui s\'ouvre', /Gaston/.test(enCombat) && !/Track down/i.test(enCombat),
  enCombat.replace(/\n+/g, ' | ').slice(0, 90));
await p.screenshot({ path: `${SCRATCH}/voleur-combat.png` });

// Ailleurs, personne : la trace est liée au quartier.
await p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
  s.character.location = 'parc';
  s.character.vole = { nom: 'Gaston', seed: 'g', gender: 'm', quartier: 'gare', jour: 6 };
  s.dayActions = 0;
  localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
});
await p.reload({ waitUntil: 'networkidle2' });
await pause(1100);
await clic('Continue|Reprendre'); await pause(1200);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(500);
verifier('dans un autre quartier, il n\'est pas là',
  !/Track down Gaston|Retrouver Gaston/i.test(await texte()));

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLe repas partagé se voit à l\'écran, et le compagnon reste.');
process.exit(echecs ? 1 : 0);
