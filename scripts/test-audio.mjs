/*
 * LA LOGIQUE SONORE, VÉRIFIÉE SANS OREILLE.
 *
 * Trois règles écrites à la main méritent une preuve :
 *
 *   1. LES VARIANTES NE SE RÉPÈTENT JAMAIS D'AFFILÉE. Tirer au hasard parmi
 *      trois prises redonne la même une fois sur trois — soit exactement le
 *      métronome que les variantes devaient casser.
 *   2. LE SON DE L'ARGENT DIT LA SOMME. Deux pièces, une poignée, une liasse.
 *   3. L'ALERTE DE JAUGE NE SONNE QU'AU FRANCHISSEMENT, et se réarme quand on
 *      repasse au-dessus du seuil. Une alerte qui se rejoue à chaque action
 *      est une alarme, et une alarme se coupe.
 */
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'audio-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, "export * from '@/lib/sound';\n");

const out = join(process.cwd(), '.bundle-test-audio.mjs');

// ---- De quoi faire tourner du code de navigateur dans Node ------------------
const joues = [];
const memoire = new Map();
globalThis.localStorage = {
  getItem: k => (memoire.has(k) ? memoire.get(k) : null),
  setItem: (k, v) => memoire.set(k, String(v)),
  removeItem: k => memoire.delete(k), clear: () => memoire.clear(),
};

/*
 * Un contexte audio de façade. Il ne produit aucun son : il note quel tampon
 * part, et c'est tout ce qu'on veut savoir.
 */
class FauxContexte {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  resume() {}
  createGain() { return { gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {} }, connect: () => ({ connect() {} }), disconnect() {} }; }
  createBufferSource() {
    return {
      buffer: null,
      connect: () => ({ connect() {} }),
      // C'est ICI qu'on note, pas au chargement : les tampons décodés sont mis
      // en cache, donc un fichier n'est téléchargé qu'une fois même s'il est
      // joué mille fois. Compter les téléchargements ne mesurerait que le
      // premier passage.
      start() { if (this.buffer && this.buffer.__nom) joues.push(this.buffer.__nom); },
      stop() {}, disconnect() {},
    };
  }
  createOscillator() { return { type: '', frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} }, connect: () => ({ connect() {} }), start() {}, stop() {}, disconnect() {}, onended: null }; }
  createBuffer() { return { getChannelData: () => new Float32Array(8) }; }
  createBiquadFilter() { return { type: '', frequency: { value: 0, setValueAtTime() {} }, Q: { value: 0 }, connect: () => ({ connect() {} }), disconnect() {} }; }
}
globalThis.AudioContext = FauxContexte;
globalThis.window = { AudioContext: FauxContexte, localStorage: globalThis.localStorage, addEventListener() {}, dispatchEvent() {} };
globalThis.document = { documentElement: { lang: 'fr' } };
Object.defineProperty(globalThis.navigator, 'language', { value: 'fr-FR', configurable: true });

/*
 * Le chargement répond « présent » sans réseau. Chaque tampon est étiqueté du
 * nom de son fichier — par identité d'objet, pas par taille — pour qu'on
 * sache à la lecture quel son vient de partir.
 */
const nomDuTampon = new WeakMap();
globalThis.fetch = (url) => {
  const nom = String(url).split('/').pop();
  const octets = new ArrayBuffer(8);
  nomDuTampon.set(octets, nom);
  return Promise.resolve({
    ok: true, headers: { get: () => 'audio/mpeg' },
    arrayBuffer: () => Promise.resolve(octets),
  });
};
FauxContexte.prototype.decodeAudioData = (octets) =>
  Promise.resolve({ duration: 0.3, numberOfChannels: 1, __nom: nomDuTampon.get(octets) });

await build({
  entryPoints: [entry], bundle: true, format: 'esm', outfile: out,
  platform: 'neutral', target: 'es2022', logLevel: 'error',
  alias: { '@': join(process.cwd(), 'client/src'), '@capacitor/core': shim },
  external: ['react', 'react-dom', 'framer-motion', 'wouter', '@capacitor/*'],
});
const son = await import(out);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};
// loadAudio → decodeAudioData → playBuffer : trois promesses à laisser filer.
const attendre = () => new Promise(r => setTimeout(r, 4));
const vider = () => { joues.length = 0; };

