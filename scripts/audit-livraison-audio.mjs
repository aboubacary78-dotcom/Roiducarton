/*
 * LA LIVRAISON AUDIO TIENT-ELLE SES PROMESSES ?
 *
 * La note de livraison affirme mono, 48 kHz, 40 kbit/s, silence de tête sous
 * 10 ms, durées conformes et « aucun fichier bit-à-bit identique ». On ne la
 * croit pas sur parole : on mesure.
 *
 * Deux contrôles vont plus loin que ceux du fournisseur :
 *
 *   - LE SILENCE UTILE. Un fichier peut être au bon format et ne rien
 *     contenir. On mesure la crête : sous -40 dB, il n'y a rien à entendre.
 *
 *   - LES VARIANTES SONT-ELLES DIFFÉRENTES ? « Pas bit-à-bit identiques » ne
 *     veut rien dire : deux encodages du même son passent le test et
 *     s'entendent pareil. On compare donc les empreintes spectrales. Des
 *     variantes jumelles ne servent à rien : c'est précisément le métronome
 *     qu'elles étaient censées casser.
 *
 * Usage : node scripts/audit-livraison-audio.mjs <dossier>
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';

const DOSSIER = process.argv[2];
if (!DOSSIER || !existsSync(DOSSIER)) {
  console.error('Usage : node scripts/audit-livraison-audio.mjs <dossier>');
  process.exit(2);
}

/*
 * ffmpeg écrit ses mesures sur la sortie d'ERREUR, y compris quand tout va
 * bien. Ne lire que stdout renvoie une chaîne vide, les valeurs mesurées
 * deviennent NaN, et toutes les comparaisons passent sans rien vérifier :
 * l'audit dirait « aucune anomalie » sans avoir rien regardé. On lit donc les
 * deux flux.
 */
const ff = (args) => {
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8', maxBuffer: 1 << 26 });
  return `${r.stdout || ''}${r.stderr || ''}`;
};
const probe = (f, entries) =>
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', entries, '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim();

// ---- Les durées attendues, lues dans le cahier des charges ------------------
const attendu = new Map();
const spec = readFileSync('docs/audio/refonte-audio.md', 'utf8');
for (const m of spec.matchAll(/^\| `([a-z0-9-]+)\.mp3`[^|]*\| ([\d,]+) s \|/gm)) {
  attendu.set(m[1], Number(m[2].replace(',', '.')));
}

/**
 * Les échantillons du fichier, en mono.
 *
 * Le taux compte : ramener à 8 kHz applique un filtre passe-bas qui efface les
 * transitoires aigus. Un clic dont l'attaque est un claquement à 6 kHz
 * paraîtrait alors commencer 60 ms plus tard qu'en réalité. On date donc les
 * attaques à 48 kHz ; l'empreinte, qui ne regarde que des enveloppes
 * d'énergie, se contente de 8 kHz.
 */
const echantillons = (f, hz = 48000) => {
  const brut = execFileSync('ffmpeg',
    ['-v', 'error', '-i', f, '-ac', '1', '-ar', String(hz), '-f', 's16le', '-'],
    { maxBuffer: 1 << 26 });
  return new Int16Array(brut.buffer, brut.byteOffset, brut.length >> 1);
};

/*
 * Deux choses différentes se cachent derrière « le son démarre tard » :
 *
 *   - LE SILENCE MORT, du vide numérique en tête. C'est un défaut : sur un
 *     bouton, c'est de la latence pure.
 *   - LA MONTÉE, un son qui s'installe progressivement. Ce n'est pas un
 *     défaut : `moment-craquement` met une demi-seconde à atteindre son plein
 *     régime parce que c'est une pile de cartons qui s'effondre.
 *
 * Les confondre condamnerait des fichiers sains. On mesure les deux.
 */
function tempsDAttaque(f) {
  const HZ = 48000;
  const ech = echantillons(f, HZ);
  let crete = 0;
  for (const v of ech) { const a = Math.abs(v); if (a > crete) crete = a; }
  if (crete === 0) return { mort: Infinity, montee: 0 };
  const PLANCHER = 164; // 0,5 % de la pleine échelle
  let i = 0;
  while (i < ech.length && Math.abs(ech[i]) < PLANCHER) i++;
  const mort = i / HZ;
  const seuil = crete / 10;
  while (i < ech.length && Math.abs(ech[i]) < seuil) i++;
  return { mort, montee: i / HZ - mort };
}

