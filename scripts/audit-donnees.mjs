/*
 * TROIS CRIBLES SUR LES DONNÉES, QUI NE COÛTENT RIEN ET NE CRIENT PAS POUR RIEN.
 *
 *   ① LES CLÉS EN DOUBLE. Un objet littéral qui déclare deux fois la même clé
 *     ne lève rien : la seconde écrase la première, en silence. Dans un
 *     dictionnaire de traduction, c'est un texte qui n'apparaîtra jamais, et
 *     que plus personne ne peut compter comme manquant, puisqu'il a disparu de
 *     l'objet lui-même.
 *
 *   ② LES CLÉS DE STOCKAGE. Tout ce que le jeu retient vit dans le
 *     `localStorage`. Une clé écrite d'une façon et relue d'une autre ne lève
 *     rien non plus : la lecture rend `null`, le repli se déclenche, et le
 *     joueur perd ce qu'il croyait gardé. On cherche donc les quasi-jumelles,
 *     et les chaînes recopiées en dur dans plusieurs fichiers, qui finissent
 *     toujours par diverger d'un caractère.
 *
 *   ③ LES IMAGES CITÉES ET ABSENTES. `SafeImg` rattrape avec un repli, mais
 *     une citation sans fichier ET sans repli laisserait un trou à l'écran.
 *
 * Aucun des trois n'a besoin de navigateur : ils lisent les sources.
 *
 *     pnpm audit-donnees
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const skip = new Set(['node_modules', '.git', 'dist', 'android', 'ios']);
function fichiers(d, ext, o = []) {
  for (const n of readdirSync(d)) {
    if (skip.has(n)) continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) fichiers(p, ext, o);
    else if (ext.test(n)) o.push(p);
  }
  return o;
}
let defauts = 0;
const titre = t => console.log(`\n${t}\n${'─'.repeat(t.length)}`);

// ═══ ① Les clés déclarées deux fois dans le même objet ═══════════════════════
titre('Clés déclarées deux fois');
{
  let n = 0;
  for (const f of fichiers('client/src', /\.tsx?$/)) {
    const lignes = readFileSync(f, 'utf8').split('\n');
    const vues = new Map(), doublons = new Map();
    for (let i = 0; i < lignes.length; i++) {
      /*
       * ON REMET LE COMPTEUR À ZÉRO À CHAQUE NOUVEL OBJET.
       * Suivre les clés par FICHIER signalait `marche-aux-puces` déclaré dans
       * deux tables différentes, ce qui est parfaitement normal. Un détecteur
       * qui crie sur du code correct ne sert qu'à apprendre à l'ignorer.
       */
      if (/^(export\s+)?(const|let|var)\s+[A-Za-z0-9_]+.*=\s*\{\s*$/.test(lignes[i])) { vues.clear(); continue; }
      const m = lignes[i].match(/^\s*(['"])((?:[^'"\\]|\\.){4,})\1\s*:/);
      if (!m) continue;
      const cle = m[2];
      if (vues.has(cle)) {
        if (!doublons.has(cle)) doublons.set(cle, [vues.get(cle)]);
        doublons.get(cle).push(i + 1);
      } else vues.set(cle, i + 1);
    }
    for (const [cle, l] of doublons) {
      n++; defauts++;
      console.log(`  ${f.replace('client/src/', '')}  lignes ${l.join(', ')}\n      « ${cle.slice(0, 80)} »`);
    }
  }
  if (!n) console.log('  aucune : rien n\'est écrasé en silence.');
}

// ═══ ② Les clés de stockage ══════════════════════════════════════════════════
titre('Clés du localStorage');
{
  const emplois = new Map();
  for (const f of [...fichiers('client/src', /\.tsx?$/), ...fichiers('scripts', /\.mjs$/)]) {
    for (const m of readFileSync(f, 'utf8').matchAll(/['"`](roi-du-carton-[a-z0-9-]+)['"`]/g)) {
      if (!emplois.has(m[1])) emplois.set(m[1], new Set());
      emplois.get(m[1]).add(f);
    }
  }
  const cles = [...emplois.keys()].sort();
  console.log(`  ${cles.length} clés`);

  const distance = (a, b) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 0; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };
  let proches = 0;
  for (let i = 0; i < cles.length; i++)
    for (let j = i + 1; j < cles.length; j++)
      if (distance(cles[i], cles[j]) <= 2) { proches++; defauts++; console.log(`  QUASI-JUMELLES : ${cles[i]} / ${cles[j]}`); }
  if (!proches) console.log('  aucune paire à moins de trois caractères l\'une de l\'autre.');

  /*
   * Une clé bien écrite est déclarée une fois dans une constante et employée
   * par elle. C'est la chaîne RECOPIÉE dans plusieurs fichiers qui est
   * dangereuse : elle diverge le jour où l'une des copies est retouchée.
   */
  for (const cle of cles) {
    const dansJeu = [...emplois.get(cle)].filter(f => f.startsWith('client/src'));
    if (dansJeu.length > 1) console.log(`  ÉCRITE EN DUR À ${dansJeu.length} ENDROITS : ${cle}\n      ${dansJeu.map(f => f.replace('client/src/', '')).join('\n      ')}`);
  }
}

// ═══ ③ Les images citées mais absentes ═══════════════════════════════════════
titre('Images citées dans le code');
{
  const refs = new Map();
  for (const f of fichiers('client/src', /\.tsx?$/)) {
    const s = readFileSync(f, 'utf8');
    for (const m of s.matchAll(/['"`](\/assets\/[A-Za-z0-9._-]+\.(?:webp|png|jpg|svg))['"`]/g))
      if (!refs.has(m[1])) refs.set(m[1], { f, src: s });
  }
  const absentes = [...refs].filter(([u]) => !existsSync('client/public' + u));
  console.log(`  ${refs.size} citées, ${absentes.length} absente(s) du disque`);
  for (const [u, { f, src }] of absentes) {
    /*
     * Une image absente n'est un défaut que si elle n'a PAS de repli. Six
     * illustrations n'ont jamais été livrées et pointent chacune vers une
     * image existante : le système fait exactement son travail.
     */
    const g = src.match(new RegExp(`image: '${u.replace(/[/.]/g, m => '\\' + m)}', fallbackImage: '([^']+)'`));
    const repli = g?.[1];
    const couverte = repli && existsSync('client/public' + repli);
    if (!couverte) { defauts++; console.log(`  SANS REPLI : ${u}   (${f.replace('client/src/', '')})`); }
    else console.log(`  sans fichier mais couverte : ${u}\n      repli → ${repli}`);
  }
}

// ═══ ④ Les phrases de métier qui ne s'accordent pas ═════════════════════════
titre('Accord des descriptions de métier');
{
  /*
   * LE NOM DU MÉTIER S'ACCORDE DEPUIS TOUJOURS, LA PHRASE NON.
   *
   * `nameF` existe depuis le début ; `descriptionF` a été ajouté après coup,
   * parce qu'une candidate tirée sur « Ancienne Artiste » se présentait avec
   * « Son art n'a jamais été compris. Même par lui. » — accordée au titre,
   * fausse à la ligne suivante, sur la toute première carte que voit un joueur.
   *
   * Le défaut ne se voit que sur les métiers dont la phrase porte un pronom, et
   * rien n'empêche le prochain d'être écrit de la même façon. On les cherche
   * donc à la source : toute description contenant un pronom masculin DOIT
   * avoir sa variante féminine, et les deux doivent être traduites.
   */
  const monde = readFileSync('client/src/contexts/data/world.ts', 'utf8');
  const en = fichiers('client/src/lib', /^content-en.*\.ts$/).map(f => readFileSync(f, 'utf8')).join('\n');
  const PRONOM = /(^|[^A-Za-zÀ-ÿ])(il|lui|celui)([^A-Za-zÀ-ÿ]|$)/i;
  let n = 0, verifies = 0;
  for (const m of monde.matchAll(/\{ id: '([a-z-]+)',[^\n]*?description: ("[^"]*"|'[^']*')([^\n]*)\}/g)) {
    const [, id, brut, reste] = m;
    const phrase = brut.slice(1, -1);
    if (!PRONOM.test(phrase)) continue;
    verifies++;
    const fem = reste.match(/descriptionF: ("[^"]*"|'[^']*')/);
    if (!fem) {
      n++; defauts++;
      console.log(`  SANS FÉMININ : ${id}\n      « ${phrase} »`);
      continue;
    }
    // Traduite ? La clé anglaise EST la chaîne française.
    const cle = fem[1].slice(1, -1).replace(/\\'/g, "'");
    if (!en.includes(cle.replace(/'/g, "\\'")) && !en.includes(cle)) {
      n++; defauts++;
      console.log(`  FÉMININ NON TRADUIT : ${id}\n      « ${cle} »`);
    }
  }
  if (!n) console.log(`  aucun : ${verifies} phrase(s) à pronom, toutes accordées et traduites.`);
}

console.log(defauts ? `\n${defauts} défaut(s) à traiter.` : '\nRien à signaler.');
process.exit(defauts ? 1 : 0);
