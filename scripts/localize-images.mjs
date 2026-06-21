/*
 * Rapatrie en local toutes les images externes (CDN) du jeu.
 *
 * Ce que fait le script :
 *  1. Scanne les fichiers source à la recherche d'URL d'images (cloudfront, manuscdn…)
 *  2. Télécharge chaque image dans client/public/assets/
 *  3. Réécrit les fichiers source pour pointer vers /assets/<nom> (chemin local)
 *
 * Une image n'est réécrite QUE si son téléchargement a réussi : si un hôte est
 * injoignable, le lien d'origine est conservé (rien n'est cassé).
 *
 * Lancement (nécessite un accès réseau aux hôtes d'images) :
 *   node scripts/localize-images.mjs
 *
 * Note : dans l'environnement Claude Code web, les hôtes d'images peuvent être
 * bloqués par la politique réseau. Il faut alors les ajouter à la liste blanche
 * d'egress de l'environnement, ou lancer ce script depuis ta machine.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_FILES = [
  'client/src/contexts/GameContext.tsx',
  'client/src/components/game/EventScreen.tsx',
];
const ASSET_DIR = resolve(root, 'client/public/assets');
const PUBLIC_PREFIX = '/assets';
const URL_RE = /https?:\/\/[^\s'"`)]+?\.(?:webp|png|jpe?g|gif)/gi;

function localName(url) {
  // Nom de fichier propre basé sur le dernier segment de l'URL (sans query).
  const clean = url.split('?')[0];
  return basename(clean);
}

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) throw new Error(`fichier suspect (${buf.length} octets)`);
  writeFileSync(dest, buf);
  return buf.length;
}

const urls = new Set();
for (const rel of SOURCE_FILES) {
  const p = resolve(root, rel);
  if (!existsSync(p)) continue;
  const txt = readFileSync(p, 'utf8');
  for (const m of txt.matchAll(URL_RE)) urls.add(m[0]);
}

console.log(`${urls.size} image(s) externe(s) trouvée(s).`);
if (!existsSync(ASSET_DIR)) mkdirSync(ASSET_DIR, { recursive: true });

const mapping = new Map(); // url -> /assets/<name>
let ok = 0, fail = 0;
for (const url of urls) {
  const name = localName(url);
  const dest = resolve(ASSET_DIR, name);
  try {
    if (!existsSync(dest)) {
      const size = await download(url, dest);
      console.log(`  ✓ ${name} (${size} o)`);
    } else {
      console.log(`  • ${name} (déjà présent)`);
    }
    mapping.set(url, `${PUBLIC_PREFIX}/${name}`);
    ok++;
  } catch (e) {
    console.log(`  ✗ ${name} — ${e.message}`);
    fail++;
  }
}

// Réécriture des sources pour les images téléchargées avec succès.
let rewrites = 0;
for (const rel of SOURCE_FILES) {
  const p = resolve(root, rel);
  if (!existsSync(p)) continue;
  let txt = readFileSync(p, 'utf8');
  let changed = false;
  for (const [url, local] of mapping) {
    if (txt.includes(url)) {
      txt = txt.split(url).join(local);
      changed = true;
      rewrites++;
    }
  }
  if (changed) writeFileSync(p, txt);
}

console.log(`\nTerminé : ${ok} téléchargée(s), ${fail} échec(s), ${rewrites} lien(s) réécrit(s).`);
if (fail > 0) console.log('Les images en échec gardent leur lien d\'origine. Relance le script une fois l\'accès réseau ouvert.');
