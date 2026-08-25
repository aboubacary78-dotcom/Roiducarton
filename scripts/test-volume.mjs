/*
 * LE CURSEUR BAISSE-T-IL VRAIMENT LE SON ?
 *
 * Un réglage de volume est le genre de contrôle qui a l'air de marcher sans
 * marcher : le curseur bouge, le pourcentage change, la valeur est bien
 * rangée dans le localStorage — et le son sort au même niveau, parce que le
 * facteur n'a jamais atteint le graphe audio. Rien à l'écran ne le dit.
 *
 * On mesure donc le SIGNAL, pas l'état de l'interface. Le jeu joue dans un
 * contexte audio réel ; on intercale un analyseur juste avant la sortie et on
 * relève le niveau crête d'un même bruitage à trois réglages.
 *
 * Quatre choses se vérifient, et chacune correspond à un ratage possible :
 *
 *   ① À 100 % le son sort inchangé — un curseur qui atténue en position haute
 *     abîme le jeu de tout le monde pour rien.
 *   ② À 30 % il sort nettement plus bas.
 *   ③ À 0 % il ne sort plus rien.
 *   ④ Le FOND baisse sans emporter les effets — c'est toute la raison d'avoir
 *     deux curseurs plutôt qu'un, et c'est la seule chose qu'un test
 *     d'interface ne verra jamais.
 *
 *     node scripts/test-volume.mjs
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

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await p.reload({ waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 600));

/*
 * ON MESURE À LA SORTIE DU BUS, PAS À CELLE DE LA CARTE SON.
 *
 * Première tentative : remplacer `AudioContext.prototype.destination` par un
 * accesseur qui rend un analyseur. Élégant, et inutilisable — la sonde ne
 * s'installe qu'au moment où quelque chose LIT `destination`, c'est-à-dire
 * quand un premier son part. Le test se retrouvait à vérifier qu'il avait pu
 * poser sa sonde, et échouait là-dessus plutôt que sur le volume.
 *
 * On prend donc le problème par l'autre bout : le jeu expose son bus d'effets,
 * et un nœud audio peut alimenter plusieurs sorties à la fois. On branche
 * l'analyseur EN PLUS de la sortie normale. Tout ce qui traverse les curseurs
 * y passe — les effets directement, le fond parce qu'il est branché sous les
 * effets.
 */

// Un geste réel débloque l'audio : les navigateurs refusent avant. Le bouton
// « Nouvelle partie » joue déjà un son, donc il ouvre le contexte au passage.
await p.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find(b => /Nouvelle|New/i.test(b.textContent || ''));
  btn?.click();
});
await new Promise(r => setTimeout(r, 700));

const aBus = await p.evaluate(() => {
  const b = window.__bus;
  if (!b || !b.effets) return false;
  const an = b.effets.context.createAnalyser();
  an.fftSize = 2048;
  b.effets.connect(an);      // en PLUS de destination, pas à la place
  window.__sonde = an;
  return true;
});
verifier('le jeu expose ses bus, et la sonde est branchée dessus', aBus);
if (!aBus) {
  console.log('\nwindow.__bus est absent : voir sortieEffets/sortieFond dans sound.ts.');
  await b.close();
  process.exit(1);
}

/** Joue un fichier au bus demandé et rend sa crête relevée à la sortie. */
async function crete(fichier, bus) {
  return p.evaluate(async (fichier, bus) => {
    const noeud = window.__bus[bus];
    if (!noeud || !window.__sonde) return -1;
    const ac = noeud.context;
    const rep = await fetch(`/audio/${fichier}.mp3`);
    const buf = await ac.decodeAudioData(await rep.arrayBuffer());
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.connect(noeud);
    src.start();
    const an = window.__sonde;
    const data = new Float32Array(an.fftSize);
    let pic = 0;
    const fin = performance.now() + 700;
    while (performance.now() < fin) {
      an.getFloatTimeDomainData(data);
      for (let i = 0; i < data.length; i++) { const a = Math.abs(data[i]); if (a > pic) pic = a; }
      await new Promise(r => setTimeout(r, 10));
    }
    try { src.stop(); } catch { /* déjà fini */ }
    return pic;
  }, fichier, bus);
}

const reglage = (v, f) => p.evaluate((v, f) => {
  window.__bus.setVolume(v);
  window.__bus.setVolumeFond(f);
}, v, f);

const EFFET = 'jauge-rouge';

/*
 * ⓪ LE DÉFAUT, SUR UNE INSTALLATION NEUVE.
 *
 * Ce contrôle existe parce que la première version l'a raté : `getItem` rend
 * `null` quand rien n'est mémorisé, et `Number(null)` vaut 0 — un zéro accepté
 * comme un réglage volontaire. Les deux curseurs s'ouvraient donc à 0 %, et le
 * jeu était muet pour tout nouveau joueur, sans un mot d'explication à
 * l'écran. Le localStorage a été vidé au début de ce test : on est bien dans
 * le cas d'une installation neuve.
 */
const defauts = await p.evaluate(() => ({
  volume: window.__bus.getVolume(),
  fond: window.__bus.getVolumeFond(),
}));
verifier('sans rien de mémorisé, les deux volumes sont à fond',
  defauts.volume === 1 && defauts.fond === 1,
  `volume ${Math.round(defauts.volume * 100)} %, fond ${Math.round(defauts.fond * 100)} %`);

await reglage(1, 1);
await new Promise(r => setTimeout(r, 150));
const plein = await crete(EFFET, 'effets');
verifier('à 100 %, l\'effet sort à plein niveau', plein > 0.2, `crête ${plein.toFixed(3)}`);

await reglage(0.3, 1);
await new Promise(r => setTimeout(r, 150));
const bas = await crete(EFFET, 'effets');
verifier('à 30 %, il sort nettement plus bas',
  bas < plein * 0.5, `crête ${bas.toFixed(3)} contre ${plein.toFixed(3)}`);

await reglage(0, 1);
await new Promise(r => setTimeout(r, 150));
const zero = await crete(EFFET, 'effets');
verifier('à 0 %, il ne sort plus rien', zero < 0.005, `crête ${zero.toFixed(4)}`);

// ④ Le fond baisse SANS emporter les effets : la raison d'être des deux
//    curseurs. Un seul volume ne peut pas produire ce résultat.
await reglage(1, 0);
await new Promise(r => setTimeout(r, 150));
const effetSeul = await crete(EFFET, 'effets');
const fondCoupe = await crete(EFFET, 'fond');
verifier('fond à 0 : l\'effet passe toujours', effetSeul > 0.2, `crête ${effetSeul.toFixed(3)}`);
verifier('  …et le fond, lui, s\'est tu', fondCoupe < 0.005, `crête ${fondCoupe.toFixed(4)}`);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs ? `\n${echecs} vérification(s) en échec.` : '\nLe curseur baisse le son, et le bon.');
process.exit(echecs ? 1 : 0);
