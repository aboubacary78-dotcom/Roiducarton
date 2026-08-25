/*
 * À QUOI RESSEMBLE LE SON DE CE JEU, EN CHIFFRES ?
 *
 * Écrit pour trancher une question précise : un seuil que j'avais posé au
 * jugé refusait des fichiers livrés, et je n'avais aucun moyen de savoir si
 * le seuil avait raison ou si c'était moi. La seule référence honnête est le
 * son que le jeu embarque déjà et que personne n'a renvoyé.
 *
 * On mesure donc les 528 fichiers de `client/public/audio/` sur deux axes, et
 * on en sort des centiles. Un seuil placé sous le 10ᵉ centile du corpus admis
 * refuserait des sons que le jeu joue tous les jours : c'est le signe qu'il
 * est faux.
 *
 *     node scripts/profil-corpus-audio.mjs [dossier]
 */
import puppeteer from 'puppeteer-core';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dossier = process.argv[2] ?? 'client/public/audio';
const noms = readdirSync(dossier).filter(f => f.endsWith('.mp3')).sort();
console.log(`${noms.length} fichiers\n`);

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.goto('about:blank');

const lignes = [];
for (const nom of noms) {
  const b64 = readFileSync(join(dossier, nom)).toString('base64');
  try {
    lignes.push(await p.evaluate(async (b64, nom) => {
      const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const ctx = new OfflineAudioContext(1, 48000, 48000);
      const buf = await ctx.decodeAudioData(bin.buffer);
      const x = buf.getChannelData(0);
      const sr = buf.sampleRate;

      let crete = 0, somme = 0;
      for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > crete) crete = a; somme += x[i] * x[i]; }
      const rms = Math.sqrt(somme / x.length);

      // Part d'énergie au-dessus de 500 Hz, par filtrage temporel : plus
      // simple qu'une transformée et suffisant pour un rapport de puissances.
      // Passe-haut du premier ordre, fc = 500 Hz.
      const dt = 1 / sr, rc = 1 / (2 * Math.PI * 500), alpha = rc / (rc + dt);
      let yPrev = 0, xPrev = 0, eHaut = 0, eTout = 0;
      for (let i = 0; i < x.length; i++) {
        const y = alpha * (yPrev + x[i] - xPrev);
        yPrev = y; xPrev = x[i];
        eHaut += y * y; eTout += x[i] * x[i];
      }
      return {
        nom,
        duree: buf.duration,
        crest: 20 * Math.log10(crete / (rms || 1e-9)),
        partAigue: eHaut / (eTout || 1),
      };
    }, b64, nom));
  } catch { lignes.push({ nom, duree: 0, crest: NaN, partAigue: NaN, casse: true }); }
}
await b.close();

const bons = lignes.filter(l => !l.casse && Number.isFinite(l.crest));
const centile = (tab, q) => {
  const t = [...tab].sort((a, b) => a - b);
  return t[Math.min(t.length - 1, Math.floor(q * t.length))];
};
const aigus = bons.map(l => l.partAigue);
const crests = bons.map(l => l.crest);

console.log(`${bons.length} fichiers mesurés, ${lignes.length - bons.length} illisibles\n`);
console.log('  part d\'énergie au-dessus de 500 Hz');
for (const q of [0.05, 0.1, 0.25, 0.5, 0.75, 0.95])
  console.log(`    ${String(Math.round(q * 100)).padStart(3)}ᵉ centile : ${(centile(aigus, q) * 100).toFixed(1)} %`);
console.log('\n  facteur de crête (dB au-dessus du niveau moyen)');
for (const q of [0.05, 0.1, 0.25, 0.5, 0.75, 0.95])
  console.log(`    ${String(Math.round(q * 100)).padStart(3)}ᵉ centile : ${centile(crests, q).toFixed(1)} dB`);

// Les sons courts d'alerte, seule famille vraiment comparable aux signaux du
// corps : moins d'une seconde et joués seuls, par-dessus le reste.
const courts = bons.filter(l => l.duree <= 1.2);
console.log(`\n  parmi les ${courts.length} fichiers de moins de 1,2 s`);
console.log(`    part aiguë, 10ᵉ centile : ${(centile(courts.map(l => l.partAigue), 0.1) * 100).toFixed(1)} %`);
console.log(`    crête, 10ᵉ centile      : ${centile(courts.map(l => l.crest), 0.1).toFixed(1)} dB`);
