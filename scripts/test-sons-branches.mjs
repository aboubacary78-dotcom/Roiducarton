/*
 * UN SON LIVRÉ QUE PERSONNE N'APPELLE N'EXISTE PAS.
 *
 * C'est l'état dans lequel ce projet a passé des mois sans s'en apercevoir :
 * dix-huit fichiers commandés, spécifiés, payés, et jamais fabriqués, sans
 * que rien ne le signale. Puis quatre-vingt-un fichiers livrés et installés,
 * dont aucun ne jouait, parce qu'installer n'est pas brancher.
 *
 * Ce test ferme les deux trous d'un coup, dans les deux sens :
 *
 *   1. Chaque fonction `play*` exportée est-elle appelée quelque part ?
 *      Sinon on a écrit du code mort et un son ne se fera jamais entendre.
 *   2. Chaque fichier MP3 du dossier est-il atteignable depuis le code ?
 *      Sinon on transporte des mégaoctets dans l'APK pour rien.
 *
 * Le second contrôle est indulgent par nécessité : beaucoup de sons sont
 * atteints par un nom CONSTRUIT (`cry-${slug}`, `sfx-${id}`, `geste-clic-2`).
 * On vérifie donc qu'une FAMILLE est branchée, pas chaque fichier, sans quoi
 * le test crierait sur les 296 bruitages de rencontre, qui vont tous très
 * bien.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function tousLesFichiers(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? tousLesFichiers(p) : [p];
  });
}

const sources = tousLesFichiers('client/src').filter(f => /\.tsx?$/.test(f));
const parFichier = new Map(sources.map(f => [f, readFileSync(f, 'utf8')]));
const tout = [...parFichier.values()].join('\n');
const sons = readFileSync('client/src/lib/sound.ts', 'utf8');

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

// ── 1. Toute fonction exportée est-elle appelée ? ──────────────────────────
const expo = [...sons.matchAll(/export (const|function) (play[A-Za-z]+)/g)]
  .map(m => ({ kind: m[1], nom: m[2] }));

const orphelines = expo.filter(({ kind, nom }) => {
  let n = (tout.match(new RegExp(`\\b${nom}\\(`, 'g')) || []).length;
  // La ligne `export function x(` compte pour elle-même ; `export const x =` non.
  if (kind === 'function') n -= 1;
  return n <= 0;
});

verifier(`${expo.length} fonctions de son exportées, toutes appelées`,
  orphelines.length === 0, orphelines.map(o => o.nom).join(', '));

// ── 2. Tout fichier audio est-il atteignable ? ─────────────────────────────
const familles = new Map();
for (const f of readdirSync('client/public/audio').filter(f => f.endsWith('.mp3'))) {
  const nom = f.slice(0, -4);
  // On remonte à la famille : `geste-clic-2` → `geste-clic`, `cry-rat` → `cry`.
  const fam = /-\d+$/.test(nom) ? nom.replace(/-\d+$/, '') : nom;
  if (!familles.has(fam)) familles.set(fam, []);
  familles.get(fam).push(nom);
}

/*
 * Beaucoup de sons sont atteints par un nom CONSTRUIT, `cry-${slug}`,
 * `act-${geste}-${code}`, `amb-sig-${lieu}`. Chercher le nom complet dans les
 * sources les déclarerait tous inatteignables à tort.
 *
 * On remonte donc les préfixes segment par segment : `act-dormir-gare` est
 * atteignable si le code contient `act-dormir-gare`, ou `act-dormir-`, ou
 * `act-`. Le test reste utile, une famille entière que RIEN ne mentionne,
 * pas même son préfixe, tombe toujours.
 */
function atteignable(nom) {
  const bouts = nom.split('-');
  for (let n = bouts.length; n >= 1; n--) {
    const prefixe = bouts.slice(0, n).join('-') + (n < bouts.length ? '-' : '');
    if (tout.includes(prefixe)) return true;
  }
  return false;
}

/*
 * LES DORMANTS ASSUMÉS : ET POURQUOI IL FAUT LES NOMMER ICI.
 *
 * Les vingt fichiers des couches du hub (`amb-sig-*`, `vie-*`) ont été
 * débranchés : ils tombaient sans cause sur un écran immobile et se lisaient
 * comme un bug plutôt que comme une atmosphère. Les fichiers restent, au cas
 * où on rebranche.
 *
 * Le contrôle ci-dessus ne les a PAS vus partir, et c'est un trou : la
 * remontée de préfixe accepte `amb-sig-parc` parce que le code contient encore
 * `amb-`, et `vie-zi-rat` parce que le commentaire qui explique le retrait
 * contient `vie-*`. Autrement dit, expliquer le débranchement suffisait à
 * masquer le débranchement.
 *
 * On les déclare donc nommément. Un dormant listé ici est un choix ; un
 * dormant non listé reste une erreur, et c'est tout l'intérêt de la liste.
 */
const DORMANTS = [
  'amb-sig-parc', 'amb-sig-gare', 'amb-sig-marche',
  'amb-sig-centre-ville', 'amb-sig-zone-industrielle',
  'vie-parc-envol', 'vie-parc-banc', 'vie-cv-klaxon', 'vie-cv-vitrine',
  'vie-gare-annonce', 'vie-gare-valise', 'vie-marche-cagette',
  'vie-marche-kraft', 'vie-zi-tole', 'vie-zi-rat',
];

const inatteignables = [];
for (const [fam, fichiers] of familles) {
  if (DORMANTS.includes(fam)) continue;
  if (!atteignable(fam)) inatteignables.push(`${fam} (${fichiers.length})`);
}

verifier(`${familles.size - DORMANTS.length} familles de sons, toutes atteignables depuis le code`,
  inatteignables.length === 0, inatteignables.slice(0, 8).join(', '));

// Et l'inverse : un dormant qu'on rebranche doit sortir de la liste, sinon
// elle devient un tapis sous lequel on glisse les oublis suivants.
const rebranches = DORMANTS.filter(d => tout.includes(`/audio/${d}`) || tout.includes(`'${d}'`));
verifier(`les ${DORMANTS.length} fichiers débranchés le sont toujours`,
  rebranches.length === 0, rebranches.join(', '));

// ── 3. Les sons du dernier lot jouent-ils vraiment ? ───────────────────────
// Contrôle nommé, parce que ce sont eux qu'on vient de brancher et que
// l'oubli d'un seul est invisible à l'usage.
const LOT = {
  'corps-faim': 'sound.ts', 'corps-soif': 'sound.ts',
  'corps-froid': 'sound.ts', 'corps-epuise': 'sound.ts',
  'tension-alerte-1': 'sound.ts', 'tension-risque': 'sound.ts',
  'tension-compte': 'sound.ts',
  'combat-charge': 'sound.ts', 'combat-esquive': 'sound.ts',
  'objet-equipe': 'sound.ts', 'objet-casse': 'sound.ts', 'objet-plein': 'sound.ts',
  'ui-toast-bon': 'sound.ts', 'ui-toast-mauvais': 'sound.ts', 'ui-verrou': 'sound.ts',
  'police-presence': 'sound.ts', 'police-approche': 'sound.ts',
  'police-intervention': 'sound.ts',
};
const oublies = Object.keys(LOT).filter(f => !sons.includes(`'${f}'`));
verifier(`les ${Object.keys(LOT).length} sons du lot sont déclarés dans sound.ts`,
  oublies.length === 0, oublies.join(', '));

console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nRien de livré ne dort, rien de branché ne manque.');
process.exit(echecs ? 1 : 0);
