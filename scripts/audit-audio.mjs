/*
 * OÙ LE JEU EST-IL MUET ?
 *
 * On ne cherche pas les sons qui sonnent mal, mais ceux qui n'existent pas.
 *
 * L'exercice est plus délicat qu'il n'y paraît, et les trois premières
 * versions de ce script ont menti :
 *
 *   - la première comptait `onClick={dig}` muet alors que le son partait dans
 *     `dig` : il faut SUIVRE la délégation ;
 *   - la deuxième ne suivait que `onClick={() => dig()}` et pas `onClick={dig}`,
 *     la référence nue ;
 *   - la troisième coupait le corps des fonctions à 900 caractères et ne
 *     descendait qu'd'un niveau, si bien que `handleBuy` — qui joue son son
 *     trente lignes plus bas — et `ouvrir` — qui délègue à `sonnerCadeau` —
 *     passaient pour muets.
 *
 * Un chiffre faux mène à de fausses corrections : « réparer » un bouton qui
 * sonnait déjà lui ajoute un second son. D'où le soin ici :
 *
 *   1. LE CORPS RÉEL des fonctions, par comptage d'accolades, pas au forfait.
 *   2. TROIS NIVEAUX de délégation.
 *   3. LES NON-GESTES ÉCARTÉS : un `onClick` qui ne fait que
 *      `e.stopPropagation()` empêche une fermeture, il ne répond à aucune
 *      intention du joueur et ne doit pas sonner.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const RACINE = 'client/src/components';
const fichiers = [];
const marcher = d => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) marcher(p);
    else if (e.name.endsWith('.tsx')) fichiers.push(p);
  }
};
marcher(RACINE);
fichiers.push('client/src/pages/Home.tsx');

const SON = /\bplay[A-Z]\w*\s*\(/;
const IGNORER = new Set(['dispatch', 'setTimeout', 'clearTimeout', 'tr', 'tc', 'require',
  'Number', 'String', 'Math', 'console', 'haptic', 'pushToast', 'preventDefault', 'stopPropagation']);

const gestesMuets = [];
const ecransMuets = [];
let gestesTotal = 0, gestesSonores = 0, nonGestes = 0;

for (const f of fichiers) {
  const src = readFileSync(f, 'utf8');
  const nom = f.split('/').pop().replace('.tsx', '');

  /** Le corps réel d'une fonction nommée, délimité par ses accolades. */
  const corpsDe = (nomFn) => {
    const re = new RegExp(`(?:function\\s+${nomFn}\\s*\\(|(?:const|let)\\s+${nomFn}\\s*=)`);
    const i = src.search(re);
    if (i < 0) return '';
    const ouvre = src.indexOf('{', i);
    if (ouvre < 0) return src.slice(i, i + 400);
    let profondeur = 0;
    for (let j = ouvre; j < src.length; j++) {
      if (src[j] === '{') profondeur++;
      else if (src[j] === '}') { profondeur--; if (profondeur === 0) return src.slice(i, j + 1); }
    }
    return src.slice(i);
  };

  /** Ce texte, ou l'une des fonctions qu'il appelle, fait-il du bruit ? */
  const faitDuBruit = (texte, reste = 3, vus = new Set()) => {
    if (SON.test(texte)) return true;
    if (reste <= 0) return false;
    /*
     * On prend TOUS les identifiants du gestionnaire, appelés ou non.
     * `onClick={faire}` est une référence nue, et
     * `onClick={pret ? encaisser : undefined}` en cache une dans un ternaire :
     * ne chercher que les `nom(` manquait les deux, et trois boutons qui
     * sonnaient étaient comptés muets.
     */
    const entete = texte.match(/onClick\s*=\s*\{([\s\S]{0,200}?)\}/);
    const dansLEntete = entete ? [...entete[1].matchAll(/\b([a-z]\w{2,})\b/g)].map(x => x[1]) : [];
    const noms = [...texte.matchAll(/\b([a-z]\w{2,})\s*\(/g)].map(x => x[1])
      .concat(dansLEntete)
      .filter(n => !IGNORER.has(n) && !vus.has(n));
    for (const n of noms) {
      vus.add(n);
      const corps = corpsDe(n);
      if (corps && faitDuBruit(corps, reste - 1, vus)) return true;
    }
    return false;
  };

  // --- 1. les gestes ---
  for (const m of src.matchAll(/onClick\s*=\s*\{/g)) {
    const suite = src.slice(m.index, m.index + 400);

    /*
     * Le clic qui ne sert qu'à ne PAS fermer. On le rencontre sur le panneau
     * d'une superposition : il arrête la propagation vers le voile qui, lui,
     * referme. Ce n'est pas un geste du joueur, et le faire sonner produirait
     * un clic à chaque fois qu'on touche le vide d'une fenêtre.
     */
    const entete = suite.slice(0, suite.indexOf('}') + 1);
    if (/^onClick\s*=\s*\{\s*\(?\s*e\s*\)?\s*=>\s*e\.stopPropagation\(\)\s*\}/.test(entete)) {
      nonGestes++;
      continue;
    }

    /*
     * Le silence assumé. `data-sans-son` est la même marque que celle qui
     * dispense un bouton du clic par défaut : elle vaut donc dispense ici
     * aussi, sinon l'audit réclamerait éternellement un son qu'on a décidé de
     * ne pas mettre. La raison est écrite à côté de l'attribut, dans le code.
     */
    const avant = src.slice(Math.max(0, m.index - 300), m.index);
    if (/data-sans-son/.test(avant)) { nonGestes++; continue; }

    gestesTotal++;
    if (faitDuBruit(suite)) { gestesSonores++; continue; }

    const apres = src.slice(m.index, m.index + 700);
    const libelle = (apres.match(/tr\('([^']{3,45})'/) || apres.match(/>\s*([A-ZÀ-Ÿ][^<{]{3,40})/) || [])[1];
    const action = (apres.match(/type:\s*'([A-Z_]+)'/) || [])[1];
    const ligne = src.slice(0, m.index).split('\n').length;
    gestesMuets.push({ fichier: nom, ligne, libelle: libelle?.trim(), action, code: suite.split('\n')[0].trim().slice(0, 70) });
  }

  // --- 2. les écrans entièrement muets ---
  if (![...src.matchAll(/\bplay([A-Z]\w*)\s*\(/g)].length && /export default function/.test(src)) {
    ecransMuets.push({ nom, lignes: src.split('\n').length, clics: [...src.matchAll(/onClick/g)].length });
  }
}

const pct = Math.round(gestesSonores / gestesTotal * 100);
console.log(`GESTES : ${gestesSonores}/${gestesTotal} déclenchent un son (${pct} %).`);
console.log(`(${nonGestes} clics écartés : non-gestes, ou silence assumé et marqué dans le code.)\n`);

const avecClics = ecransMuets.filter(e => e.clics > 0);
console.log(`ÉCRANS SANS AUCUN SON, MAIS AVEC DES BOUTONS : ${avecClics.length}`);
avecClics.sort((a, b) => b.clics - a.clics).forEach(e =>
  console.log(`  ${String(e.clics).padStart(2)} clic(s)  ${e.nom} (${e.lignes} lignes)`));

console.log(`\nGESTES SANS SON : ${gestesMuets.length}`);
const parFichier = {};
for (const g of gestesMuets) (parFichier[g.fichier] ??= []).push(g);
Object.entries(parFichier).sort((a, b) => b[1].length - a[1].length).forEach(([f, l]) => {
  console.log(`\n  ${f} — ${l.length}`);
  for (const g of l) {
    const quoi = g.libelle || g.action || g.code;
    console.log(`     ${String(g.ligne).padStart(4)}  ${quoi}`);
  }
});

process.exit(gestesMuets.length ? 1 : 0);
