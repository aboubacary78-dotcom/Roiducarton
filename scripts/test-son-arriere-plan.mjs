/*
 * LE SON S'ARRÊTE QUAND ON QUITTE L'APPLICATION.
 *
 * On capture l'AudioContext que le jeu fabrique — en enveloppant le
 * constructeur AVANT que la page ne charge — puis on bascule la visibilité de
 * la page par CDP, exactement comme Android le fait en passant l'application
 * en arrière-plan. Ce que l'on regarde est l'état réel du contexte : c'est lui
 * qui décide si le haut-parleur produit quelque chose.
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

await p.evaluateOnNewDocument(() => {
  const Vrai = window.AudioContext;
  window.__ctxs = [];
  window.AudioContext = class extends Vrai {
    constructor(...a) { super(...a); window.__ctxs.push(this); }
  };
});

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await pause(1000);
// Un geste débloque l'audio et lance l'ambiance de l'écran-titre.
await p.evaluate(() => [...document.querySelectorAll('button')]
  .find(x => /New Game|Nouvelle/i.test(x.textContent || '') && x.offsetWidth)?.click());
await pause(1800);

const etat = () => p.evaluate(() => (window.__ctxs || []).map(c => c.state).join(','));
/*
 * `Emulation.setPageVisibilityOverride` n'existe pas dans ce Chromium : on
 * force donc `document.visibilityState` et on émet l'événement à la main.
 * C'est exactement ce que le système envoie à la vue web quand l'application
 * passe en arrière-plan — et c'est précisément ce que le correctif écoute.
 */
const visibilite = async (v) => {
  await p.evaluate((etat) => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true, get: () => etat,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, v);
  await pause(800);
};

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

const enJeu = await etat();
verifier('le jeu a bien ouvert un contexte audio', enJeu.length > 0, `état : ${enJeu}`);
verifier('il tourne pendant qu’on joue', enJeu.includes('running'), enJeu);

await visibilite('hidden');
const cache = await etat();
verifier('APPLICATION EN ARRIÈRE-PLAN : le son est suspendu',
  cache.length > 0 && !cache.includes('running'), `état : ${cache}`);

await visibilite('visible');
const revenu = await etat();
verifier('au retour, le son repart', revenu.includes('running'), `état : ${revenu}`);

// En sourdine, revenir dans le jeu ne doit RIEN rallumer.
await p.evaluate(() => localStorage.setItem('roi-du-carton-muted', '1'));
await p.reload({ waitUntil: 'networkidle2' });
await pause(1200);
await p.evaluate(() => [...document.querySelectorAll('button')]
  .find(x => /New Game|Nouvelle|Continue|Reprendre/i.test(x.textContent || '') && x.offsetWidth)?.click());
await pause(1200);
await visibilite('hidden');
await visibilite('visible');
const sourdine = await etat();
verifier('en sourdine, le retour ne rallume rien',
  !sourdine.includes('running'), `état : ${sourdine || 'aucun contexte'}`);

// La marge de sécurité ne doit rien ajouter sur le web, où le natif ne parle pas.
const marge = await p.evaluate(() => {
  const e = document.querySelector('.safe-area');
  return e ? getComputedStyle(e).paddingTop : 'introuvable';
});
verifier('sur le web, la marge de sécurité reste nulle', marge === '0px', marge);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');
await b.close();
console.log(echecs ? `\n${echecs} vérification(s) en échec.` : '\nOn quitte le jeu, le jeu se tait.');
process.exit(echecs ? 1 : 0);
