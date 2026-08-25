/*
 * LES SONS QUI ANNONCENT — CEUX QUI NE PONCTUENT PAS UN GESTE.
 *
 * Toute la bande-son du jeu répondait au doigt du joueur. Ces sons-ci sont les
 * premiers à parler quand le JEU fait quelque chose : une jauge qui passe sous
 * le seuil, une alerte qui monte, un compte à rebours, une ronde qui entre.
 *
 * On ne peut pas les vérifier à l'appui d'un bouton — ils n'en ont pas. On
 * espionne donc les requêtes de fichiers audio, et on regarde LEQUEL part au
 * moment où l'état du jeu bascule. C'est la seule preuve qui vaille : un
 * fichier demandé au bon instant.
 */
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });

let sons = [];
p.on('request', r => {
  const m = r.url().match(/\/audio\/([\w-]+)\.mp3/);
  if (m) sons.push(m[1]);
});
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 140)));

const pause = ms => new Promise(r => setTimeout(r, ms));
const vide = () => { sons = []; };
const clic = (m) => p.evaluate((s) => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => localStorage.clear());
await pause(400);
await clic('New Game|Nouvelle'); await pause(900);
await p.evaluate(() => {
  const c = [...document.querySelectorAll('[class*="cursor-pointer"]')].find(e => /Former|Ancien/i.test(e.textContent || ''));
  c?.click();
});
await pause(1500);
await clic('Start surviving|Commencer'); await pause(1000);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(700);

/** Force les jauges puis recharge : le franchissement se rejoue à l'affichage. */
async function jauges(patch) {
  await p.evaluate((j) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    Object.assign(s.character.stats, j);
    s.character.activeFlags = ['origin-vu'];
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  }, patch);
  await p.reload({ waitUntil: 'networkidle2' });
  await pause(1000);
  await clic('Continue|Reprendre'); await pause(1200);
}

/*
 * ── LE CORPS S'EST TU, ET C'EST VOLONTAIRE ────────────────────────────────
 *
 * Ce test vérifiait que chaque jauge appelle SA voix — `corps-faim` pour la
 * faim, `corps-soif` pour la soif. C'était le bon objectif, et les prises
 * livrées ne le tiennent pas : testées au casque, elles sont inaudibles, « un
 * cri bouillie ». Vérifié de mon côté, ce ne sont pas les fichiers qui sont
 * mal encodés (64 kbit/s, durées courtes, niveau juste) mais les prises
 * elles-mêmes, et aucun réglage ne rattrape ça.
 *
 * Elles retombent donc sur `jauge-rouge`, le signal de foley d'avant, en
 * attendant des prises qui tiennent la route. On perd de dire LAQUELLE des
 * jauges lâche — c'est le texte de la pique qui s'en charge maintenant, et
 * lui le dit en toutes lettres.
 *
 * Le test dit donc l'inverse de ce qu'il disait, à dessein : aucune voix de
 * corps ne doit plus partir, et l'alerte neutre doit bien être là.
 */
for (const jauge of ['hunger', 'thirst', 'sleep', 'health', 'mental']) {
  vide();
  await jauges({ health: 80, mental: 80, hunger: 80, thirst: 80, sleep: 80, [jauge]: 12 });
  await pause(900);
  verifier(`${jauge} sous le seuil sonne l'alerte neutre`,
    sons.includes('jauge-rouge'), sons.filter(s => /jauge|corps|voix/.test(s)).join(', ') || 'aucun');
  verifier(`  …et aucune voix bouillie ne part`,
    !sons.some(s => s.startsWith('corps-') || /^voix-[hf]-tete/.test(s)),
    sons.filter(s => s.startsWith('corps-') || s.startsWith('voix-')).join(', ') || '');
}

// La dignité aussi : aucun geste ne la répare, elle n'a jamais eu de voix.
vide();
await jauges({ health: 80, mental: 80, hunger: 80, thirst: 80, sleep: 80, dignity: 12 });
await pause(900);
verifier('la dignité garde l\'alerte neutre',
  sons.includes('jauge-rouge') && !sons.some(s => s.startsWith('corps-') || /^voix-/.test(s)),
  sons.filter(s => /jauge|corps|voix/.test(s)).join(', ') || 'aucun');

// ── Les fichiers de tension existent et se chargent ────────────────────────
const dispo = await p.evaluate(async () => {
  const noms = ['tension-alerte-1', 'tension-alerte-2', 'tension-alerte-3',
    'tension-risque', 'tension-compte',
    'police-approche', 'police-presence', 'police-intervention'];
  const out = {};
  for (const n of noms) {
    const r = await fetch(`/audio/${n}.mp3`);
    out[n] = r.ok && !/text\/html/i.test(r.headers.get('content-type') || '');
  }
  return out;
});
const manquants = Object.entries(dispo).filter(([, ok]) => !ok).map(([n]) => n);
verifier('les huit sons d\'annonce sont servis par le jeu', manquants.length === 0, manquants.join(', '));

// ── Le code les appelle-t-il vraiment ? ────────────────────────────────────
// On relit les sources : un son livré mais jamais appelé ne sert à rien, et
// c'est précisément l'état dans lequel était tout le lot avant ce câblage.
const { readFileSync, readdirSync } = await import('fs');
const src = readdirSync('client/src/components/game')
  .filter(f => f.endsWith('.tsx'))
  .map(f => readFileSync(`client/src/components/game/${f}`, 'utf8'))
  .join('\n');
for (const [fn, ou] of [
  ['playTensionPalier', 'le casse'],
  ['playTensionRisque', 'la Récup\''],
  ['playTensionTic', 'la manche'],
  ['playPolicePresence', 'la ronde'],
  ['playPoliceApproche', 'le flair'],
  ['playPoliceIntervention', 'la garde à vue'],
]) {
  verifier(`${fn} est appelé (${ou})`, src.includes(`${fn}(`));
}

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLe jeu ne se contente plus de répondre : il annonce.');
process.exit(echecs ? 1 : 0);
