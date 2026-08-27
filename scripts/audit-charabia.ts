/*
 * COMBIEN LE BROUILLAGE ABÎME-T-IL, ET QU'EST-CE QU'IL PRODUIT ?
 *
 * Le brouillage du mental bas s'est fait signaler comme « beaucoup de phrases
 * parasites » — capture d'écran à l'appui. Avant de le régler au jugé, on le
 * mesure sur les vrais textes du jeu, à plusieurs niveaux de mental :
 *
 *   · LA PART DE MOTS TOUCHÉS. « Un peu » et « un mot sur deux » ne se
 *     distinguent pas à l'œil sur une phrase, et se distinguent très bien sur
 *     un écran entier.
 *
 *   · LES JETONS IMPOSSIBLES. Un mot brouillé doit rester un mot mal lu.
 *     « ls'iritohe » pour « l'histoire » n'est pas une lecture difficile,
 *     c'est un caractère déplacé — ça ne se lit pas comme un symptôme, ça se
 *     lit comme un bug. On compte donc les sorties dont l'apostrophe ou le
 *     trait d'union a bougé : ce sont elles qui font passer la mécanique pour
 *     une faute de frappe.
 *
 *     npx tsx scripts/audit-charabia.ts
 */
import { readFileSync } from 'node:fs';
import { charabia } from '../client/src/lib/charabia';

// Les vraies phrases du jeu, prises dans les catalogues d'événements.
const textes: string[] = [];
for (const f of ['events.ts', 'events2-explore.ts', 'events2-beg.ts', 'events2-rest.ts', 'events2-steal.ts']) {
  const src = readFileSync(`client/src/contexts/data/${f}`, 'utf8');
  for (const m of src.matchAll(/(?:description|text): '((?:[^'\\]|\\.){40,300})'/g)) {
    textes.push(m[1].replace(/\\'/g, "'"));
  }
}
if (textes.length < 50) throw new Error(`trop peu de textes lus : ${textes.length}`);
console.log(`${textes.length} phrases du jeu\n`);

/** Un jeton dont la ponctuation interne a bougé n'est plus un mot mal lu. */
function ponctuationDeplacee(avant: string, apres: string): boolean {
  const pos = (s: string) => [...s].map((c, i) => (/['’-]/.test(c) ? i : -1)).filter(i => i >= 0).join(',');
  return pos(avant) !== pos(apres);
}

let punctuationCassee = 0;
console.log('  mental │ mots touchés │ ponctuation déplacée');
console.log('  ───────┼──────────────┼─────────────────────');
const exemples: string[] = [];
for (const mental of [19, 15, 12, 8, 4, 0]) {
  let mots = 0, touches = 0, casses = 0;
  for (const t of textes) {
    const sortie = charabia(t, mental);
    const a = t.split(/\s+/);
    const b = sortie.split(/\s+/);
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      mots++;
      if (a[i] !== b[i]) {
        touches++;
        if (ponctuationDeplacee(a[i], b[i])) {
          casses++; punctuationCassee++;
          if (exemples.length < 6 && /['’-]/.test(a[i])) exemples.push(`${a[i]} → ${b[i]}`);
        }
      }
    }
  }
  console.log(`  ${String(mental).padStart(6)} │ ${String(`${(touches / mots * 100).toFixed(1)} %`).padStart(12)} │ ${String(`${(casses / mots * 100).toFixed(2)} %`).padStart(20)}`);
}

if (exemples.length) {
  console.log('\n  ce que ça produit, et qui se lit comme un bug :');
  for (const e of exemples) console.log(`    ${e}`);
} else {
  console.log('\n  aucune ponctuation déplacée : chaque sortie reste un mot mal lu.');
}


/*
 * CE QUE ÇA DONNE À LIRE.
 *
 * Les pourcentages disent combien ; ils ne disent pas si c'est LISIBLE. Un
 * échantillon au niveau où le joueur le rencontre le plus — autour de 45,
 * juste sous le seuil — tranche mieux que n'importe quel chiffre.
 */
console.log('\n  échantillon à mental 10 :');
for (const t of textes.slice(0, 3)) {
  const brouille = charabia(t, 10);
  if (brouille === t) continue;
  console.log(`\n    ${t.slice(0, 110)}`);
  console.log(`    ${brouille.slice(0, 110)}`);
}

/*
 * ET LES VRAIES FAUTES, PENDANT QU'ON Y EST.
 *
 * « Beaucoup de phrases parasites » pouvait aussi désigner des fautes de
 * frappe dans les textes eux-mêmes. On cherche donc les motifs qu'aucun
 * relecteur ne laisse passer volontairement : un mot écrit deux fois de
 * suite, et un espace manquant après une virgule.
 */
const doublons: string[] = [];
const collages: string[] = [];
for (const t of textes) {
  for (const m of t.matchAll(/\b([a-zà-ÿ]{2,})\s+\1\b/gi)) doublons.push(m[0]);
  for (const m of t.matchAll(/[a-zà-ÿ],[a-zà-ÿ]/gi)) collages.push(m[0]);
}
console.log(`\n  mots écrits deux fois de suite : ${doublons.length}${doublons.length ? ' — ' + [...new Set(doublons)].slice(0, 6).join(', ') : ''}`);
console.log(`  virgules sans espace           : ${collages.length}${collages.length ? ' — ' + [...new Set(collages)].slice(0, 6).join(', ') : ''}`);

/*
 * ET C'EST UN CONTRÔLE, PAS UN RAPPORT.
 *
 * Un audit qu'on lit une fois puis qu'on oublie ne protège de rien : le
 * défaut qu'il vient de mettre au jour reviendrait au premier élargissement de
 * la classe de caractères, sans que personne s'en aperçoive avant une capture
 * d'écran. On sort donc en erreur.
 *
 * Les virgules collées et les mots doublés restent, eux, informatifs : « Vous
 * vous réveillez » est un français correct, et un compteur ne sait pas faire
 * la différence.
 */
if (punctuationCassee > 0) {
  console.log(`\n${punctuationCassee} mot(s) brouillé(s) avec la ponctuation déplacée : ce n'est plus une mauvaise lecture, c'est un bug apparent.`);
  process.exit(1);
}
console.log('\nLe texte se lit mal, il ne se lit pas cassé.');
