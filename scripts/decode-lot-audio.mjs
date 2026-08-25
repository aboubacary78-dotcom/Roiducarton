/*
 * LES FICHIERS SE DÉCODENT-ILS, ET CONTIENNENT-ILS DU SON ?
 *
 * Le contrôle de format lit des en-têtes ; il ne dit pas si le fichier
 * s'ouvre, ni s'il y a quelque chose dedans. Le projet s'est déjà fait piéger
 * là-dessus : un lot livré en AAC se chargeait parfaitement et ne se décodait
 * pas sur les navigateurs sans codecs propriétaires. « Se charger » n'est pas
 * « se décoder ».
 *
 * On décode donc chaque fichier dans le vrai moteur audio d'un navigateur,
 * exactement celui qui les jouera, et on mesure sur les échantillons :
 *
 *   · la CRÊTE, pour attraper un fichier silencieux — le risque réel quand un
 *     son est un composite bricolé plutôt qu'une génération ;
 *   · le NIVEAU MOYEN, pour repérer un son qui existe mais qu'on n'entendra
 *     jamais par-dessus le reste ;
 *   · le SILENCE DE TÊTE, parce qu'un bruitage d'action qui commence 80 ms
 *     après l'appui se ressent comme une latence de l'interface ;
 *   · la DURÉE réelle, mesurée et non déclarée.
 *
 *     node scripts/decode-lot-audio.mjs <dossier-mp3>
 */
import puppeteer from 'puppeteer-core';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dossier = process.argv[2];
if (!dossier) throw new Error('usage : node scripts/decode-lot-audio.mjs <dossier-mp3>');

const noms = readdirSync(dossier).filter(f => f.endsWith('.mp3')).sort();
console.log(`${noms.length} fichiers à décoder\n`);

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.goto('about:blank');

const resultats = [];
for (const nom of noms) {
  const b64 = readFileSync(join(dossier, nom)).toString('base64');
  const r = await p.evaluate(async (data) => {
    const bin = atob(data);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const ac = new AudioContext();
    try {
      const a = await ac.decodeAudioData(buf.buffer);
      const ech = a.getChannelData(0);
      let crete = 0, somme = 0;
      for (let i = 0; i < ech.length; i++) {
        const v = Math.abs(ech[i]);
        if (v > crete) crete = v;
        somme += ech[i] * ech[i];
      }
      // Le silence de tête : premier échantillon au-dessus du millième.
      let tete = 0;
      while (tete < ech.length && Math.abs(ech[tete]) < 0.001) tete++;
      await ac.close();
      return {
        ok: true,
        duree: a.duration,
        canaux: a.numberOfChannels,
        hz: a.sampleRate,
        crete,
        rms: Math.sqrt(somme / ech.length),
        teteMs: (tete / a.sampleRate) * 1000,
      };
    } catch (e) {
      await ac.close();
      return { ok: false, erreur: String(e).slice(0, 90) };
    }
  }, b64);
  resultats.push({ nom, ...r });
}
await b.close();

const dB = v => (v > 0 ? 20 * Math.log10(v) : -Infinity);
let echecs = 0;

const casses = resultats.filter(r => !r.ok);
const muets = resultats.filter(r => r.ok && r.crete < 0.01);
const faibles = resultats.filter(r => r.ok && r.crete >= 0.01 && dB(r.rms) < -45);
const tardifs = resultats.filter(r => r.ok && r.teteMs > 10);
const cretes = resultats.filter(r => r.ok && dB(r.crete) > -0.5);

const dire = (nom, liste, bloquant = true) => {
  const ok = liste.length === 0;
  console.log(`${ok ? '  ok  ' : bloquant ? ' RATÉ ' : ' note '} ${nom}${ok ? '' : ` — ${liste.length}`}`);
  if (!ok) {
    liste.slice(0, 6).forEach(r => console.log(`        ${r.nom}${r.erreur ? ` : ${r.erreur}` : ''}`));
    if (bloquant) echecs++;
  }
};

dire('les 81 se décodent dans un vrai navigateur', casses);
dire('aucun fichier silencieux', muets);
dire('aucun fichier inaudiblement faible', faibles, false);
dire('silence de tête sous 10 ms', tardifs, false);
dire('aucune crête au ras de la saturation', cretes, false);

const bons = resultats.filter(r => r.ok);
const moy = t => t.reduce((a, b) => a + b, 0) / t.length;
console.log(`\n  durée totale du lot : ${bons.reduce((a, r) => a + r.duree, 0).toFixed(1)} s`);
console.log(`  crête moyenne       : ${dB(moy(bons.map(r => r.crete))).toFixed(1)} dBFS`);
console.log(`  niveau moyen        : ${dB(moy(bons.map(r => r.rms))).toFixed(1)} dBFS`);
console.log(`  silence de tête max : ${Math.max(...bons.map(r => r.teteMs)).toFixed(1)} ms`);

console.log(echecs
  ? `\n${echecs} contrôle(s) en échec.`
  : '\nTous les fichiers s\'ouvrent et contiennent du son.');
process.exit(echecs ? 1 : 0);
