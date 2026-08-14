/*
 * LA CHUTE NOMINALE.
 *
 * « Ambiance. » « Adrénaline pure. » « Gênant. » « Festin ! » — une phrase
 * finale de deux mots, sans sujet ni verbe, qui NOMME l'émotion au lieu de la
 * montrer. C'est le tic qui fait « écrit par une machine » : le lecteur reçoit
 * l'étiquette du sentiment, jamais le détail qui le produirait.
 *
 * Une chute courte n'est pas coupable en soi : « Vous êtes bleu pendant
 * 3 jours. » est courte, concrète et drôle. On ne cherche donc que les
 * fragments sans verbe conjugué.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'client/src/contexts/data';
const SUJETS = /\b(je|tu|il|elle|on|nous|vous|ils|elles|c'|ça|ce|qui|y a|voilà|reste|font|fait|sont|est|a |ai |as )/i;

const total = {};
const cas = [];
for (const f of readdirSync(DATA).filter(x => x.endsWith('.ts'))) {
  const src = readFileSync(join(DATA, f), 'utf8');
  const re = /(?:^|[\s:{,(])(text|desc|hint|description)\s*:\s*(['"])((?:\\.|(?!\2).){25,400})\2/gms;
  let m;
  while ((m = re.exec(src))) {
    const t = m[3].replace(/\\'/g, "'").trim();
    if (/\b(the|you|your|with)\b/i.test(t) && !/[àâçéèêëîïôùûü]/.test(t)) continue;
    total[f] = (total[f] || 0) + 1;
    const ph = t.split(/(?<=[.!?…])\s+/).filter(Boolean);
    if (ph.length < 2) continue;
    const d = ph[ph.length - 1].trim();
    const mots = (d.match(/\S+/g) || []).length;
    if (mots > 4) continue;
    if (SUJETS.test(d)) continue;          // il y a un sujet : ce n'est pas nominal
    if (/^["«]/.test(d)) continue;          // du dialogue, pas une étiquette
    cas.push({ f, t, d, ligne: src.slice(0, m.index).split('\n').length });
  }
}

const parFichier = {};
for (const c of cas) parFichier[c.f] = (parFichier[c.f] || 0) + 1;
console.log(`${cas.length} chutes nominales sur ${Object.values(total).reduce((a, b) => a + b, 0)} passages.\n`);
Object.entries(parFichier).sort((a, b) => b[1] - a[1]).forEach(([f, n]) =>
  console.log(`  ${String(n).padStart(3)}  ${f}  (${((n / total[f]) * 100).toFixed(0)} % du fichier)`));

if (process.argv[2] === '--liste') {
  const filtre = process.argv[3];
  console.log();
  for (const c of cas.filter(c => !filtre || c.f === filtre)) console.log(`L${c.ligne} [${c.d}]  ${c.t}`);
}
