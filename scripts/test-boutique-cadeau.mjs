/*
 * CE QUE LE JOUEUR VOIT VRAIMENT : le cadeau, la ligne du cimetière, et
 * l'étiquette de l'établi.
 *
 * `test-etabli-atelier.mjs` prouve que les règles tiennent. Il ne prouve pas
 * qu'elles arrivent à l'écran : un cadeau donné dans le localStorage sans
 * carte visible n'est pas un cadeau, c'est un enregistrement.
 *
 * Trois choses, sur le BUILD DE PRODUCTION :
 *
 *   ① LE CADEAU EST DONNÉ ET MONTRÉ À LA PREMIÈRE OUVERTURE, puis plus jamais.
 *     Répété à chaque visite, il cesserait d'être un présent pour devenir une
 *     réclame, et l'accessoire ne doit pas se dupliquer dans la garde-robe.
 *
 *   ② LA LIGNE DU CIMETIÈRE SE TAIT QUAND ELLE N'A RIEN À DIRE. C'est la seule
 *     preuve sociale honnête du jeu, et elle ne vaut que si elle est vraie :
 *     zéro mort, pas de ligne.
 *
 *   ③ L'ÉTIQUETTE DU HUB NE PARAÎT QU'UNE FOIS. Écartée, elle ne revient
 *     jamais, et c'est la règle la plus importante des trois : un rappel est
 *     utile, trois sont du harcèlement.
 *
 *     node scripts/test-boutique-cadeau.mjs   (le build doit être servi en 8099)
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
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x =>
    r.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '')) && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);
/** Recharge, puis reprend la partie en cours : on retombe sur le hub. */
const reprendre = async () => {
  await p.reload({ waitUntil: 'networkidle2' }); await pause(1000);
  for (const m of ['Regarder|Take a look', 'Merci|Thanks']) { if (await clic(m)) await pause(300); }
  await clic('Continuer la partie|Continue'); await pause(1000);
};
const demarrer = async () => {
  await p.reload({ waitUntil: 'networkidle2' }); await pause(800);
  for (const m of ['Regarder|Take a look', 'Merci|Thanks']) { if (await clic(m)) await pause(300); }
  await clic('Nouvelle|New Game'); await pause(900);
  await p.evaluate(() => { [...document.querySelectorAll('[class*="cursor-pointer"]')][0]?.click(); });
  await pause(1200);
};

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await demarrer();

// ═══════════════════════════════════════════════════════════════════════════
// ① Le cadeau du vendeur
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLe cadeau\n');

await clic('Le marché noir|The black market'); await pause(1000);
const premiere = await ecran();
verifier('la boutique s\'ouvre', /MARCHÉ NOIR|BLACK MARKET/i.test(premiere), premiere.slice(0, 70));
verifier('le vendeur donne quelque chose, dès la première visite',
  /C'est la maison|On the house/i.test(premiere),
  /C'est la maison/i.test(premiere) ? '' : 'aucun cadeau : la réciprocité ne se déclenche pas');

const apresCadeau = await p.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('roi-du-carton-profile'))?.unlocked ?? []; }
  catch { return []; }
});
verifier('  …et l\'accessoire est vraiment débloqué',
  apresCadeau.includes('jeton-marche'), apresCadeau.join(', ') || 'garde-robe vide');

/*
 * LE CONTRÔLE QUI COMPTE : la deuxième visite.
 *
 * Un cadeau qu'on redonne à chaque passage n'est plus un cadeau. Et un
 * accessoire ajouté deux fois se compterait deux fois dans « x/51 débloqués »,
 * ce qui rendrait le compteur faux pour toujours.
 */
await clic('Retour|Back'); await pause(700);
await clic('Le marché noir|The black market'); await pause(1000);
const seconde = await ecran();
verifier('il n\'est PAS redonné à la visite suivante',
  !/C'est la maison|On the house/i.test(seconde),
  /C'est la maison/i.test(seconde) ? 'la réclame commence ici' : '');

const compte = await p.evaluate(() => {
  try { return (JSON.parse(localStorage.getItem('roi-du-carton-profile'))?.unlocked ?? []).filter(x => x === 'jeton-marche').length; }
  catch { return -1; }
});
verifier('  …et la garde-robe n\'en compte qu\'un', compte === 1, `${compte} exemplaire(s)`);

// ═══════════════════════════════════════════════════════════════════════════
// ② La ligne du cimetière
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLa preuve sociale\n');

/*
 * ON CHERCHE LA LIGNE, PAS LE MOT.
 *
 * La tuile de l'Atelier dit déjà « Ça survit à vos morts », et la première
 * version de ce contrôle passait donc au vert par accident sur un écran qui
 * n'avait jamais compté une tombe.
 */
const LIGNE = /visages tirés au sort|faces dealt by the draw/i;
verifier('sans mort, la boutique ne parle pas du cimetière',
  !LIGNE.test(seconde),
  LIGNE.test(seconde) ? 'une preuve sociale inventée est un mensonge' : '');

// Trois tombes, telles que le jeu les écrit lui-même.
await p.evaluate(() => {
  localStorage.setItem('roi-du-carton-cimetiere', JSON.stringify([
    { seed: 'a', name: 'Marcel', day: 3 },
    { seed: 'b', name: 'Simone', day: 5 },
    { seed: 'c', name: 'Huguette', day: 2 },
  ]));
});
await demarrer();
await clic('Le marché noir|The black market'); await pause(1000);
const avecMorts = await ecran();
verifier('trois morts, et la ligne le dit en toutes lettres',
  /Trois morts\. Trois visages tirés au sort\./i.test(avecMorts),
  (avecMorts.match(/[\wÀ-ÿ-]+ morts\. [\wÀ-ÿ-]+ visages tirés au sort\./i) || ['ligne absente'])[0]);

// ═══════════════════════════════════════════════════════════════════════════
// ③ L'étiquette de l'établi
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nL\'étiquette\n');

