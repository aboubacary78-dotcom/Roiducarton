/*
 * DEUX VIES, DEUX TÊTES.
 *
 * La tenue était rangée dans le profil permanent, à côté des accessoires
 * débloqués. Les deux y avaient l'air à leur place, et pourtant l'un des deux
 * n'y était pas : le nouveau venu héritait du chapeau et de l'écharpe du mort,
 * et deux vies successives se ressemblaient trait pour trait. « Ça ne le rend
 * pas unique. »
 *
 * La séparation à tenir est celle-ci, et c'est tout ce que ce test vérifie :
 *
 *   · CE QUI EST DÉBLOQUÉ survit à la mort. Ça se gagne aux succès, et des
 *     succès qu'il faut regagner à chaque partie ne récompensent rien.
 *   · CE QUI EST PORTÉ meurt avec celui qui le portait. On s'habille soi-même,
 *     avec ce qu'on a gagné.
 *
 * Le piège, en écrivant ce test : vérifier que le nouveau personnage arrive nu
 * ne prouve rien si on ne vérifie pas d'abord qu'il POUVAIT être habillé —
 * une garde-robe vide passerait le contrôle sans rien garantir.
 *
 *     node scripts/test-garde-robe.mjs
 */
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 140)));

const pause = ms => new Promise(r => setTimeout(r, ms));
let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);
const perso = () => p.evaluate(() => {
  const s = localStorage.getItem('roi-du-carton-save');
  return s ? JSON.parse(s).character : null;
});
const profil = () => p.evaluate(() => {
  const s = localStorage.getItem('roi-du-carton-profile');
  return s ? JSON.parse(s) : null;
});

/** Crée un personnage et rend la main sur le hub. */
async function nouvellePartie() {
  await clic('Nouvelle|New Game'); await pause(900);
  await p.evaluate(() => {
    const c = [...document.querySelectorAll('[class*="cursor-pointer"]')]
      .find(e => /Ancien|Former|Ex-/i.test(e.textContent || ''))
      ?? document.querySelector('[class*="cursor-pointer"]');
    c?.click();
  });
  await pause(1400);
  await clic('Commencer|Start'); await pause(900);
  for (const m of ['Regarder|Take a look', 'Merci|Thanks', 'compris|Got it']) {
    if (await clic(m)) await pause(400);
  }
}

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(600);
await nouvellePartie();

const premier = await perso();
verifier('un premier personnage existe', !!premier, premier?.name || '');
verifier('  …et il arrive sans rien sur le dos',
  !premier?.equipped || Object.keys(premier.equipped).length === 0,
  JSON.stringify(premier?.equipped ?? {}));

/*
 * ON DÉBLOQUE TOUT, PUIS ON S'HABILLE.
 *
 * Les accessoires se gagnent aux succès — les obtenir en jouant demanderait
 * des dizaines de parties. On écrit donc directement dans le profil, ce qui
 * est exactement le rôle qu'il garde : dire ce qui est ACQUIS.
 */
// Les identifiants sont lus À LA SOURCE : les réécrire ici, c'est se donner
// rendez-vous avec un test qui passe au vert sur des accessoires inexistants.
const { readFileSync } = await import('node:fs');
const IDS = [...readFileSync('client/src/lib/cosmetics.ts', 'utf8')
  .matchAll(/\{ id: '([a-z0-9-]+)', name:/g)].map(m => m[1]).slice(0, 8);
if (IDS.length < 4) throw new Error('aucun accessoire lu dans cosmetics.ts');

await p.evaluate((ids) => {
  const prof = JSON.parse(localStorage.getItem('roi-du-carton-profile') || '{}');
  prof.unlocked = ids;
  localStorage.setItem('roi-du-carton-profile', JSON.stringify(prof));
}, IDS);
await p.reload({ waitUntil: 'networkidle2' }); await pause(1000);
await clic('Reprendre|Continue'); await pause(1200);
for (const m of ['compris|Got it', 'Regarder|Take a look', 'Merci|Thanks']) {
  if (await clic(m)) await pause(350);
}

/*
 * La garde-robe s'ouvre en touchant son propre visage. On vise le bouton par
 * son libellé d'accessibilité plutôt que par sa position : c'est le seul
 * repère qui ne bouge pas quand la mise en page change.
 */
await p.evaluate(() => {
  document.querySelector('button[aria-label="Personnaliser mon personnage"]')?.click();
});
await pause(1200);

const dansLaGardeRobe = await p.evaluate(() =>
  /garde-robe|wardrobe|accessoire/i.test(document.body.innerText));
verifier('la garde-robe s\'ouvre', dansLaGardeRobe);

/*
 * On enfile un accessoire DÉBLOQUÉ.
 *
 * La liste montre tout le catalogue, verrouillé compris : cliquer au hasard
 * tombait sur un accessoire non gagné, que le reducer refuse — à juste titre —
 * et le test concluait que s'habiller ne marchait pas. On cible donc l'un des
 * huit qu'on vient de débloquer, par son emoji.
 */
const habille = await p.evaluate(() => {
  // Un accessoire gagné et non porté dit « Toucher » ; verrouillé, il est
  // `disabled` et affiche 🔒. C'est le seul repère qui distingue une case
  // d'accessoire d'une flèche de retour, et il vient de l'interface elle-même.
  const cases = [...document.querySelectorAll('button')]
    .filter(x => x.offsetWidth && !x.disabled && /Toucher|Tap/.test(x.textContent || ''));
  cases[0]?.click();
  return { total: cases.length, libelle: (cases[0]?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30) };
});
await pause(900);

const apresHabillage = await perso();
const porte = Object.keys(apresHabillage?.equipped ?? {}).length;
verifier('  …on peut s\'habiller, et ça se range sur LE PERSONNAGE',
  porte > 0, `${porte} porté(s) · « ${habille.libelle} » parmi ${habille.total} portables`);

const profilApres = await profil();
verifier('  …et le profil, lui, n\'enregistre plus de tenue',
  !profilApres?.equipped || Object.keys(profilApres.equipped).length === 0,
  JSON.stringify(profilApres?.equipped ?? {}));

/*
 * LA MORT, PUIS LA VIE SUIVANTE.
 *
 * On efface la sauvegarde plutôt que de mourir pour de bon : c'est le même
 * état d'arrivée — plus de personnage, profil intact — et ça évite de faire
 * dépendre ce test-ci du déroulé d'une mort, qui a ses propres écrans.
 */
await p.evaluate(() => { localStorage.removeItem('roi-du-carton-save'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(1000);
await nouvellePartie();

const second = await perso();
verifier('un second personnage naît', !!second && second.seed !== premier.seed,
  `${premier?.name} → ${second?.name}`);
verifier('  …ET IL ARRIVE NU : il ne porte pas la tenue du précédent',
  Object.keys(second?.equipped ?? {}).length === 0,
  JSON.stringify(second?.equipped ?? {}));

const profilFinal = await profil();
verifier('  …tandis que les accessoires GAGNÉS lui restent acquis',
  (profilFinal?.unlocked ?? []).length >= IDS.length,
  `${(profilFinal?.unlocked ?? []).length} débloqué(s)`);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nCe qu\'on gagne reste, ce qu\'on porte s\'en va avec soi.');
process.exit(echecs ? 1 : 0);
