/*
 * LES DEUX TIMBRES SONT-ILS VRAIMENT DEUX ?
 *
 * La commande demandait deux interprètes différents, et le prestataire a livré
 * autre chose : deux voix de synthèse, en le disant franchement. C'est
 * acceptable — mais alors le risque change de nature, et il devient invisible.
 *
 * Une voix simplement transposée passe tous les contrôles ordinaires : les
 * fichiers ne sont pas identiques bit à bit, ils se décodent, ils ont le bon
 * niveau. Elle ne se trahit qu'à l'oreille, ou ici : dans le spectre.
 *
 * DEUX QUESTIONS, ET ELLES SONT DIFFÉRENTES.
 *
 *   · `h` ET `f` SONT-ILS DEUX PERSONNES ? Si les deux versions d'un même son
 *     ont le même spectre, on n'a qu'une voix, et le travail que le jeu fait
 *     pour attacher le joueur à SON personnage tombe à plat.
 *   · LES TROIS PRISES D'UNE FAMILLE SONT-ELLES DIFFÉRENTES ? Elles servent
 *     exactement à casser la répétition. Trois prises quasi identiques, et le
 *     son redevient le métronome qu'on cherchait à éviter — sauf qu'on aura
 *     payé trois fichiers pour ça.
 *
 * On mesure une empreinte spectrale : l'énergie dans vingt-quatre bandes
 * log-espacées, normalisée. C'est grossier et c'est voulu — on ne cherche pas
 * à décrire la voix, seulement à savoir si deux enregistrements viennent du
 * même endroit.
 *
 *     node scripts/controle-timbres-voix.mjs <dossier-mp3>
 */
import puppeteer from 'puppeteer-core';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dossier = process.argv[2];
if (!dossier) throw new Error('usage : node scripts/controle-timbres-voix.mjs <dossier-mp3>');

const noms = readdirSync(dossier).filter(f => f.endsWith('.mp3')).sort();

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.goto('about:blank');

/** Empreinte spectrale d'un fichier : 24 bandes log de 80 Hz à 12 kHz. */
const empreintes = {};
for (const nom of noms) {
  const b64 = readFileSync(join(dossier, nom)).toString('base64');
  empreintes[nom.replace('.mp3', '')] = await p.evaluate(async (data) => {
    const bin = atob(data);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const ac = new AudioContext();
    const a = await ac.decodeAudioData(buf.buffer);
    const x = a.getChannelData(0);
    const hz = a.sampleRate;
    await ac.close();

    // Goertzel plutôt qu'une FFT : on ne veut que vingt-quatre fréquences, et
    // vingt-quatre Goertzel coûtent moins cher qu'une transformée complète.
    const BANDES = 24;
    const bas = 80, haut = 12000;
    const out = [];
    for (let k = 0; k < BANDES; k++) {
      const f = bas * Math.pow(haut / bas, k / (BANDES - 1));
      const w = 2 * Math.PI * f / hz;
      const coef = 2 * Math.cos(w);
      let s0 = 0, s1 = 0, s2 = 0;
      for (let i = 0; i < x.length; i++) {
        s0 = x[i] + coef * s1 - s2;
        s2 = s1; s1 = s0;
      }
      out.push(Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - coef * s1 * s2)) / x.length);
    }
    // Normalisée : on compare des COULEURS de son, pas des volumes.
    const total = out.reduce((s, v) => s + v, 0) || 1;
    return out.map(v => v / total);
  }, b64);
}
await b.close();

/** Distance entre deux empreintes, 0 = identiques, 1 = tout autres. */
const distance = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / 2;

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

/*
 * LES SEUILS, ET D'OÙ ILS VIENNENT.
 *
 * Ils ne sont pas choisis au jugé : on les compare à ce que le lot produit
 * lui-même. Deux sons SANS RAPPORT (un rat et un tesson) donnent la distance
 * de référence haute ; deux prises de la même famille donnent la basse. Un
 * seuil absolu serait arbitraire, ces deux repères-là ne le sont pas.
 */
const paires = (t) => t.flatMap((a, i) => t.slice(i + 1).map(b => [a, b]));
const sansRapport = paires(['recup-rat-1', 'recup-verre', 'recup-guepes', 'recup-pourri-1'])
  .map(([a, b]) => distance(empreintes[a], empreintes[b]));
const REFERENCE = sansRapport.reduce((s, v) => s + v, 0) / sansRapport.length;
console.log(`  Repère : deux sons sans rapport sont à ${REFERENCE.toFixed(3)} l'un de l'autre.\n`);

// ── ① h et f sont-ils deux voix, ou une seule transposée ? ─────────────────
const FAMILLES = ['tete-1', 'tete-2', 'douleur-1', 'douleur-2', 'douleur-3',
  'degout-1', 'degout-2', 'degout-3', 'effort-1', 'effort-2', 'effort-3'];
const PASSANTS = ['agace-1', 'agace-2', 'agace-3', 'refus-1', 'refus-2', 'refus-3'];

