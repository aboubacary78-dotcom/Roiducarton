/*
 * RAMÈNE LES ILLUSTRATIONS À LA TAILLE OÙ ELLES SONT VUES.
 *
 * Le jeu s'affiche sur une largeur de 390 points. Même à trois pixels par
 * point — le maximum des téléphones actuels — il n'en montre jamais plus de
 * 1170. Les sources montaient jusqu'à 2304 px de large : on expédiait quatre
 * fois trop de pixels sur chaque scène, au joueur comme dans l'APK.
 *
 * Deux règles tiennent ce script :
 *
 * 1. ON NE GRANDIT JAMAIS. Un fichier déjà plus petit que LARGEUR_MAX est
 *    laissé tel quel. Le redimensionner vers le haut inventerait des pixels
 *    et alourdirait le fichier pour rien.
 *
 * 2. ON NE GARDE QUE CE QUI ALLÈGE. Ces images sont déjà du WebP compressé :
 *    ré-encoder ajoute une perte de génération, et sur les fichiers déjà
 *    optimaux le résultat peut être PLUS LOURD que l'original. Dans ce cas on
 *    rejette le résultat et on garde la source.
 *
 * Le profil ICC est conservé (-metadata icc) : sans lui, des dioramas au
 *  papier kraft virent au jaune sur les écrans larges gamut.
 *
 * Lancement :  node scripts/optimize-images.mjs
 * Réglages  :  MAX_W=1080 QUALITY=80 node scripts/optimize-images.mjs
 */
import { readdirSync, statSync, renameSync, unlinkSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER = resolve(root, 'client/public/assets');

const LARGEUR_MAX = Number(process.env.MAX_W || 1080);
const QUALITE = Number(process.env.QUALITY || 80);
const PARALLELE = Number(process.env.JOBS || 4);

/** Largeur en pixels, lue dans l'en-tête WebP. */
async function largeur(fichier) {
  try {
    const { stdout } = await run('webpinfo', [fichier]);
    const m = stdout.match(/Canvas size\s+(\d+)\s*x/) || stdout.match(/Width:\s*(\d+)/);
    return m ? Number(m[1]) : 0;
  } catch { return 0; }
}

const fichiers = readdirSync(DOSSIER).filter(f => f.endsWith('.webp'));
console.log(`${fichiers.length} images à examiner (cible : ${LARGEUR_MAX} px, qualité ${QUALITE}).`);

let traitees = 0, ignorees = 0, rejetees = 0, avant = 0, apres = 0;

async function traiter(nom) {
  const src = join(DOSSIER, nom);
  const tailleAvant = statSync(src).size;
  avant += tailleAvant;

  const w = await largeur(src);
  if (w === 0) { console.warn(`  ? largeur illisible, laissé tel quel : ${nom}`); apres += tailleAvant; ignorees++; return; }
  if (w <= LARGEUR_MAX) { apres += tailleAvant; ignorees++; return; }

  const tmp = `${src}.tmp`;
  try {
    await run('cwebp', ['-quiet', '-q', String(QUALITE), '-resize', String(LARGEUR_MAX), '0', '-metadata', 'icc', src, '-o', tmp]);
  } catch (e) {
    console.warn(`  ! ré-encodage échoué, laissé tel quel : ${nom}`);
    apres += tailleAvant; ignorees++; return;
  }

  const tailleApres = statSync(tmp).size;
  if (tailleApres >= tailleAvant) {
    // Ré-encoder aurait coûté de la qualité sans rien gagner en poids.
    unlinkSync(tmp);
    apres += tailleAvant; rejetees++; return;
  }
  renameSync(tmp, src);
  apres += tailleApres; traitees++;
}

// Petite file d'attente : cwebp est mono-thread, on en fait tourner plusieurs.
let curseur = 0;
await Promise.all(Array.from({ length: PARALLELE }, async () => {
  while (curseur < fichiers.length) await traiter(fichiers[curseur++]);
}));

const mo = o => (o / 1048576).toFixed(1);
console.log(`\n${traitees} réduites, ${ignorees} déjà à la bonne taille, ${rejetees} rejetées (le résultat pesait plus lourd).`);
console.log(`${mo(avant)} Mo → ${mo(apres)} Mo (−${(100 - (apres / avant) * 100).toFixed(0)} %).`);
