/*
 * LES COINS ARRONDIS CUITS DANS LE FICHIER, ET LE POIDS.
 *
 * Une image livrée pour la boutique portait des COINS ARRONDIS BLANCS gravés
 * dans le fichier : le générateur avait appliqué un arrondi décoratif, et les
 * quatre angles étaient du blanc pur. Posée sur une tuile kraft, elle montrait
 * quatre encoches pâles.
 *
 * Ce défaut a exactement la forme de ceux qui passent : il ne casse rien, il
 * ne lève aucune erreur, il ne se voit pas sur une vignette, et il se remarque
 * une fois l'image en place — parfois jamais, si le cadre qui l'accueille est
 * lui-même arrondi. Avec plus de mille images dans le jeu, personne ne les
 * rouvre une par une.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * DEUX MESURES RATÉES AVANT LA BONNE, ET ELLES DISENT LA MÊME CHOSE
 *
 * ① « LE COIN EST PLUS CLAIR QUE LE CENTRE. » Comptait comme défaut une
 *   ampoule allumée dans un angle — soit un tiers des images du jeu, qui sont
 *   toutes éclairées à la lampe chaude.
 *
 * ② « LES ANGLES CONTIENNENT DU BLANC PUR. » Meilleur, et faux quand même :
 *   soixante-sept images signalées, dont une cabine téléphonique photographiée
 *   sur un MUR DE STUDIO BLANC. Le blanc dans un angle n'est pas un arrondi,
 *   c'est peut-être simplement le fond.
 *
 * Ce qu'il fallait mesurer n'est pas la couleur : c'est la FORME. Un coin
 * arrondi a une signature géométrique qu'un fond blanc n'a pas — le blanc
 * s'arrête sur un ARC. En partant de l'angle, il court longtemps le long du
 * bord et très peu le long de la diagonale : pour un rayon R, environ R sur le
 * bord contre 0,29 R en diagonale. Un fond blanc, lui, s'étend autant dans les
 * deux directions.
 *
 * D'où la règle : les quatre angles doivent montrer ce rapport, avec une
 * course de bord courte. Et le contrôle est validé sur un TÉMOIN — l'image
 * fautive d'origine, conservée hors du dépôt — parce qu'un détecteur qu'on n'a
 * jamais vu déclencher ne prouve rien.
 *
 *     node scripts/controle-images.mjs [--temoin chemin.webp]
 */
import puppeteer from 'puppeteer-core';
import { readdirSync, statSync, existsSync } from 'node:fs';

const DOSSIER = 'client/public/assets';
const PLAFOND_KO = 155;

const iTemoin = process.argv.indexOf('--temoin');
const temoin = iTemoin > 0 ? process.argv[iTemoin + 1] : null;

/*
 * LA MESURE, ÉCRITE UNE FOIS ET PARTAGÉE.
 *
 * Elle tourne dans le navigateur (seul décodeur WebP disponible ici), donc
 * elle part en chaîne de caractères. La définir deux fois — une pour le
 * témoin, une pour le dépôt — c'est la laisser diverger.
 */
/*
 * ⚠️ La parenthèse autour de la fonction n'est pas décorative. `new Function`
 * reçoit « return » suivi de cette chaîne : si elle commence par un retour à
 * la ligne, l'insertion automatique de point-virgule coupe après `return`, et
 * la fabrique rend `undefined` au lieu de la fonction. L'erreur qui en sort —
 * « f is not a function » — ne dit rien de sa cause.
 */
const MESURE = `(async (chemin) => {
  const img = new Image();
  img.src = chemin;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const blanc = d => d[0] > 235 && d[1] > 235 && d[2] > 235;
  const px = (x, y) => g.getImageData(x, y, 1, 1).data;
  const MAX = Math.min(120, img.width >> 2, img.height >> 2);

  // Pour chaque angle : la course du blanc le long du BORD, puis en DIAGONALE.
  const angles = [];
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const x0 = sx > 0 ? 0 : img.width - 1;
    const y0 = sy > 0 ? 0 : img.height - 1;
    if (!blanc(px(x0, y0))) { angles.push(null); continue; }
    let bord = 0;
    while (bord < MAX && blanc(px(x0 + sx * bord, y0))) bord++;
    let diag = 0;
    while (diag < MAX && blanc(px(x0 + sx * diag, y0 + sy * diag))) diag++;
    angles.push({ bord, diag });
  }
  return { w: img.width, h: img.height, angles };
})`;

