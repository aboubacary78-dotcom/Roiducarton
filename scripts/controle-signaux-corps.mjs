/*
 * LES CINQ SIGNAUX DU CORPS PASSERONT-ILS UN HAUT-PARLEUR DE TÉLÉPHONE ?
 *
 * Le premier lot a passé tous les contrôles de format et s'est fait renvoyer
 * à la première écoute : « un cri bouillie, on ne comprend rien du tout ».
 * D'où ce contrôle — et d'où, aussi, sa modestie.
 *
 * CE QUE J'AI ESSAYÉ DE MESURER, ET QUI NE MARCHE PAS.
 *
 * J'ai d'abord voulu vérifier que les cinq sons se DISTINGUENT, par une
 * empreinte spectrale en vingt-quatre bandes. Le contrôle est retiré, parce
 * que deux mesures l'ont démoli :
 *
 *   · `jauge-remplie` et `jauge-rouge`, les deux signaux les plus utilisés du
 *     jeu et que personne n'a jamais confondus, mesurent 0,201 d'écart ;
 *   · le lot REFUSÉ mesurait 0,794 — mieux que celui qui l'a remplacé.
 *
 * L'empreinte décrit où l'énergie se trouve, pas ce que l'oreille reconnaît.
 * Le facteur de crête ne sépare pas davantage : les fichiers renvoyés
 * tenaient 12 à 21 dB, dans la même fourchette que les nouveaux. AUCUNE
 * mesure automatique ne départage un bruitage réussi d'un bruitage raté ;
 * seule une écoute le fait, et ce fichier ne prétend pas la remplacer.
 *
 * CE QUI RESTE, ET POURQUOI ON PEUT S'Y FIER.
 *
 * Deux planchers, tous deux relevés sur les 528 sons que le jeu embarque
 * déjà et que personne n'a renvoyés (`scripts/profil-corpus-audio.mjs`) —
 * et non posés au jugé, ce qui était mon erreur précédente :
 *
 *   · ÉNERGIE AU-DESSUS DE 500 Hz. Le jeu se joue sur un téléphone, souvent
 *     sans casque, et un baffle de smartphone ne restitue presque rien dans
 *     le grave. Un grondement de ventre superbe au casque devient un silence
 *     dans la poche. 10ᵉ centile du corpus : 24,6 %.
 *   · FACTEUR DE CRÊTE. Un objet manipulé a des attaques, une nappe non.
 *     5ᵉ centile du corpus : 9,9 dB.
 *
 * Passer ces deux planchers ne veut pas dire que le son est bon. Les rater
 * veut dire qu'il sera inaudible ou informe, ce qui est déjà utile à savoir
 * avant de réveiller quelqu'un pour une écoute.
 *
 *     node scripts/controle-signaux-corps.mjs <dossier-mp3>
 */
import puppeteer from 'puppeteer-core';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dossier = process.argv[2];
if (!dossier) throw new Error('usage : node scripts/controle-signaux-corps.mjs <dossier-mp3>');

// Relevés sur les 528 fichiers de client/public/audio/ — voir l'en-tête.
const PART_AIGUE_MIN = 0.246;   // 10ᵉ centile du corpus admis
const CRETE_MIN = 9.9;          //  5ᵉ centile du corpus admis

const noms = readdirSync(dossier).filter(f => f.endsWith('.mp3')).sort();

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.goto('about:blank');

const mesures = [];
for (const nom of noms) {
  const b64 = readFileSync(join(dossier, nom)).toString('base64');
  mesures.push(await p.evaluate(async (b64, nom) => {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const ctx = new OfflineAudioContext(1, 48000, 48000);
    const buf = await ctx.decodeAudioData(bin.buffer);
    const x = buf.getChannelData(0);
    const sr = buf.sampleRate;

    let crete = 0, somme = 0;
    for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > crete) crete = a; somme += x[i] * x[i]; }
    const rms = Math.sqrt(somme / x.length);

    // Passe-haut du premier ordre à 500 Hz — la MÊME mesure que celle qui a
    // servi à relever les centiles du corpus, sans quoi la comparaison ment.
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
}
await b.close();

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

console.log(`${noms.length} signaux mesurés\n`);
for (const m of mesures) {
  const court = m.nom.replace('.mp3', '').padEnd(13);
  verifier(`${court} s'entend sur un baffle de téléphone`,
    m.partAigue >= PART_AIGUE_MIN,
    `${(m.partAigue * 100).toFixed(0)} % d'énergie au-dessus de 500 Hz (plancher ${(PART_AIGUE_MIN * 100).toFixed(0)} %)`);
}
for (const m of mesures) {
  const court = m.nom.replace('.mp3', '').padEnd(13);
  verifier(`${court} a des attaques, ce n'est pas une nappe`,
    m.crest >= CRETE_MIN,
    `crête ${m.crest.toFixed(1)} dB au-dessus du niveau moyen (plancher ${CRETE_MIN})`);
}

console.log(echecs
  ? `\n${echecs} vérification(s) en échec. Reste l'écoute, qu'aucune mesure ne remplace.`
  : '\nRien d\'inaudible ni d\'informe. Reste l\'écoute, qu\'aucune mesure ne remplace.');
process.exit(echecs ? 1 : 0);
