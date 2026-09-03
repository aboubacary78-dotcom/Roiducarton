/*
 * ON FAIT TOURNER LE JEU ET ON ÉCOUTE.
 *
 * Les suites vérifient chacune ce qu'elle est venue vérifier. Aucune ne se
 * contente d'ARPENTER : ouvrir tous les écrans, jouer plusieurs journées,
 * mourir, revenir, et ramasser tout ce que le navigateur dit pendant ce
 * temps-là. Or React signale par la console à peu près tout ce qui compte,
 * clés manquantes dans une liste, mise à jour d'un composant démonté,
 * propriété inconnue sur un élément : rien de tout ça ne casse l'écran, et
 * tout ça finit par casser quelque chose.
 *
 * Le crible tourne sur le BUILD DE PRODUCTION, seul état qui prouve quelque
 * chose, et il ne juge rien : il rapporte, groupé, avec un exemple.
 */
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });

const dits = new Map();
const noter = (genre, texte) => {
  const cle = `${genre} · ${texte.slice(0, 150)}`;
  dits.set(cle, (dits.get(cle) ?? 0) + 1);
};
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') noter(m.type(), m.text()); });
p.on('pageerror', e => noter('EXCEPTION', String(e)));
p.on('requestfailed', r => noter('requête', `${r.failure()?.errorText} ${r.url().slice(0, 90)}`));
/*
 * UN 404 N'EST PAS UNE REQUÊTE « ÉCHOUÉE » pour le navigateur : elle aboutit,
 * avec un code d'erreur. La première version de ce crible ne voyait donc que
 * le message générique de la console, sans jamais dire QUEL fichier manquait,
 * ce qui est la seule information utile.
 */
p.on('response', r => { if (r.status() >= 400) noter(`HTTP ${r.status()}`, r.url().replace('http://localhost:8099', '')); });

const pause = ms => new Promise(r => setTimeout(r, ms));
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x =>
    r.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '')) && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);
const fermer = async () => {
  for (const m of ['Compris, on y va|Compris|Got it', 'Regarder|Take a look', 'Merci|Thanks',
                   'Continuer|Continue', 'Nouvelle journée|New day', 'Commencer à survivre']) {
    if (await clic(m)) await pause(320);
  }
};

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('roi-du-carton-lang', 'fr');
  localStorage.setItem('roi-du-carton-cimetiere', JSON.stringify(
    Array.from({ length: 11 }, (_, i) => ({ seed: 'g' + i, name: 'Anonyme', day: i + 1 }))));
});
await p.reload({ waitUntil: 'networkidle2' }); await pause(1200);
await fermer();

// ── L'écran-titre et ses portes ─────────────────────────────────────────────
for (const porte of ['Registre|Cimetière|⚰️', 'Classement|Scores|🏆', 'Options|⚙️']) {
  if (await clic(porte)) { await pause(1100); await clic('Retour|Back|←'); await pause(600); }
}

// ── Une partie, et tout ce qu'on peut y ouvrir ──────────────────────────────
await clic('Nouvelle|New Game'); await pause(1000);
await p.evaluate(() => { [...document.querySelectorAll('[class*="cursor-pointer"]')][0]?.click(); });
await pause(1300);
await fermer();

const detours = [
  ['Personnaliser mon personnage', 'la garde-robe'],
  ['Le marché noir|The black market', 'la boutique'],
  ['Options|⚙️', 'les options'],
  ['Sac|Inventaire|🎒', 'le sac'],
  ['Établi|🔨', 'l\'établi'],
];
for (const [motif, quoi] of detours) {
  if (await clic(motif)) {
    await pause(1200);
    process.stdout.write(`  visité : ${quoi}\n`);
    await clic('Retour|Back|←'); await pause(700);
    await fermer();
  } else process.stdout.write(`  absent : ${quoi}\n`);
}

// ── Cinq journées jouées, toutes actions confondues ─────────────────────────
for (let jour = 0; jour < 5; jour++) {
  for (const action of ['Explorer', 'Mendier', "La Récup'", 'Bagarre', 'Voler', 'Dormir']) {
    if (!(await clic(action))) continue;
    await pause(1500);
    await fermer();
    // On ressort de tout mini-jeu ou rencontre par le premier repli venu.
    for (const sortie of ['Remonter', 'Sortir', 'Partir', 'Retour|Back|←', 'Terminer', 'Continuer']) {
      if (await clic(sortie)) { await pause(700); break; }
    }
    await fermer();
  }
  await clic('Jour Suivant|Next Day'); await pause(2000);
  await fermer();
}

await b.close();

const lignes = [...dits.entries()].sort((a, b) => b[1] - a[1]);
if (!lignes.length) { console.log('\nRien dit par la console : aucune erreur, aucun avertissement.'); process.exit(0); }
console.log(`\n${lignes.length} message(s) distincts :\n`);
for (const [texte, n] of lignes) console.log(`  ×${String(n).padStart(3)}  ${texte}`);
