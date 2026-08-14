/*
 * Sort les textes français qui n'ont AUCUNE traduction, prêts à traduire.
 *   node scripts/extrait-nontraduit.mjs <fichier> [debut] [nombre]
 * Sortie : une ligne par texte, préfixée de son numéro d'ordre dans le fichier.
 */
import { readFileSync } from 'node:fs';

const fichier = process.argv[2];
const debut = Number(process.argv[3] ?? 0);
const nombre = Number(process.argv[4] ?? 40);

const dico = readFileSync('client/src/lib/content-en.ts', 'utf8') + readFileSync('client/src/lib/content-en-2.ts', 'utf8');
const dbl = s => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const src = readFileSync(fichier, 'utf8');

const vus = new Set();
const restants = [];
for (const m of src.matchAll(/(?:^|[\s:{,(])(text|desc|hint|description|name|label|title)\s*:\s*(['"])((?:\\.|(?!\2).){3,400})\2/gms)) {
  const t = m[3].replace(/\\'/g, "'").replace(/\\"/g, '"');
  if (t.length < 3) continue;
  // Certains fichiers portent leur anglais en clair, dans un champ frère
  // (`name`/`nameEn`, `desc`/`descEn`). Ceux-là ne passent pas par le
  // dictionnaire : les compter serait traduire deux fois la même chose.
  if (new RegExp(`${m[1]}En\\s*:`).test(src.slice(m.index, m.index + m[0].length + 260))) continue;
  if (!/[a-zà-ÿ]/i.test(t)) continue;
  if (vus.has(t)) continue;
  vus.add(t);
  if (dico.includes(`"${dbl(t)}":`)) continue;
  if (dico.includes(`'${t.replace(/'/g, "\\'")}':`)) continue;
  restants.push(t);
}

console.log(`${restants.length} textes sans traduction dans ${fichier}\n`);
restants.slice(debut, debut + nombre).forEach((t, i) => console.log(`${debut + i} ⟨${t}⟩`));
console.log(`\n[${debut}–${Math.min(debut + nombre, restants.length)} sur ${restants.length}]`);
