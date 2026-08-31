/*
 * L'ÉCRAN DE CHOIX NE DOIT JAMAIS SE RÉPÉTER SOUS LES YEUX DU JOUEUR.
 *
 * Trois collisions se voient, et une seule était corrigée :
 *
 *   · deux fois le même PRÉNOM sur l'écran, on ne sait plus lequel on
 *     choisit. Déjà réglé de longue date, on le garde sous surveillance ;
 *   · deux fois le même MÉTIER, mesuré à 19,5 % des écrans avant correction.
 *     Le métier donne les jauges de départ, l'objet en poche et la moitié du
 *     gag : deux « Ancien Sommelier » côte à côte font paraître le jeu bien
 *     plus pauvre qu'il ne l'est ;
 *   · une RELANCE qui rejoue un prénom de l'écran précédent, 40 % des
 *     relances. Le hasard était correct, il n'en avait simplement pas l'air.
 *
 * Le témoin en fin de fichier compte autant que le reste : la solution
 * proposée par l'audit (un « shuffle bag » naïf) est mesurée par le même
 * protocole, et elle produit des doublons là où le code n'en produit aucun.
 * Une correction qu'on ne mesure pas contre l'existant peut très bien aggraver
 * ce qu'elle prétend réparer.
 */
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'tirage-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, "export { generateCharacterTrio, generateCharacter, JOBS, TRAITS } from '@/contexts/GameContext';");

const out = join(process.cwd(), '.bundle-test-tirage.mjs');
const memoire = new Map();
globalThis.localStorage = {
  getItem: k => (memoire.has(k) ? memoire.get(k) : null),
  setItem: (k, v) => memoire.set(k, String(v)),
  removeItem: k => memoire.delete(k),
  clear: () => memoire.clear(),
};
globalThis.window = { localStorage: globalThis.localStorage, addEventListener() {}, dispatchEvent() {} };
globalThis.document = { documentElement: { lang: 'fr' } };
Object.defineProperty(globalThis.navigator, 'language', { value: 'fr-FR', configurable: true });

await build({
  entryPoints: [entry], bundle: true, format: 'esm', outfile: out,
  platform: 'neutral', target: 'es2022', logLevel: 'error',
  alias: { '@': join(process.cwd(), 'client/src'), '@capacitor/core': shim },
  external: ['react', 'react-dom', 'framer-motion', 'wouter', '@capacitor/*'],
});

const { generateCharacterTrio, generateCharacter, JOBS } = await import(out);

// `NAMES` n'est pas exporté : on relit la liste à la source, c'est la même.
const src = readFileSync('client/src/contexts/data/world.ts', 'utf8');
const bloc = src.slice(src.indexOf('const NAMES = ['));
const NAMES = bloc.slice(0, bloc.indexOf('];')).match(/'[^']+'/g).map(x => x.slice(1, -1));

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

const N = 20000;
console.log(`\n${N.toLocaleString('fr-FR')} écrans de choix simulés (${NAMES.length} prénoms, ${JOBS.length} métiers)\n`);

let doublonPrenom = 0, doublonMetier = 0, relanceRepetee = 0;
const freq = new Map();
let precedent = [];
for (let i = 0; i < N; i++) {
  // Comme le réducteur : une relance écarte les prénoms de l'écran précédent.
  const trio = generateCharacterTrio(precedent);
  const noms = trio.map(c => c.name);
  if (new Set(noms).size < 3) doublonPrenom++;
  if (new Set(trio.map(c => c.job.id)).size < 3) doublonMetier++;
  if (precedent.length && noms.some(n => precedent.includes(n))) relanceRepetee++;
  for (const n of noms) freq.set(n, (freq.get(n) || 0) + 1);
  precedent = noms;
}

verifier('jamais deux fois le même prénom sur un écran', doublonPrenom === 0, `${doublonPrenom} écran(s)`);
verifier('jamais deux fois le même métier sur un écran', doublonMetier === 0, `${doublonMetier} écran(s)`);
verifier('une relance ne rejoue aucun prénom du tirage précédent',
  relanceRepetee === 0, `${relanceRepetee} relance(s)`);

/*
 * Écarter des prénoms ne doit pas en privilégier d'autres : si le filtre
 * biaisait le tirage, quelques prénoms deviendraient rares et le joueur
 * verrait toujours les mêmes, soit exactement le défaut qu'on corrige.
 */
const tirages = [...freq.values()];
const attendu = (N * 3) / NAMES.length;
const ecart = Math.max(...tirages.map(v => Math.abs(v - attendu))) / attendu;
verifier('les vingt prénoms restent également probables',
  freq.size === NAMES.length && ecart < 0.08,
  `${freq.size} prénoms vus, écart max ${(ecart * 100).toFixed(1)} % autour de ${Math.round(attendu)}`);

/*
 * L'exclusion ne doit jamais assécher une liste. Vingt prénoms écartés sur
 * vingt : le générateur retire le filtre plutôt que de rendre `undefined`.
 */
const acculé = generateCharacter({ prenoms: NAMES, metiers: JOBS.map(j => j.id) });
verifier('un tirage sans aucun choix libre rend quand même un personnage',
  !!acculé?.name && !!acculé?.job?.id, `${acculé?.name} · ${acculé?.job?.id}`);

/*
 * L'écran de mort annonce le successeur par son nom. Reprendre celui du mort,
 * « Marcel est mort, Marcel vous attend », se lit comme un bug, alors on
 * l'écarte comme un prénom d'écran précédent (voir PREPARE_SUCCESSOR).
 */
let successeurHomonyme = 0;
for (let i = 0; i < 4000; i++) {
  if (generateCharacterTrio(['Marcel']).some(c => c.name === 'Marcel')) successeurHomonyme++;
}
verifier('le successeur ne reprend pas le prénom du mort',
  successeurHomonyme === 0, `${successeurHomonyme} sur 4000`);

// ═══════════════════════════════════════════════════════════════════════════
// Le témoin : la solution proposée, mesurée par le même protocole
// ═══════════════════════════════════════════════════════════════════════════
class SacPropose {
  constructor(items) { this.origine = [...items]; this.sac = []; }
  melange(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  tire() {
    if (this.sac.length === 0) { this.sac = [...this.origine]; this.melange(this.sac); }
    return this.sac.pop();
  }
}
const sac = new SacPropose(NAMES);
let doublonSac = 0;
for (let i = 0; i < N; i++) {
  const t = [sac.tire(), sac.tire(), sac.tire()];
  if (new Set(t).size < 3) doublonSac++;
}
/*
 * Le sac promet « mathématiquement impossible ». Il ne l'est pas : quand il
 * ne reste qu'un ou deux jetons, l'écran suivant vide le sac, le remplit, et
 * peut retirer un prénom qui vient de sortir. Environ un écran sur cent.
 */
verifier('le « shuffle bag » proposé, lui, produit bien des doublons',
  doublonSac > 0, `${doublonSac} écran(s) sur ${N} (${(doublonSac / N * 100).toFixed(2)} %)`);

console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nAucune répétition visible, et le tirage reste équitable.');
process.exit(echecs ? 1 : 0);