const ecarts = [];
for (const f of FAMILLES) {
  const h = empreintes[`voix-h-${f}`], fem = empreintes[`voix-f-${f}`];
  if (h && fem) ecarts.push({ nom: f, d: distance(h, fem) });
}
for (const f of PASSANTS) {
  const h = empreintes[`passant-h-${f}`], fem = empreintes[`passant-f-${f}`];
  if (h && fem) ecarts.push({ nom: f, d: distance(h, fem) });
}
// Un dixième de la distance entre deux sons sans rapport : très permissif,
// mais suffisant pour attraper une voix simplement re-pitchée, qui garde une
// enveloppe spectrale quasi superposable.
const SEUIL_TIMBRE = REFERENCE * 0.1;
const jumeaux = ecarts.filter(e => e.d < SEUIL_TIMBRE);
ecarts.sort((a, b) => a.d - b.d);
verifier(`les timbres h et f diffèrent sur les ${ecarts.length} paires`,
  jumeaux.length === 0,
  `la plus proche : ${ecarts[0].nom} à ${ecarts[0].d.toFixed(3)} (seuil ${SEUIL_TIMBRE.toFixed(3)})`);
for (const j of jumeaux) console.log(`        ${j.nom} : ${j.d.toFixed(3)}`);

// ── ② Les trois prises d'une famille sont-elles distinctes ? ───────────────
const TRIOS = [];
for (const g of ['h', 'f']) {
  for (const q of ['douleur', 'degout', 'effort']) TRIOS.push(`voix-${g}-${q}`);
  for (const q of ['agace', 'refus']) TRIOS.push(`passant-${g}-${q}`);
}
TRIOS.push('recup-rat', 'recup-pourri');

const plates = [];
const toutes = [];
for (const base of TRIOS) {
  const t = [1, 2, 3].map(n => empreintes[`${base}-${n}`]).filter(Boolean);
  if (t.length < 3) continue;
  const ds = paires(t).map(([a, b]) => distance(a, b));
  const min = Math.min(...ds);
  toutes.push({ base, min });
  if (min < SEUIL_TIMBRE) plates.push({ base, min });
}
toutes.sort((a, b) => a.min - b.min);
verifier(`les trois prises diffèrent dans les ${toutes.length} familles`,
  plates.length === 0,
  `la plus plate : ${toutes[0].base} à ${toutes[0].min.toFixed(3)}`);
for (const f of plates) console.log(`        ${f.base} : ${f.min.toFixed(3)}`);

/* ── CE QUE CETTE MESURE NE PEUT PAS FAIRE, ET IL FAUT LE SAVOIR ───────────
 *
 * Un troisième contrôle a été écrit ici, puis retiré : « chaque voix
 * ressemble-t-elle plus à elle-même qu'à l'autre ? » — c'est-à-dire
 * `voix-h-douleur-1` plus proche des autres `voix-h-*` que des `voix-f-*`.
 * Il échouait sur neuf fichiers, et il avait tort.
 *
 * Vérification faite sur ce lot même :
 *
 *     même contenu, genre différent   0,548
 *     même genre, contenu différent   0,614   ← le plus ÉLOIGNÉ
 *     même genre, même catégorie      0,436
 *
 * Un spectre en vingt-quatre bandes décrit CE QUI EST DIT, pas QUI le dit. Un
 * souffle de panique et un grognement d'effort ne se ressemblent pas, même
 * sortis de la même gorge — et deux souffles de panique se ressemblent, même
 * sortis de deux gorges différentes. Le contrôle mesurait donc le contenu en
 * croyant mesurer l'identité, et un lot parfaitement bon le faisait échouer.
 *
 * Les deux contrôles qui restent tiennent parce qu'ils comparent À CONTENU
 * ÉGAL : la même réaction dans les deux timbres, la même réaction en trois
 * prises. C'est la seule façon d'isoler ce qu'on cherche.
 *
 * Reconnaître les deux voix l'une de l'autre demanderait une empreinte de
 * locuteur, pas un spectre moyen. Ça ne vaut pas le détour ici : deux prises
 * écoutées à la suite le disent en trois secondes.
 */
const contenuEgal = FAMILLES
  .filter(f => empreintes[`voix-h-${f}`] && empreintes[`voix-f-${f}`])
  .map(f => distance(empreintes[`voix-h-${f}`], empreintes[`voix-f-${f}`]));
const moyenne = contenuEgal.reduce((s, v) => s + v, 0) / contenuEgal.length;
console.log(`\n  À contenu égal, les deux timbres sont à ${moyenne.toFixed(3)} l'un de l'autre`);
console.log(`  (deux sons sans aucun rapport : ${REFERENCE.toFixed(3)}).`);
console.log('  Ce contrôle dit que ce ne sont pas les mêmes prises ; il ne dit');
console.log('  pas que les deux voix sont crédibles. Ça, il faut l\'écouter.');

console.log(echecs
  ? `\n${echecs} contrôle(s) en échec.`
  : '\nDeux voix, et des prises qui ne se répètent pas.');
process.exit(echecs ? 1 : 0);
