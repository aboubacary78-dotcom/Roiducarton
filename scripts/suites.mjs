/*
 * LES SUITES, D'AFFILÉE, AVEC LEURS TRACES.
 *
 * Trois suites échouent de temps en temps, une fois sur cinq environ, sans
 * qu'on sache pourquoi : `test-premier-jour`, `test-points-entree`,
 * `test-nuit`. Chaque tentative de diagnostic a buté sur le même mur, et il
 * n'était pas technique : on relançait le test pour voir l'échec de plus près,
 * la relance passait au vert, et la preuve était perdue. Treize passages
 * consécutifs propres après un échec ne disent rien de l'échec.
 *
 * Ce lanceur ne corrige aucun défaut. Il fait la seule chose utile tant qu'on
 * n'a pas vu le défaut : GARDER LA SORTIE DE CHAQUE PASSAGE, dans
 * `journal-tests/`, y compris et surtout celle qui échoue. Le prochain
 * intermittent laissera une trace lisible au lieu d'un souvenir.
 *
 *   pnpm build && (cd dist/public && python3 -m http.server 8099)
 *   pnpm suites                 toutes
 *   pnpm suites boutique        celles dont le nom contient « boutique »
 *   REPETER=5 pnpm suites premier-jour     cinq fois de suite
 *
 * Le code de sortie vaut 1 dès qu'une suite échoue une fois, ce qui rend le
 * lanceur utilisable tel quel dans une intégration continue.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const JOURNAL = join(process.cwd(), 'journal-tests');
mkdirSync(JOURNAL, { recursive: true });

const filtre = process.argv[2] ?? '';
const repeter = Math.max(1, Number(process.env.REPETER || 1));

const suites = readdirSync(join(process.cwd(), 'scripts'))
  .filter(f => /^test-.*\.mjs$/.test(f))
  .map(f => f.replace(/\.mjs$/, ''))
  .filter(n => !filtre || n.includes(filtre))
  .sort();

if (suites.length === 0) {
  console.error(`Aucune suite ne correspond à « ${filtre} ».`);
  process.exit(2);
}

/** Lance une suite et rend son code de sortie, sa durée et sa sortie complète. */
function lancer(nom) {
  return new Promise(resolve => {
    const debut = Date.now();
    const p = spawn(process.execPath, [join('scripts', `${nom}.mjs`)], {
      cwd: process.cwd(), env: process.env,
    });
    let sortie = '';
    p.stdout.on('data', d => { sortie += d; });
    p.stderr.on('data', d => { sortie += d; });
    p.on('close', code => resolve({ code, ms: Date.now() - debut, sortie }));
    p.on('error', e => resolve({ code: -1, ms: Date.now() - debut, sortie: String(e) }));
  });
}

const bilan = [];
console.log(`${suites.length} suite(s)${repeter > 1 ? `, ${repeter} passages chacune` : ''}\n`);

for (const nom of suites) {
  for (let tour = 1; tour <= repeter; tour++) {
    const r = await lancer(nom);
    const etiquette = repeter > 1 ? `${nom} #${tour}` : nom;
    /*
     * ON ÉCRIT LA SORTIE DANS TOUS LES CAS, PAS SEULEMENT EN CAS D'ÉCHEC.
     *
     * Un intermittent se comprend en comparant un passage vert et un passage
     * rouge du même test : ne garder que le rouge, c'est se priver de la
     * moitié de la comparaison, et c'est exactement ce qui manquait.
     */
    const fichier = join(JOURNAL, `${nom}${repeter > 1 ? `-${tour}` : ''}.log`);
    writeFileSync(fichier, r.sortie);
    const rates = (r.sortie.match(/^ RATÉ/gm) || []).length;
    bilan.push({ nom: etiquette, code: r.code, rates, ms: r.ms, fichier });
    const s = (r.ms / 1000).toFixed(0).padStart(3);
    console.log(r.code === 0
      ? `  ok   ${etiquette.padEnd(30)} ${s} s`
      : ` RATÉ  ${etiquette.padEnd(30)} ${s} s · ${rates || '?'} contrôle(s) · ${fichier}`);
  }
}

const rouges = bilan.filter(b => b.code !== 0);
console.log(`\n${bilan.length - rouges.length}/${bilan.length} au vert.`);
if (rouges.length) {
  console.log('\nCe qui a lâché, et où lire :');
  for (const r of rouges) console.log(`  ${r.nom} · ${r.fichier}`);
}
process.exit(rouges.length ? 1 : 0);
