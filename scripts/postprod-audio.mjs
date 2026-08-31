/*
 * LA FINITION QUE LA LIVRAISON N'A PAS FAITE.
 *
 * Les 65 fichiers arrivent au bon format (mono, 48 kHz, 40 kbit/s) mais
 * trois défauts mesurés les rendent inutilisables tels quels :
 *
 *   1. DU SILENCE EN TÊTE. 37 fichiers sur 65 commencent par 20 à 84 ms de
 *      vide. Sur un bouton, ce vide est une latence : le doigt touche, et le
 *      son arrive après. Le cahier des charges demandait moins de 10 ms.
 *
 *   2. DES NIVEAUX QUI VONT DU SIMPLE AU DOUZIÈME. 22 dB séparent le plus
 *      fort du plus faible. Or le code applique déjà un volume par son
 *      (`withFile(nom, volume, …)`) : si les fichiers ne partent pas du même
 *      niveau, ces volumes ne veulent plus rien dire et le mixage devient
 *      imprévisible. On égalise donc les fichiers, et c'est le code qui dose.
 *
 *   3. TROIS FICHIERS ÉCRÊTÉS, dont un à 0 dB pile.
 *
 * On ne touche pas au son lui-même : pas d'égalisation, pas de compression,
 * pas de réverbération. On coupe du vide, on met tout au même niveau, on
 * laisse de la marge sous le maximum.
 *
 * La montée progressive d'un son n'est PAS du silence : `moment-craquement`
 * met 586 ms à atteindre son plein régime parce que c'est une pile de cartons
 * qui s'effondre. On ne coupe que ce qui est réellement muet.
 *
 * Usage : node scripts/postprod-audio.mjs <source> <destination>
 */
import { readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';

const [SRC, DST] = process.argv.slice(2);
if (!SRC || !DST || !existsSync(SRC)) {
  console.error('Usage : node scripts/postprod-audio.mjs <source> <destination>');
  process.exit(2);
}
mkdirSync(DST, { recursive: true });

/** Niveau visé, en dB sur la partie sonnante. Les volumes du code partent de là. */
const CIBLE_MOYENNE = -14;
/** Marge sous le maximum numérique, pour que rien n'écrête après encodage. */
const CRETE_MAX = -1.5;
/** Ce qu'on laisse de silence en tête : assez pour ne pas rogner l'attaque. */
const TETE_MS = 5;
/** Sous ce niveau, l'échantillon est considéré muet (0,5 % de pleine échelle). */
const PLANCHER = 164;

const echantillons = (f) => {
  const brut = execFileSync('ffmpeg',
    ['-v', 'error', '-i', f, '-ac', '1', '-ar', '48000', '-f', 's16le', '-'],
    { maxBuffer: 1 << 26 });
  return new Int16Array(brut.buffer, brut.byteOffset, brut.length >> 1);
};

const mesure = (f) => {
  const r = spawnSync('ffmpeg', ['-i', f, '-af', 'volumedetect', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 1 << 26 });
  const txt = `${r.stdout || ''}${r.stderr || ''}`;
  return {
    crete: Number((txt.match(/max_volume: (-?[\d.]+)/) || [])[1]),
    moyen: Number((txt.match(/mean_volume: (-?[\d.]+)/) || [])[1]),
  };
};

const fichiers = readdirSync(SRC).filter(f => f.endsWith('.mp3')).sort();
console.log(`${fichiers.length} fichiers à finir.\n`);

let coupeTotale = 0, poidsAvant = 0, poidsApres = 0;
const journal = [];

for (const nom of fichiers) {
  const src = join(SRC, nom);
  const dst = join(DST, nom);
  poidsAvant += statSync(src).size;

  // --- 1. où commence vraiment le son ---
  const ech = echantillons(src);
  let mort = 0;
  while (mort < ech.length && Math.abs(ech[mort]) < PLANCHER) mort++;
  const coupe = Math.max(0, mort / 48000 - TETE_MS / 1000);

  /*
   * --- 2. de combien il faut le remonter ---
   *
   * On mesure le niveau sur la partie SONNANTE du fichier, pas sur toute sa
   * durée. La moyenne globale est tirée vers le bas par les silences internes :
   * un son épars comme le classeur qui s'ouvre, un claquement, puis rien,
   * paraît faible à la mesure alors qu'il claque à l'oreille. Normalisé sur sa
   * moyenne globale, il ressortait 11 dB sous les autres.
   */
  const { crete } = mesure(src);
  const actifs = [];
  for (const v of ech) if (Math.abs(v) >= PLANCHER) actifs.push(v);
  const rms = actifs.length
    ? Math.sqrt(actifs.reduce((s, v) => s + v * v, 0) / actifs.length)
    : 1;
  const niveau = 20 * Math.log10(rms / 32768);
  // On vise ce niveau, sans jamais laisser la crête dépasser la marge.
  const gain = Math.min(CIBLE_MOYENNE - niveau, CRETE_MAX - crete);

  /*
   * --- 3. on écrit ---
   *
   * La coupe passe par le filtre `atrim`, pas par l'option `-ss` placée avant
   * l'entrée : sur un MP3, ce `-ss` cherche la trame la plus proche et ne sait
   * donc couper que par pas de 24 ms. Deux fichiers gardaient ainsi la moitié
   * de leur silence. `atrim` travaille sur le signal décodé, à l'échantillon.
   */
  const filtres = [];
  if (coupe > 0.0005) filtres.push(`atrim=start=${coupe.toFixed(5)}`, 'asetpts=PTS-STARTPTS');
  filtres.push(`volume=${gain.toFixed(2)}dB`);
  const args = ['-v', 'error', '-y', '-i', src,
    '-af', filtres.join(','), '-ac', '1', '-ar', '48000', '-b:a', '40k', dst];
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (r.status !== 0) { console.error(`  ÉCHEC ${nom} : ${r.stderr}`); process.exit(1); }

  poidsApres += statSync(dst).size;
  coupeTotale += coupe;
  journal.push({ nom, coupe: coupe * 1000, gain, creteAvant: crete, niveauAvant: niveau });
}

journal.sort((a, b) => b.coupe - a.coupe);
console.log('Les plus gros silences retirés :');
for (const j of journal.slice(0, 6))
  console.log(`  ${j.nom.padEnd(28)} −${j.coupe.toFixed(0).padStart(3)} ms   gain ${j.gain >= 0 ? '+' : ''}${j.gain.toFixed(1)} dB`);

journal.sort((a, b) => Math.abs(b.gain) - Math.abs(a.gain));
console.log('\nLes plus gros rattrapages de niveau :');
for (const j of journal.slice(0, 6))
  console.log(`  ${j.nom.padEnd(28)} ${j.gain >= 0 ? '+' : ''}${j.gain.toFixed(1)} dB   (crête ${j.creteAvant} dB avant)`);

console.log(`\n${Math.round(coupeTotale * 1000)} ms de silence retirés au total.`);
console.log(`${(poidsAvant / 1024).toFixed(0)} ko → ${(poidsApres / 1024).toFixed(0)} ko.`);
