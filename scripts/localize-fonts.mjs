/*
 * Auto-héberge les polices du jeu (DM Serif Display, Outfit, JetBrains Mono).
 *
 * Télécharge les fichiers .woff2 depuis Google Fonts dans client/public/fonts/
 * et génère client/public/fonts/fonts.css avec les @font-face correspondants.
 * Ainsi la typographie est identique partout, même hors-ligne (app native),
 * sans dépendre de fonts.googleapis.com.
 *
 * Lancement :  node scripts/localize-fonts.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(root, 'client/public/fonts');
const CSS_URL = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
// Sous-ensembles utiles pour le français (latin-ext couvre œ, Œ, etc.)
const SUBSETS = new Set(['latin', 'latin-ext']);

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();

// Parse les blocs @font-face précédés de leur commentaire de subset.
const blockRe = /\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
const faces = [];
for (const m of css.matchAll(blockRe)) {
  const subset = m[1];
  if (!SUBSETS.has(subset)) continue;
  const body = m[2];
  const family = /font-family:\s*'([^']+)'/.exec(body)?.[1];
  const style = /font-style:\s*(\w+)/.exec(body)?.[1] || 'normal';
  const weight = /font-weight:\s*([\d\s]+)/.exec(body)?.[1].trim() || '400';
  const url = /url\((https:[^)]+\.woff2)\)/.exec(body)?.[1];
  const range = /unicode-range:\s*([^;]+);/.exec(body)?.[1].trim();
  if (family && url) faces.push({ subset, family, style, weight, url, range });
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');
let outCss = '/* Polices auto-hébergées — générées par scripts/localize-fonts.mjs */\n';
let n = 0;
for (const f of faces) {
  const name = `${slug(f.family)}-${f.weight.replace(/\s+/g, '_')}${f.style === 'italic' ? '-italic' : ''}-${f.subset}.woff2`;
  const dest = resolve(OUT_DIR, name);
  if (!existsSync(dest)) {
    const buf = Buffer.from(await (await fetch(f.url, { headers: { 'User-Agent': UA } })).arrayBuffer());
    writeFileSync(dest, buf);
  }
  outCss += `@font-face {\n  font-family: '${f.family}';\n  font-style: ${f.style};\n  font-weight: ${f.weight};\n  font-display: swap;\n  src: url('/fonts/${name}') format('woff2');\n${f.range ? `  unicode-range: ${f.range};\n` : ''}}\n`;
  n++;
  console.log(`  ✓ ${name}`);
}

writeFileSync(resolve(OUT_DIR, 'fonts.css'), outCss);
console.log(`\n${n} fichier(s) de police + fonts.css générés dans client/public/fonts/`);
