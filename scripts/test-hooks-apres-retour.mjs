/*
 * AUCUN HOOK NE DOIT SUIVRE UN RETOUR ANTICIPÉ.
 *
 * React exige que chaque rendu d'un composant appelle exactement les mêmes
 * hooks, dans le même ordre. Un `useEffect` placé APRÈS un `if (…) return`
 * disparaît dès que la condition bascule, et React refuse alors de rendre un
 * composant qui compte soudain un hook de moins : c'est l'erreur #300, et elle
 * ne se voit pas au typage, pas au build, pas à l'exécution normale — seulement
 * le jour où la condition devient vraie.
 *
 * Elle a planté le jeu en vrai : un hook ajouté sous le `if (!char) return
 * null` de l'écran de mort faisait s'effondrer l'application au moment exact
 * où l'on choisissait le personnage suivant, parce que c'est là que le
 * personnage passe à null.
 *
 * Ce test relit tous les composants et refuse cette forme.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const RACINES = ['client/src/components', 'client/src/pages'];
const fichiers = [];
const marcher = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) marcher(p);
    else if (e.name.endsWith('.tsx')) fichiers.push(p);
  }
};
for (const r of RACINES) marcher(r);

const HOOK = /^\s*(?:const|let|var)?\s*\w*\s*=?\s*\b(use[A-Z]\w*)\s*\(/;

/*
 * On repère le niveau par comptage d'accolades, pas par indentation.
 *
 * Une première version se fiait aux espaces en tête de ligne et signalait deux
 * `return null` qui vivent À L'INTÉRIEUR de callbacks `useMemo` — ils sont
 * parfaitement légitimes, ils sortent de la fonction de calcul, pas du
 * composant. Un détecteur qui crie au loup sur du code sain finit ignoré.
 *
 * Le corps d'un composant est au niveau 1 : seuls les `return` de ce niveau-là
 * sont des retours anticipés du rendu.
 */
const fautes = [];

for (const f of fichiers) {
  const src = readFileSync(f, 'utf8');
  const lignes = src.split('\n');

  let niveau = 0;
  let dansComposant = false;
  let niveauComposant = 0;
  let retourVu = 0;

  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    const nue = l.replace(/\/\/.*$/, '');

    const debut = /^(?:export default )?function [A-Z]\w*\s*\(/.test(l);
    if (debut && !dansComposant) {
      dansComposant = true;
      niveauComposant = niveau;
      retourVu = 0;
    }

    const avant = niveau;
    niveau += (nue.match(/\{/g) || []).length - (nue.match(/\}/g) || []).length;

    if (!dansComposant) continue;

    // Fin du composant : on revient au niveau où il a commencé.
    if (niveau <= niveauComposant && !debut && avant > niveauComposant) {
      dansComposant = false;
      continue;
    }

    // Un retour au premier niveau du corps du composant.
    const auPremierNiveau = avant === niveauComposant + 1;
    if (auPremierNiveau && /^\s*(?:if\s*\([^)]*\)\s*)?return\b/.test(nue) && !/=>/.test(nue)) {
      retourVu = i + 1;
      continue;
    }

    const m = nue.match(HOOK);
    if (retourVu && auPremierNiveau && m) {
      fautes.push({ fichier: f.replace('client/src/', ''), ligne: i + 1, hook: m[1], retour: retourVu });
      retourVu = 0;
    }
  }
}

if (fautes.length) {
  console.log(`${fautes.length} hook(s) placé(s) après un retour anticipé :\n`);
  for (const f of fautes) {
    console.log(`  ${f.fichier}:${f.ligne}  ${f.hook}()`);
    console.log(`     le retour anticipé est ligne ${f.retour} — le hook disparaît dès qu'il se déclenche`);
  }
  console.log('\nDéplacer ces hooks AU-DESSUS du retour.');
} else {
  console.log(`${fichiers.length} composants relus : aucun hook après un retour anticipé.`);
}
process.exit(fautes.length ? 1 : 0);
