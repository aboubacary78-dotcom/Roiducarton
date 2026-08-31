/*
 * LES SEPT MUSIQUES SE DÉCODENT-ELLES, ET BOUCLENT-ELLES SANS TROU ?
 *
 * Le disque dit oui ; ce qui compte est ce que le moteur audio accepte. On
 * demande donc au navigateur de décoder chaque fichier, puis on vérifie que
 * les bornes de boucle que le jeu va poser tombent bien sur de la musique et
 * non dans le silence.
 */
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });

const res = await p.evaluate(async () => {
  const ac = new AudioContext();
  const noms = ['musique-mort', 'mg-bagarre', 'mg-esquive', 'mg-casse', 'mg-manche', 'mg-recup', 'mg-marchandage'];
  const TRIM = 0.06;               // la marge que startLoop rentre de chaque côté
  const sortie = [];
  for (const n of noms) {
    try {
      const r = await fetch('/audio/' + n + '.mp3');
      if (!r.ok) { sortie.push({ n, err: 'HTTP ' + r.status }); continue; }
      const buf = await ac.decodeAudioData(await r.arrayBuffer());
      const d = buf.getChannelData(0);
      const hz = buf.sampleRate;
      // Niveau juste APRÈS la borne d'entrée et juste AVANT la borne de sortie.
      const rms = (deb, dur) => {
        let s = 0, n0 = Math.floor(deb * hz), n1 = Math.min(d.length, n0 + Math.floor(dur * hz));
        for (let i = n0; i < n1; i++) s += d[i] * d[i];
        return Math.sqrt(s / Math.max(1, n1 - n0));
      };
      /*
       * La moyenne ne suffit pas : une note qui s'éteint, une boîte à musique,
       * un harmonica qui respire, a une moyenne basse mais des crêtes bien
       * présentes. Le silence, lui, n'a ni l'une ni les autres. On mesure donc
       * la CRÊTE, qui seule distingue « ça décroît » de « il n'y a rien ».
       */
      const crete = (deb, dur) => {
        let m = 0, n0 = Math.floor(deb * hz), n1 = Math.min(d.length, n0 + Math.floor(dur * hz));
        for (let i = n0; i < n1; i++) { const a = Math.abs(d[i]); if (a > m) m = a; }
        return m;
      };
      const entree = crete(TRIM, 0.15);
      const sortieB = crete(buf.duration - TRIM - 0.15, 0.15);
      sortie.push({
        n, duree: +buf.duration.toFixed(2), canaux: buf.numberOfChannels,
        dbEntree: +(20 * Math.log10(entree || 1e-9)).toFixed(1),
        dbSortie: +(20 * Math.log10(sortieB || 1e-9)).toFixed(1),
      });
    } catch (e) { sortie.push({ n, err: String(e).slice(0, 60) }); }
  }
  return sortie;
});

let echecs = 0;
console.log('  musique          durée  can   crête à l\'entrée  crête à la sortie');
for (const r of res) {
  if (r.err) { console.log(`  ${r.n.padEnd(16)} ${r.err}`); echecs++; continue; }
  // Une borne qui tombe dans le silence = le trou est encore là.
  // Sous -60 dB de crête, il n'y a littéralement rien : c'est du silence.
  const muet = r.dbEntree < -60 || r.dbSortie < -60;
  if (muet || r.canaux !== 2) echecs++;
  console.log(`  ${r.n.padEnd(16)} ${String(r.duree).padStart(5)}s ${r.canaux}    ${String(r.dbEntree).padStart(7)} dB     ${String(r.dbSortie).padStart(7)} dB${muet ? '   ← SILENCE À LA BORNE' : ''}`);
}
console.log(echecs ? `\n${echecs} problème(s).` : '\nLes 7 décodent, et les bornes de boucle tombent sur de la musique.');
await b.close();
process.exit(echecs ? 1 : 0);
