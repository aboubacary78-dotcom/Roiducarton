/*
 * COMBIEN DU JEU EST RÉELLEMENT TRADUIT ?
 *
 * `tc` renvoie le français quand il ne trouve pas la clé : un texte non traduit
 * ne casse rien, il s'affiche en français au milieu d'une partie anglaise.
 * Rien dans le code ne le signale. On compte donc fichier par fichier.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'client/src/contexts/data';
const dico = readFileSync('client/src/lib/content-en.ts', 'utf8') + readFileSync('client/src/lib/content-en-2.ts', 'utf8');
const dbl = s => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const lignes = [];
let tt = 0, tr = 0;
for (const f of readdirSync(DATA).filter(x => x.endsWith('.ts'))) {
  const src = readFileSync(join(DATA, f), 'utf8');
  let n = 0, ok = 0;
  for (const m of src.matchAll(/(?:^|[\s:{,(])(text|desc|hint|description|name|label)\s*:\s*'((?:\\.|[^'\\]){20,400})'/gms)) {
    const t = m[2].replace(/\\'/g, "'");
    if (!/[àâçéèêëîïôùûü]/.test(t) && /\b(the|you|your)\b/i.test(t)) continue;  // déjà de l'anglais
    // Champ frère `…En` : l'anglais est écrit en clair, pas dans le dictionnaire.
    if (new RegExp(`${m[1]}En\\s*:`).test(src.slice(m.index, m.index + m[0].length + 260))) continue;
    n++;
    if (dico.includes(`"${dbl(t)}":`)) ok++;
  }
  if (n >= 10) { lignes.push([f, ok, n]); tt += n; tr += ok; }
}
lignes.sort((a, b) => a[1] / a[2] - b[1] / b[2]);
console.log(`Textes français repérés : ${tt} — traduits : ${tr} (${((tr / tt) * 100).toFixed(0)} %)\n`);
for (const [f, ok, n] of lignes) {
  const p = (ok / n) * 100;
  console.log(`  ${p.toFixed(0).padStart(3)} %  ${String(ok).padStart(4)}/${String(n).padEnd(4)}  ${f}`);
}