// ---- 1. Les variantes ------------------------------------------------------
vider();
for (let i = 0; i < 200; i++) { son.playClick(); await attendre(); }
const suite = joues.filter(n => n.startsWith('geste-clic'));
const distinctes = new Set(suite);
verifier('le clic tire bien parmi ses trois prises',
  distinctes.size === 3, `${distinctes.size} prise(s) : ${[...distinctes].sort().join(', ')}`);

let repetitions = 0;
for (let i = 1; i < suite.length; i++) if (suite[i] === suite[i - 1]) repetitions++;
verifier('jamais deux fois la même prise d\'affilée',
  repetitions === 0, `${repetitions} répétition(s) sur ${suite.length} clics`);

// Le hasard doit rester du hasard : aucune prise ne doit écraser les autres.
const comptes = [...distinctes].map(n => suite.filter(x => x === n).length);
const ecart = Math.max(...comptes) / Math.min(...comptes);
verifier('les trois prises sortent à peu près autant',
  ecart < 2.5, `rapport ${ecart.toFixed(2)} entre la plus et la moins tirée`);

// ---- 2. L'argent -----------------------------------------------------------
for (const [montant, attendu] of [[1, 'argent-piece-entree'], [3, 'argent-piece-entree'],
                                  [4, 'argent-poignee-entree'], [15, 'argent-poignee-entree'],
                                  [16, 'argent-liasse'], [80, 'argent-liasse']]) {
  vider(); son.playMoneyIn(montant); await attendre();
  const nom = (joues[0] || '').replace(/(-[123])?\.mp3$/, '');
  verifier(`${String(montant).padStart(2)} € → ${attendu}`, nom === attendu, nom || 'aucun son');
}
vider(); son.playMoneyOut(); await attendre();
verifier('payer joue le son inverse', (joues[0] || '').startsWith('argent-sortie'), joues[0]);

// ---- 3. Les jauges ---------------------------------------------------------
son.resetGaugeAlerts();
vider();
son.playGaugeLow('hunger', 40); await attendre();
verifier('au-dessus du seuil, rien ne sonne', joues.length === 0, `${joues.length} son(s)`);

vider();
son.playGaugeLow('hunger', 20); await attendre();
verifier('en passant sous 25, l\'alerte part une fois', joues.length === 1, `${joues.length} son(s)`);

vider();
for (let i = 0; i < 10; i++) { son.playGaugeLow('hunger', 18 - i); await attendre(); }
verifier('tant qu\'on reste dans le rouge, elle se tait',
  joues.length === 0, `${joues.length} son(s) sur 10 actions`);

vider();
son.playGaugeLow('thirst', 10); await attendre();
verifier('une AUTRE jauge garde son alerte à elle', joues.length === 1, `${joues.length} son(s)`);

vider();
son.playGaugeLow('hunger', 60); await attendre();   // on remonte
son.playGaugeLow('hunger', 12); await attendre();   // on redescend
verifier('après être remonté, l\'alerte se réarme', joues.length === 1, `${joues.length} son(s)`);

son.resetGaugeAlerts();
vider();
son.playGaugeLow('hunger', 12); await attendre();
verifier('un nouveau personnage repart sans les alertes du défunt',
  joues.length === 1, `${joues.length} son(s)`);

// ---- 4. La sourdine --------------------------------------------------------
son.setMuted(true);
vider();
son.playClick(); son.playMoneyIn(5); son.playDeath(); await attendre();
verifier('en sourdine, plus aucun fichier n\'est demandé', joues.length === 0, `${joues.length} son(s)`);
son.setMuted(false);

rmSync(out, { force: true });
console.log(echecs ? `\n${echecs} vérification(s) en échec.` : '\nTout est conforme.');
process.exit(echecs ? 1 : 0);
