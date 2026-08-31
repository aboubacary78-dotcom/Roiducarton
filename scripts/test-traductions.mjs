/*
 * AUCUNE TRADUCTION ORPHELINE.
 *
 * La phrase française est la clé du dictionnaire anglais. Réécrire un texte
 * sans re-clé sa traduction ne casse rien de visible : `tc` ne trouve pas la
 * clé, renvoie le français, et le joueur anglophone lit du français au milieu
 * de sa partie. On ne s'en aperçoit qu'en jouant en anglais.
 *
 * Ce test relit tout : chaque clé du dictionnaire doit exister mot pour mot
 * dans les sources. Une clé orpheline est une traduction perdue.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCES = ['client/src'];
const DICOS = ['client/src/lib/content-en.ts', 'client/src/lib/content-en-2.ts'];

let corpus = '';
const marcher = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) marcher(p);
    else if (/\.tsx?$/.test(e.name) && !DICOS.includes(p)) corpus += readFileSync(p, 'utf8');
  }
};
SOURCES.forEach(marcher);

// Les clés du dictionnaire, décodées depuis leur littéral à quotes doubles.
const decode = s => s.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
const orphelines = [];
let total = 0;
for (const f of DICOS) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/^\s*(?:"((?:\\.|[^"\\])+)"|'((?:\\.|[^'\\])+)')\s*:/gm)) {
    total++;
    const fr = decode(m[1] ?? m[2].replace(/\\'/g, "'"));
    // La clé doit se retrouver dans les sources, échappée pour un littéral à
    // quotes simples (le cas courant) ou telle quelle (gabarits, JSX).
    if (corpus.includes(fr.replace(/\\/g, '\\\\').replace(/'/g, "\\'"))) continue;
    if (corpus.includes(fr)) continue;
    orphelines.push({ f, fr });
  }
}

console.log(`${total} traductions, ${orphelines.length} orpheline(s).`);
for (const o of orphelines.slice(0, 25)) console.log(`  ${o.f} · « ${o.fr.slice(0, 90)} »`);
if (orphelines.length > 25) console.log(`  … et ${orphelines.length - 25} autres`);
process.exit(orphelines.length ? 1 : 0);