const fichiers = readdirSync(DOSSIER).filter(f => f.endsWith('.mp3')).sort();
console.log(`${fichiers.length} fichiers, ${attendu.size} durées attendues au cahier des charges.\n`);

const anomalies = [];
const mesures = [];

for (const nom of fichiers) {
  const f = join(DOSSIER, nom);
  const base = nom.replace(/-[123]\.mp3$/, '').replace(/\.mp3$/, '');

  const canaux = probe(f, 'stream=channels');
  const hz = probe(f, 'stream=sample_rate');
  const duree = Number(probe(f, 'format=duration'));
  const debit = Math.round(Number(probe(f, 'format=bit_rate')) / 1000);

  const vol = ff(['-i', f, '-af', 'volumedetect', '-f', 'null', '-']);
  const crete = Number((vol.match(/max_volume: (-?[\d.]+)/) || [])[1]);
  const moyen = Number((vol.match(/mean_volume: (-?[\d.]+)/) || [])[1]);

  /*
   * L'ATTAQUE. Ce qui compte n'est pas le silence numérique mais l'instant où
   * le son devient audible : le premier échantillon atteignant le dixième de
   * la crête du fichier. Un seuil absolu daterait l'attaque sur le souffle de
   * la prise plutôt que sur le geste, et condamnerait des fichiers sains.
   */
  const { mort, montee } = tempsDAttaque(f);

  /*
   * La sonie intégrée n'a de sens qu'au-delà de 400 ms, c'est la fenêtre de
   * la norme EBU. En dessous, ebur128 renvoie son plancher de -70 LUFS, qui
   * ne dit rien du fichier. On ne retient donc que les sons assez longs, et
   * les courts se comparent entre eux au niveau moyen.
   */
  const ebu = ff(['-i', f, '-af', 'ebur128', '-f', 'null', '-']);
  const toutesI = [...ebu.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].map(m => Number(m[1]));
  const brute = toutesI.length ? toutesI[toutesI.length - 1] : NaN;
  const lufs = duree >= 0.4 && brute > -70 ? brute : NaN;

  mesures.push({ nom, base, duree, crete, moyen, lufs, mort, montee });

  if (canaux !== '1') anomalies.push(`${nom} : ${canaux} canaux au lieu de mono`);
  if (hz !== '48000') anomalies.push(`${nom} : ${hz} Hz au lieu de 48000`);
  // En dessous de 0,3 s, l'en-tête des trames MP3 pèse plus que le signal et
  // le débit mesuré grimpe sans que le fichier soit plus gros : on ne compte
  // que les fichiers assez longs pour que la mesure ait un sens.
  if (duree > 0.3 && (debit < 30 || debit > 50)) anomalies.push(`${nom} : ${debit} kbit/s hors de la plage visée`);
  if (crete < -40) anomalies.push(`${nom} : crête à ${crete} dB, le fichier est vide ou inaudible`);
  if (crete > -0.5) anomalies.push(`${nom} : crête à ${crete} dB, écrêtage probable`);
  if (mort > 0.020) anomalies.push(`${nom} : ${Math.round(mort * 1000)} ms de silence mort en tête, le son arrive après le geste`);

  const cible = attendu.get(base);
  if (cible === undefined) anomalies.push(`${nom} : absent du cahier des charges`);
  else if (duree > cible + 0.25) anomalies.push(`${nom} : ${duree.toFixed(2)} s pour ${cible} s attendues`);
}

// ---- Les fichiers manquants ------------------------------------------------
const livres = new Set(fichiers.map(n => n.replace(/-[123]\.mp3$/, '').replace(/\.mp3$/, '')));
for (const nom of attendu.keys()) if (!livres.has(nom)) anomalies.push(`MANQUANT : ${nom}.mp3`);

// ---- Les variantes sont-elles vraiment différentes ? -----------------------
/*
 * Empreinte grossière : l'énergie du signal dans huit tranches de temps. Deux
 * prises différentes du même geste ont un profil proche mais jamais égal ; un
 * même fichier réencodé deux fois donne un profil identique au millième.
 */
