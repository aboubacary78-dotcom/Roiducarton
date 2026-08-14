/*
 * Sort les passages qui finissent sur une chute courte, avec leur ligne, pour
 * pouvoir les réécrire un par un sans se tromper de chaîne.
 *   node scripts/extrait-chutes.mjs <fichier> [debut] [nombre]
 */
import { readFileSync } from 'node:fs';

const fichier = process.argv[2];
const debut = Number(process.argv[3] ?? 0);
const nombre = Number(process.argv[4] ?? 40);

const src = readFileSync(fichier, 'utf8');
const lignes = src.split('\n');

const re = /(?:^|[\s:{,(])(text|desc|hint|description)\s*:\s*(['"])((?:\\.|(?!\2).){25,400})\2/gms;
const trouves = [];
let m;
while ((m = re.exec(src))) {
  const texte = m[3].replace(/\\'/g, "'").trim();
  const phrases = texte.split(/(?<=[.!?…])\s+/).filter(p => p.trim());
  if (phrases.length < 2) continue;
  const derniere = phrases[phrases.length - 1];
  const mots = (derniere.match(/\S+/g) || []).length;
  if (mots > 6) continue;
  const ligne = src.slice(0, m.index).split('\n').length;
  trouves.push({ ligne, champ: m[1], texte, chute: derniere });
}

console.log(`${trouves.length} chutes courtes dans ${fichier}\n`);
for (const t of trouves.slice(debut, debut + nombre)) {
  console.log(`--- L${t.ligne} (${t.champ})`);
  console.log(t.texte);
  console.log();
}
console.log(`[affiché ${debut}–${Math.min(debut + nombre, trouves.length)} sur ${trouves.length}]`);
// Contrôle : les lignes citées existent bien.
if (trouves.length && !lignes[trouves[0].ligne - 1]) console.error('⚠ numérotation suspecte');
