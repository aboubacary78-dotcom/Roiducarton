/*
 * REFERMER LA BOUCLE DES MUSIQUES.
 *
 * Les sept morceaux arrivent au bon format — 60 s, stéréo, 44,1 kHz, 96 kbit/s,
 * −20 LUFS — mais chacun commence par ~240 ms de silence et finit par un fondu
 * vers le silence de 300 à 630 ms. Mis en boucle, ça fait **un trou de 0,55 à
 * 0,92 seconde à chaque tour** : la musique s'arrête, se tait, puis repart.
 *
 * Le contrôle du fournisseur ne pouvait pas le voir : il comparait le niveau
 * RMS de 200 ms en tête et de 200 ms en queue, c'est-à-dire deux fenêtres de
 * silence. Elles se valent forcément, et l'écart mesuré vaut 0,00 dB.
 *
 * On coupe donc le silence — mais pas tout.
 *
 * LE DÉTAIL QUI COMPTE : le moteur du jeu rentre déjà ses points de boucle de
 * 60 ms de chaque côté (`LOOP_TRIM` dans audioFiles.ts), pour sauter le blanc
 * que les codecs ajoutent au décodage. Si on rasait le silence à zéro, cette
 * marge mordrait sur la musique. On laisse donc exactement 60 ms de silence de
 * chaque côté : les bornes de boucle du jeu tombent alors pile là où la
 * musique commence et finit.
 *
 * Usage : node scripts/postprod-musiques.mjs <source> <destination>
 */
import { readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';

const [SRC, DST] = process.argv.slice(2);
if (!SRC || !DST || !existsSync(SRC)) {
  console.error('Usage : node scripts/postprod-musiques.mjs <source> <destination>');
  process.exit(2);
}
mkdirSync(DST, { recursive: true });

/** Ce que le moteur rentre de chaque côté au moment de boucler. */
const MARGE_BOUCLE = 0.060;
/** Sous ce niveau, l'échantillon est du silence (0,5 % de pleine échelle). */
const PLANCHER = 164;
const HZ = 44100;
/** Sonie visée, celle du cahier des charges. */
const CIBLE_LUFS = -20;

const pcm = (f) => {
  const brut = execFileSync('ffmpeg',
    ['-v', 'error', '-i', f, '-ac', '1', '-ar', String(HZ), '-f', 's16le', '-'],
    { maxBuffer: 1 << 28 });
  return new Int16Array(brut.buffer, brut.byteOffset, brut.length >> 1);
};

const sonie = (f) => {
  const r = spawnSync('ffmpeg', ['-i', f, '-af', 'ebur128', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 1 << 26 });
  const t = `${r.stdout || ''}${r.stderr || ''}`;
  const tous = [...t.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].map(m => Number(m[1]));
  return tous.length ? tous[tous.length - 1] : NaN;
};

const fichiers = readdirSync(SRC).filter(f => f.endsWith('.mp3')).sort();
console.log(`${fichiers.length} musiques à refermer.\n`);
console.log('  fichier            trou avant   trou après   gain');

for (const nom of fichiers) {
  const src = join(SRC, nom);
  const dst = join(DST, nom);

  // --- 1. où commence et où finit vraiment la musique ---
  const a = pcm(src);
  let i = 0; while (i < a.length && Math.abs(a[i]) < PLANCHER) i++;
  let j = a.length - 1; while (j > 0 && Math.abs(a[j]) < PLANCHER) j--;
  const teteAvant = i / HZ, queueAvant = (a.length - 1 - j) / HZ;

  // On garde la marge que le moteur va rentrer, et pas un millième de plus.
  const debut = Math.max(0, teteAvant - MARGE_BOUCLE);
  const fin = (j / HZ) + MARGE_BOUCLE;

  // --- 2. la coupe change la sonie : on la remet à la cible ---
  const gain = CIBLE_LUFS - sonie(src);

  const filtres = [
    `atrim=start=${debut.toFixed(5)}:end=${fin.toFixed(5)}`,
    'asetpts=PTS-STARTPTS',
    `volume=${gain.toFixed(2)}dB`,
  ];
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', src,
    '-af', filtres.join(','), '-ac', '2', '-ar', String(HZ), '-b:a', '96k', dst],
    { encoding: 'utf8' });
  if (r.status !== 0) { console.error(`  ÉCHEC ${nom} : ${r.stderr}`); process.exit(1); }

  const b = pcm(dst);
  let i2 = 0; while (i2 < b.length && Math.abs(b[i2]) < PLANCHER) i2++;
  let j2 = b.length - 1; while (j2 > 0 && Math.abs(b[j2]) < PLANCHER) j2--;
  const trouApres = (i2 + (b.length - 1 - j2)) / HZ * 1000;

  console.log(`  ${nom.replace('.mp3', '').padEnd(17)} ${((teteAvant + queueAvant) * 1000).toFixed(0).padStart(6)} ms ${trouApres.toFixed(0).padStart(9)} ms   ${gain >= 0 ? '+' : ''}${gain.toFixed(1)} dB`);
}

console.log(`\nLe moteur rentre ${MARGE_BOUCLE * 1000} ms de chaque côté : les bornes tombent`);
console.log('désormais exactement sur le début et la fin de la musique.');