/*
 * On pose l'établi sur le personnage VIVANT, exactement comme le fait un essai
 * libre dont le paiement n'a pas abouti (voir CharacterSelect).
 */
const graine = await p.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('roi-du-carton-save'))?.character?.seed ?? null; }
  catch { return null; }
});
verifier('on a bien un personnage vivant sous la main', !!graine, graine || 'aucune graine');

await p.evaluate(s => {
  localStorage.setItem('roi-du-carton-etabli', JSON.stringify({
    seed: s, nom: 'Marcel', genre: 'm', visage: { skin: 2, hair: 5 },
  }));
}, graine);
/*
 * REPRENDRE LA PARTIE, ET LE VÉRIFIER.
 *
 * Un rechargement rend l'écran-titre, pas le hub. La première version de ce
 * fichier cherchait l'étiquette là où elle n'a jamais eu à être : les deux
 * contrôles d'absence qui suivaient étaient vrais parce qu'ils ne regardaient
 * rien, ce qui est précisément le défaut qu'ils devaient attraper.
 */
await reprendre();
const hub = await ecran();
verifier('on est bien revenu sur le hub, pas sur l\'écran-titre',
  !/Une Épopée Urbaine|An Urban Epic/i.test(hub), hub.slice(0, 70));
verifier('le hub dit que quelqu\'un sèche sur l\'établi',
  /sèche sur l'établi|drying on the bench/i.test(hub),
  /sèche/i.test(hub) ? '' : hub.slice(0, 110));
verifier('  …et il ne lui manque que vous',
  /ne lui manque que vous|All they lack is you/i.test(hub));

/*
 * ÉCARTÉE, ELLE NE REVIENT PAS. C'est la règle qui protège la note du Play
 * Store, et la seule qu'on ne peut pas vérifier à l'œil : il faut recharger.
 */
await clic('Écarter|Dismiss'); await pause(600);
const apresEcart = await ecran();
verifier('écartée, elle disparaît tout de suite',
  !/sèche sur l'établi|drying on the bench/i.test(apresEcart));

await reprendre();
const rechargee = await ecran();
verifier('  …et le hub est bien là pour le dire',
  !/Une Épopée Urbaine|An Urban Epic/i.test(rechargee), rechargee.slice(0, 70));
verifier('  …et elle ne revient pas au rechargement',
  !/sèche sur l'établi|drying on the bench/i.test(rechargee),
  /sèche/i.test(rechargee) ? 'un rappel est utile, trois sont du harcèlement' : '');

/*
 * ET LA BOUTIQUE, ELLE, MONTRE TOUJOURS LA TÊTE QUI SÈCHE.
 *
 * L'étiquette est un rappel, qu'on a le droit d'écarter une fois pour toutes.
 * La tuile de l'Atelier est l'endroit où l'on vient regarder : y cacher ce
 * qu'on a fabriqué serait cacher l'article dans sa propre vitrine.
 */
await clic('Le marché noir|The black market'); await pause(1000);
const vitrine = await ecran();
verifier('la boutique, elle, montre encore ce qui sèche',
  /Elle sèche encore|still drying/i.test(vitrine),
  /sèche encore/i.test(vitrine) ? '' : vitrine.slice(0, 110));

// Les mesures ont bien enregistré les portes empruntées.
const mesures = await p.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('roi-du-carton-mesures')) ?? {}; } catch { return {}; }
});
verifier('chaque ouverture de boutique est comptée, avec sa porte',
  (mesures['boutique_vue:hub'] ?? 0) >= 1,
  JSON.stringify(mesures));

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nOn donne sans rien demander, on ne le redonne pas, et on ne réclame qu\'une fois.');
process.exit(echecs ? 1 : 0);
