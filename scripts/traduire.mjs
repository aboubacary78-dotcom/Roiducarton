/*
 * Ajoute des traductions au second dictionnaire.
 *   node scripts/traduire.mjs lot.json     // [["français","english"], …]
 * Refuse les doublons et les clés déjà traduites : le dictionnaire est un
 * objet littéral, une clé en double serait silencieusement écrasée.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const CIBLE = 'client/src/lib/content-en-2.ts';
const dico = readFileSync('client/src/lib/content-en.ts', 'utf8') + readFileSync(CIBLE, 'utf8');
const dbl = s => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const lot = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const vus = new Set();
const ajouts = [];
const ignores = [];
for (const [fr, en] of lot) {
  if (vus.has(fr)) { ignores.push(`doublon dans le lot : ${fr.slice(0, 45)}…`); continue; }
  vus.add(fr);
  if (dico.includes(`"${dbl(fr)}":`)) { ignores.push(`déjà traduit : ${fr.slice(0, 45)}…`); continue; }
  ajouts.push([fr, en]);
}

let s = readFileSync(CIBLE, 'utf8');
const i = s.lastIndexOf('};');
s = s.slice(0, i) + ajouts.map(([fr, en]) => `  "${dbl(fr)}": "${dbl(en)}",\n`).join('') + s.slice(i);
writeFileSync(CIBLE, s);

console.log(`${ajouts.length} traduction(s) ajoutée(s)${ignores.length ? `, ${ignores.length} ignorée(s)` : ''}.`);
for (const x of ignores.slice(0, 8)) console.log('  ' + x);
