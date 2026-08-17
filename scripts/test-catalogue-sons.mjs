/*
 * LE BANC D'ESSAI NE DOIT AVOIR AUCUN BOUTON MORT.
 *
 * Un testeur qui appuie sur « écouter » et n'entend rien ne signale pas un
 * fichier manquant : il note le son comme raté, et l'avis est faussé. Le
 * catalogue est écrit à la main — une faute de frappe suffit.
 *
 * On vérifie donc les deux sens :
 *   - chaque entrée du catalogue a son fichier sur le disque, variantes
 *     comprises ;
 *   - chaque fichier livré est présenté au moins une fois, sinon un son est
 *     dans le jeu sans que personne ne puisse le juger.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'cat-'));
const entry = join(dir, 'entry.ts');
writeFileSync(entry, "export { CATALOGUE_SONS, compterFichiers } from '@/lib/catalogueSons';\n");
const out = join(process.cwd(), '.bundle-catalogue.mjs');
await build({
  entryPoints: [entry], bundle: true, format: 'esm', outfile: out,
  platform: 'neutral', target: 'es2022', logLevel: 'error',
  alias: { '@': join(process.cwd(), 'client/src') },
});
const { CATALOGUE_SONS, compterFichiers } = await import(out);

const DOSSIER = 'client/public/audio';
const surDisque = new Set(readdirSync(DOSSIER).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)));

let echecs = 0;
const rater = (m) => { console.log(`  RATÉ ${m}`); echecs++; };

// ---- 1. Chaque bouton du banc joue-t-il quelque chose ? --------------------
const presentes = new Set();
for (const famille of CATALOGUE_SONS) {
  for (const son of famille.sons) {
    const noms = son.prises && son.prises > 1
      ? Array.from({ length: son.prises }, (_, i) => `${son.fichier}-${i + 1}`)
      : [son.fichier];
    for (const n of noms) {
      presentes.add(n);
      if (!surDisque.has(n)) rater(`${famille.id} : ${n}.mp3 est au catalogue mais pas sur le disque`);
    }
  }
}

// ---- 2. Chaque son livré est-il jugeable ? --------------------------------
// Les ambiances, les cris et les bruitages de rencontre ne sont pas du ressort
// de ce banc : ils ont leurs propres fichiers, préfixés autrement.
const DUJEU = /^(geste|moment|argent|perte|social|jauge)-/;
for (const f of surDisque) {
  if (!DUJEU.test(f)) continue;
  if (!presentes.has(f)) rater(`${f}.mp3 est livré mais n'apparaît nulle part au banc d'essai`);
}

// ---- 3. Le catalogue dit-il vrai sur lui-même ? ----------------------------
const sons = CATALOGUE_SONS.reduce((t, f) => t + f.sons.length, 0);
if (compterFichiers() !== presentes.size) rater(`compterFichiers() annonce ${compterFichiers()} fichiers, il y en a ${presentes.size}`);

// ---- 4. Chaque son est-il branché quelque part dans le jeu ? ---------------
// Un son qu'aucun écran ne déclenche est un son que le banc fait juger pour
// rien : il ne sera jamais entendu en jouant.
const sourceSon = readFileSync('client/src/lib/sound.ts', 'utf8');
for (const famille of CATALOGUE_SONS) {
  for (const son of famille.sons) {
    if (!sourceSon.includes(`'${son.fichier}'`)) rater(`${son.fichier} n'est référencé nulle part dans sound.ts`);
  }
}

// ---- 5. Les textes sont-ils tous là, dans les deux langues ? ---------------
for (const famille of CATALOGUE_SONS) {
  if (!famille.regleFr || !famille.regleEn) rater(`la famille ${famille.id} n'a pas sa règle dans les deux langues`);
  for (const son of famille.sons) {
    for (const champ of ['fr', 'en', 'quandFr', 'quandEn']) {
      if (!son[champ] || son[champ].length < 8) rater(`${son.fichier} : champ « ${champ} » vide ou trop court`);
    }
  }
}

console.log(`${CATALOGUE_SONS.length} familles, ${sons} sons, ${presentes.size} fichiers avec les variantes.`);
console.log(echecs ? `\n${echecs} problème(s).` : '\nAucun bouton mort, aucun son oublié.');

rmSync(out, { force: true });
process.exit(echecs ? 1 : 0);