const empreinte = (f) => {
  const ech = echantillons(f, 8000);
  const tranches = 8, pas = Math.max(1, Math.floor(ech.length / tranches));
  const out = [];
  for (let t = 0; t < tranches; t++) {
    let somme = 0;
    for (let i = t * pas; i < Math.min((t + 1) * pas, ech.length); i++) somme += ech[i] * ech[i];
    out.push(Math.sqrt(somme / pas));
  }
  const max = Math.max(...out, 1);
  return out.map(v => v / max);
};

const groupes = {};
for (const nom of fichiers) {
  const m = nom.match(/^(.*)-[123]\.mp3$/);
  if (m) (groupes[m[1]] ??= []).push(nom);
}

console.log(`VARIANTES : ${Object.keys(groupes).length} sons en ont, elles doivent différer à l'oreille.`);
for (const [base, liste] of Object.entries(groupes)) {
  const emp = liste.map(n => empreinte(join(DOSSIER, n)));
  let ecartMin = Infinity;
  for (let i = 0; i < emp.length; i++)
    for (let j = i + 1; j < emp.length; j++) {
      const d = Math.sqrt(emp[i].reduce((s, v, k) => s + (v - emp[j][k]) ** 2, 0) / emp[i].length);
      ecartMin = Math.min(ecartMin, d);
    }
  const verdict = ecartMin < 0.02 ? 'JUMELLES, inutiles' : ecartMin < 0.08 ? 'très proches' : 'distinctes';
  console.log(`  ${base.padEnd(22)} ${liste.length} variantes, écart min ${ecartMin.toFixed(3)} · ${verdict}`);
  if (ecartMin < 0.02) anomalies.push(`${base} : les variantes sont indiscernables`);
}

// ---- Sonie -----------------------------------------------------------------
const lufsValides = mesures.map(m => m.lufs).filter(v => Number.isFinite(v));
if (lufsValides.length) {
  const tri = [...lufsValides].sort((a, b) => a - b);
  const med = tri[Math.floor(tri.length / 2)];
  console.log(`\nSONIE : médiane ${med.toFixed(1)} LUFS, de ${tri[0].toFixed(1)} à ${tri[tri.length - 1].toFixed(1)}.`);
  const horsPlage = mesures.filter(m => Number.isFinite(m.lufs) && Math.abs(m.lufs - med) > 6);
  if (horsPlage.length) {
    console.log(`  ${horsPlage.length} fichier(s) à plus de 6 LU de la médiane, ils sauteront à l'oreille :`);
    for (const m of horsPlage.sort((a, b) => a.lufs - b.lufs))
      console.log(`     ${m.nom.padEnd(30)} ${m.lufs.toFixed(1)} LUFS`);
  }
}

const courts = mesures.filter(m => !Number.isFinite(m.lufs));
if (courts.length) {
  const moy = courts.map(m => m.moyen).sort((a, b) => a - b);
  console.log(`  ${courts.length} son(s) trop courts pour la mesure LUFS ; à leur niveau moyen ils vont de ${moy[0].toFixed(1)} à ${moy[moy.length - 1].toFixed(1)} dB.`);
}

const morts = mesures.map(m => m.mort).sort((a, b) => a - b);
console.log(`\nSILENCE MORT EN TÊTE : médiane ${Math.round(morts[morts.length >> 1] * 1000)} ms, maximum ${Math.round(morts[morts.length - 1] * 1000)} ms.`);
const lentes = mesures.filter(m => m.montee > 0.060).sort((a, b) => b.montee - a.montee);
console.log(`MONTÉES LENTES (plus de 60 ms pour s'installer) : ${lentes.length}`);
for (const m of lentes.slice(0, 6)) console.log(`     ${m.nom.padEnd(30)} ${Math.round(m.montee * 1000)} ms`);
console.log(`DURÉES : de ${Math.min(...mesures.map(m => m.duree)).toFixed(2)} s à ${Math.max(...mesures.map(m => m.duree)).toFixed(2)} s.`);
console.log(`POIDS : ${(fichiers.reduce((s, n) => s + readFileSync(join(DOSSIER, n)).length, 0) / 1024).toFixed(0)} ko au total.`);

console.log(`\n${anomalies.length ? `ANOMALIES (${anomalies.length}) :` : 'Aucune anomalie.'}`);
for (const a of anomalies) console.log(`  · ${a}`);
process.exit(anomalies.length ? 1 : 0);
