/*
 * OÙ LE JEU EST-IL MUET ?
 *
 * On ne cherche pas les sons qui sonnent mal, mais ceux qui n'existent pas.
 * Deux passes :
 *
 *   1. LES GESTES. Chaque `onClick` d'un composant est une chose que le joueur
 *      touche. On regarde si un `play…()` part dans le même gestionnaire.
 *   2. LES ÉVÉNEMENTS DE JEU. Chaque écran monté, chaque overlay, chaque
 *      changement d'état marquant devrait s'entendre. On liste ceux qui
 *      n'appellent aucun son de tout le fichier.
 *
 * L'heuristique du n°1 est volontairement large : on prend les 400 caractères
 * qui suivent le `onClick` et on y cherche un appel de son. Un geste dont le
 * son part plus loin sera compté muet à tort — c'est signalé, pas corrigé
 * automatiquement, et la lecture manuelle tranche.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
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

const gestesMuets = [];
const ecransMuets = [];
let gestesTotal = 0, gestesSonores = 0;

for (const f of fichiers) {
  const src = readFileSync(f, 'utf8');
  const nom = f.split('/').pop().replace('.tsx', '');
  const sonsDuFichier = [...src.matchAll(/\bplay([A-Z]\w*)\s*\(/g)].map(m => 'play' + m[1]);

  /*
   * Le corps d'une fonction nommée du fichier. Beaucoup de gestes délèguent —
   * `onClick={dig}` — et le son part à l'intérieur : les compter muets serait
   * faux, et c'est l'erreur qu'a faite la première version de cet audit.
   */
  const corpsDe = (nomFn) => {
    const re = new RegExp(`(?:function\\s+${nomFn}\\s*\\(|const\\s+${nomFn}\\s*=)`);
    const i = src.search(re);
    return i < 0 ? '' : src.slice(i, i + 900);
  };

  // --- 1. les gestes ---
  for (const m of src.matchAll(/onClick\s*=\s*\{/g)) {
    const suite = src.slice(m.index, m.index + 400);
    gestesTotal++;
    if (SON.test(suite)) { gestesSonores++; continue; }
    // Le geste délègue-t-il à une fonction qui, elle, fait du bruit ?
    const appelees = [...suite.matchAll(/\b([a-z]\w{2,})\s*\(/g)].map(x => x[1])
      .filter(n => !['dispatch', 'setTimeout', 'tr', 'tc', 'require', 'Number', 'String'].includes(n));
    if (appelees.some(n => SON.test(corpsDe(n)))) { gestesSonores++; continue; }
    // De quoi s'agit-il ? On récupère le libellé le plus proche.
    const apres = src.slice(m.index, m.index + 700);
    const libelle = (apres.match(/tr\('([^']{3,45})'/) || apres.match(/>\s*([A-ZÀ-Ÿ][^<{]{3,40})/) || [])[1];
    const action = (apres.match(/type:\s*'([A-Z_]+)'/) || [])[1];
    const ecran = (apres.match(/screen:\s*'([a-z-]+)'/) || [])[1];
    gestesMuets.push({ fichier: nom, libelle: libelle?.trim(), action, ecran });
  }

  // --- 2. les écrans entièrement muets ---
  if (sonsDuFichier.length === 0 && /export default function/.test(src)) {
    ecransMuets.push({ nom, lignes: src.split('\n').length, clics: [...src.matchAll(/onClick/g)].length });
  }
}

console.log(`GESTES : ${gestesSonores}/${gestesTotal} déclenchent un son (${Math.round(gestesSonores / gestesTotal * 100)} %).\n`);

console.log(`ÉCRANS ENTIÈREMENT MUETS (aucun appel de son dans le fichier) : ${ecransMuets.length}`);
ecransMuets.sort((a, b) => b.clics - a.clics).forEach(e =>
  console.log(`  ${String(e.clics).padStart(2)} clic(s)  ${e.nom} (${e.lignes} lignes)`));

console.log(`\nGESTES SANS SON : ${gestesMuets.length}`);
const parFichier = {};
for (const g of gestesMuets) (parFichier[g.fichier] ??= []).push(g);
Object.entries(parFichier).sort((a, b) => b[1].length - a[1].length).forEach(([f, l]) => {
  console.log(`\n  ${f} — ${l.length}`);
  for (const g of l.slice(0, 8)) {
    const quoi = g.libelle || g.action || g.ecran || '(sans libellé)';
    console.log(`     · ${quoi}${g.action && g.libelle ? ` [${g.action}]` : ''}`);
  }
  if (l.length > 8) console.log(`     … et ${l.length - 8} autres`);
});