/**
 * Un arrondi, ou un fond blanc ?
 *
 * Les quatre angles doivent commencer par du blanc, la course de bord doit
 * rester courte (un arrondi décoratif dépasse rarement 60 px), et la diagonale
 * doit être NETTEMENT plus courte que le bord — c'est là toute la géométrie de
 * l'arc, et c'est ce qu'un fond blanc ne peut pas imiter.
 */
function estArrondi(m) {
  if (m.angles.some(a => a === null)) return false;
  return m.angles.every(a => a.bord >= 6 && a.bord <= 80 && a.diag >= 1 && a.diag < a.bord * 0.6);
}

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--allow-file-access-from-files'],
});
const p = await b.newPage();
await p.goto('file:///tmp/');

let echecs = 0;
const verifier = (nom, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

/** Applique la mesure à une image, dans la page. */
const mesurer = (url) => p.evaluate(async (src, u) => {
  const f = new Function(`return ${src}`)();
  return f(u);
}, MESURE, url);

// ── Le témoin : le détecteur déclenche-t-il seulement ? ───────────────────
if (temoin && existsSync(temoin)) {
  const m = await mesurer(`file://${temoin.startsWith('/') ? '' : process.cwd() + '/'}${temoin}`);
  verifier('le détecteur reconnaît l\'image fautive de référence', estArrondi(m),
    JSON.stringify(m.angles));
} else if (temoin) {
  console.log(`  (témoin introuvable : ${temoin})`);
}

// ── Le dépôt ──────────────────────────────────────────────────────────────
const fichiers = readdirSync(DOSSIER).filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f)).sort();
console.log(`\n${fichiers.length} images dans ${DOSSIER}\n`);

const arrondies = [];
const illisibles = [];
/*
 * PAR PAQUETS. Décoder mille images dans une seule évaluation garde autant de
 * canvas en mémoire jusqu'au retour, et fait tomber l'onglet.
 */
for (let i = 0; i < fichiers.length; i += 60) {
  const lot = fichiers.slice(i, i + 60);
  const r = await p.evaluate(async (mesureSrc, racine, dossier, lot) => {
    const mesure = new Function(`return ${mesureSrc}`)();
    const out = [];
    for (const nom of lot) {
      try { out.push({ nom, m: await mesure(`file://${racine}/${dossier}/${nom}`) }); }
      catch { out.push({ nom, m: null }); }
    }
    return out;
  }, MESURE, process.cwd(), DOSSIER, lot);
  for (const x of r) {
    if (!x.m) illisibles.push(x.nom);
    else if (estArrondi(x.m)) arrondies.push(`${x.nom} (bord ${x.m.angles[0].bord}, diag ${x.m.angles[0].diag})`);
  }
  process.stdout.write(`\r  ${Math.min(i + 60, fichiers.length)}/${fichiers.length}`);
}
await b.close();
console.log('\n');

verifier('aucune image ne porte de coins arrondis gravés',
  arrondies.length === 0, arrondies.slice(0, 8).join(', '));
verifier('toutes les images se décodent', illisibles.length === 0, illisibles.slice(0, 5).join(', '));

const lourdes = fichiers
  .map(f => ({ f, ko: statSync(`${DOSSIER}/${f}`).size / 1024 }))
  .filter(x => x.ko > PLAFOND_KO)
  .sort((a, b) => b.ko - a.ko);
verifier(`aucune image ne dépasse ${PLAFOND_KO} ko`, lourdes.length === 0,
  lourdes.slice(0, 5).map(x => `${x.f} (${Math.round(x.ko)} ko)`).join(', '));

console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLes images sont propres, et assez légères pour un téléphone.');
process.exit(echecs ? 1 : 0);
