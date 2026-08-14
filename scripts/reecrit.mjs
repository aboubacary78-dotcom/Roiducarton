/*
 * RÉÉCRIRE UN PASSAGE SANS PERDRE SON ANGLAIS.
 *
 * Dans ce projet, la phrase française EST la clé du dictionnaire de
 * traduction (voir lib/lang.ts, `tc`). Modifier un texte dans
 * contexts/data/*.ts sans toucher content-en*.ts ne casse rien de visible :
 * la recherche échoue en silence et le joueur anglophone reçoit du français.
 * C'est exactement le genre de dégât qu'on ne voit qu'à la lecture d'un store.
 *
 * Cet outil fait donc les deux d'un seul geste, et refuse de travailler s'il
 * ne trouve pas la chaîne exactement une fois.
 *
 *   node scripts/reecrit.mjs lot.json
 *
 * lot.json : [{ "fichier": "...", "fr": "ancien", "frNew": "...", "enNew": "..." }]
 * `enNew` est facultatif : sans lui, on conserve la traduction existante
 * (utile quand seule la ponctuation française change).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const EN_FILES = ['client/src/lib/content-en.ts', 'client/src/lib/content-en-2.ts'];

/** Réencode une chaîne pour un littéral TypeScript à quotes simples. */
const enSimple = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
/** Réencode une chaîne pour un littéral à quotes doubles (dictionnaires). */
const enDouble = s => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const lot = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const cache = new Map();
const lire = f => { if (!cache.has(f)) cache.set(f, readFileSync(f, 'utf8')); return cache.get(f); };
const ecrire = (f, s) => cache.set(f, s);

let ok = 0;
const soucis = [];
const ajouts = [];

for (const { fichier, fr, frNew, enNew } of lot) {
  // --- 1. le texte source ---------------------------------------------------
  const src = lire(fichier);
  // Les sources mélangent les deux quotes : un texte contenant une apostrophe
  // est souvent écrit entre guillemets doubles pour éviter les échappements.
  // On essaie donc les deux encodages avant de renoncer.
  const candidats = [[enSimple(fr), enSimple(frNew)], [enDouble(fr), enDouble(frNew)]];
  const choisi = candidats.find(([c]) => src.split(c).length - 1 === 1);
  if (!choisi) {
    const n = candidats.map(([c]) => src.split(c).length - 1).reduce((a, b) => a + b, 0);
    soucis.push(`${n} occurrence(s) dans ${fichier} : « ${fr.slice(0, 60)}… »`);
    continue;
  }
  const [cible, remplacement] = choisi;
  // Le texte fourni doit couvrir le littéral JUSQU'À SA FIN. Sinon on remplace
  // un préfixe et on laisse la chute derrière : « … sans jamais choisir dans
  // quel sens. Paradis. » On perd alors précisément ce qu'on venait retirer.
  const suite = src[src.indexOf(cible) + cible.length];
  if (suite !== "'" && suite !== '"') {
    soucis.push(`texte tronqué dans ${fichier} (il reste « ${src.slice(src.indexOf(cible) + cible.length).split(/['"]/)[0].slice(0, 40)} ») : « ${fr.slice(0, 50)}… »`);
    continue;
  }
  ecrire(fichier, src.replace(cible, remplacement));

  // --- 2. le dictionnaire anglais ------------------------------------------
  let trouve = false;
  for (const f of EN_FILES) {
    const dico = lire(f);
    const cleAncienne = `"${enDouble(fr)}":`;
    if (!dico.includes(cleAncienne)) continue;
    trouve = true;
    if (enNew) {
      // On remplace la LIGNE entière, clé et valeur. Repérage par index plutôt
      // que par expression régulière : les textes contiennent des guillemets,
      // des parenthèses et des points, et une regex construite à la volée finit
      // toujours par se tromper sur l'un d'eux.
      const i = dico.indexOf(cleAncienne);
      const debut = dico.lastIndexOf('\n', i) + 1;
      let fin = dico.indexOf('\n', i);
      if (fin < 0) fin = dico.length;
      const indent = dico.slice(debut).match(/^\s*/)[0];
      ecrire(f, dico.slice(0, debut) + `${indent}"${enDouble(frNew)}": "${enDouble(enNew)}",` + dico.slice(fin));
    } else {
      ecrire(f, dico.replace(cleAncienne, `"${enDouble(frNew)}":`));
    }
    break;
  }
  // Beaucoup de fichiers n'ont jamais été traduits (voir audit-traduction.mjs).
  // Quand la clé n'existe pas et qu'on fournit un anglais, on l'AJOUTE plutôt
  // que de se contenter d'un avertissement : sinon chaque réécriture creuse un
  // peu plus le trou de la version anglaise.
  if (!trouve) {
    if (enNew) ajouts.push([frNew, enNew]);
    else soucis.push(`⚠ pas de traduction pour « ${fr.slice(0, 50)}… » et aucun anglais fourni`);
  }
  ok++;
}

// Les traductions neuves rejoignent le second dictionnaire, en fin de table.
if (ajouts.length) {
  const f = EN_FILES[1];
  const dico = lire(f);
  const i = dico.rstrip ? 0 : dico.lastIndexOf('};');
  const lignes = ajouts.map(([fr, en]) => `  "${enDouble(fr)}": "${enDouble(en)}",\n`).join('');
  ecrire(f, dico.slice(0, i) + lignes + dico.slice(i));
}

for (const [f, s] of cache) writeFileSync(f, s);

console.log(`${ok}/${lot.length} passages réécrits${ajouts.length ? `, ${ajouts.length} traduction(s) créée(s)` : ''}.`);
for (const s of soucis) console.log('  ' + s);
process.exit(soucis.some(s => !s.startsWith('⚠')) ? 1 : 0);
