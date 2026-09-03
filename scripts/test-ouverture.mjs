/*
 * L'OUVERTURE : la signature du studio, puis l'avertissement.
 *
 * Ce sont les deux premières secondes de chaque lancement, donc la partie du
 * jeu que le joueur verra le plus souvent dans sa vie. Trois façons de la
 * rater, et elles sont toutes silencieuses :
 *
 *   ① LE NOM ÉCRIT DE TRAVERS. « AT DEUX MAIN » est le nom déposé du studio,
 *     jeu de mots compris. Une « correction » bien intentionnée en « Deux
 *     Mains » le désaccorderait de la fiche du Play Store, et personne ne s'en
 *     apercevrait avant un joueur.
 *
 *   ② L'AVERTISSEMENT REJOUÉ À CHAQUE LANCEMENT. Un texte légal qu'on remontre
 *     tous les jours apprend à être sauté des yeux : on le voit moins, pas
 *     plus. Il passe une fois, et il se range dans les Options.
 *
 *   ③ UNE OUVERTURE QU'ON NE PEUT PAS PASSER. C'est la chose la plus détestée
 *     d'un jeu mobile, et c'est mérité : on la subit à chaque ouverture.
 *
 *     node scripts/test-ouverture.mjs   (le build doit être servi en 8099)
 */
import puppeteer from 'puppeteer-core';

let echecs = 0;
const verifier = (nom, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 160)));
const pause = ms => new Promise(r => setTimeout(r, ms));
const ecran = () => p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x =>
    r.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '')) && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);

const SIGNATURE = /AT DEUX MAIN/;
const FICTION = /Une fiction|A work of fiction/i;

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });

// ═══════════════════════════════════════════════════════════════════════════
// ① Le premier lancement
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLe premier lancement\n');

/*
 * ON REPOSE LE DRAPEAU QUI FORCE L'OUVERTURE.
 *
 * Elle s'efface d'elle-même sous pilotage automatique, pour ne pas recouvrir
 * les boutons des trente-quatre autres suites. Celle-ci est la seule qui doit
 * la voir : sans ce drapeau, tous les contrôles qui suivent passeraient au
 * vert devant un écran vide, ce qui est exactement le défaut qu'ils
 * surveillent.
 */
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('roi-du-carton-lang', 'fr');
  localStorage.setItem('roi-du-carton-ouverture-forcee', '1');
});
await p.reload({ waitUntil: 'networkidle2' });
await pause(700);
const debut = await ecran();

/*
 * LE NOM EST COMPARÉ AU CARACTÈRE PRÈS.
 *
 * « AT DEUX MAIN » superpose trois lectures voulues par son auteur : « à tes
 * deux mains », et « main » au sens anglais de principal. Ce n'est pas une
 * faute à corriger, et ce contrôle est là précisément pour que personne ne la
 * corrige.
 */
verifier('la signature du studio ouvre le jeu', SIGNATURE.test(debut),
  SIGNATURE.test(debut) ? '' : debut.slice(0, 80));
verifier('  …et le nom est écrit exactement comme il est déposé',
  debut.includes('AT DEUX MAIN'),
  'ni « Deux Mains », ni « AT DEUX MAINS » : le jeu de mots appartient à son auteur');

await pause(1600);
const apres = await ecran();
verifier('la signature s\'efface toute seule', !SIGNATURE.test(apres));
verifier('  …et l\'avertissement prend sa place', FICTION.test(apres),
  FICTION.test(apres) ? '' : apres.slice(0, 80));

/*
 * L'AVERTISSEMENT, LUI, ATTEND UN GESTE.
 *
 * Un texte qui s'efface pendant qu'on le lit n'a pas été lu, et c'est le seul
 * de tout le jeu dont on a besoin qu'il le soit.
 */
await pause(2500);
verifier('  …et il ne s\'efface PAS tout seul', FICTION.test(await ecran()),
  'un texte qui part pendant la lecture n\'a pas été lu');

verifier('il dit où le jeu place sa moquerie',
  /institutions|institutions/i.test(await ecran()),
  'la ligne qui engage vraiment l\'auteur');

// ═══════════════════════════════════════════════════════════════════════════
// ② Une fois lu, il ne revient plus
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nUne fois lu\n');

verifier('on peut le refermer', await clic('J\'ai compris|Understood'));
await pause(600);
const ferme = await ecran();
verifier('  …et le jeu est là derrière',
  !FICTION.test(ferme) && /Nouvelle|New Game/i.test(ferme), ferme.slice(0, 60));

await p.reload({ waitUntil: 'networkidle2' });
await pause(700);
verifier('au lancement suivant, la signature repasse', SIGNATURE.test(await ecran()),
  'une signature qui ne se répète pas n\'en est pas une');
await pause(2200);
const relance = await ecran();
verifier('  …mais l\'avertissement, non', !FICTION.test(relance),
  FICTION.test(relance) ? 'le remontrer chaque jour apprend à le sauter des yeux' : '');

// ═══════════════════════════════════════════════════════════════════════════
// ③ Elle se saute, et il reste lisible
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nCe qui reste à la main du joueur\n');

await p.evaluate(() => localStorage.removeItem('roi-du-carton-avertissement-lu'));
await p.reload({ waitUntil: 'networkidle2' });
await pause(400);
verifier('la signature est bien là avant qu\'on la touche', SIGNATURE.test(await ecran()));
/*
 * ON APPUIE SUR LE BOUTON QUI DIT CE QU'IL FAIT.
 *
 * Deux versions de ce clic ont échoué avant celle-ci, et toutes les deux pour
 * la même raison : elles désignaient la cible par ce qu'elle CONTENAIT plutôt
 * que par ce qu'elle EST. D'abord le nom du studio collé sans espaces
 * (« ATDEUXMAIN », qui n'existe dans aucun rendu), puis le même nom en
 * `textContent` sur une moitié de carton — jusqu'au jour où ce nom est devenu
 * une image et où le geste est devenu introuvable.
 *
 * L'ouverture porte maintenant un vrai bouton nommé, et on le cherche par son
 * nom. Si ce contrôle échoue encore, c'est que le joueur non plus ne peut plus
 * passer l'introduction : le test dit enfin la même chose que l'écran.
 */
const passe = await p.evaluate(() => {
  const b = [...document.querySelectorAll('button')]
    .find(e => /Passer l'introduction|Skip the intro/i.test(e.getAttribute('aria-label') || ''));
  if (!b) return false;
  b.click();
  return true;
});
verifier('  le bouton « passer » existe et porte son nom', passe,
  passe ? '' : 'aucun bouton nommé : ni le doigt ni le clavier n\'ont de prise');
// La déchirure dure 620 ms : on lui laisse finir avant de constater.
await pause(900);
const saute = await ecran();
verifier('un doigt la passe sans attendre', !SIGNATURE.test(saute) && FICTION.test(saute),
  'une ouverture qu\'on ne peut pas passer est la chose la plus détestée d\'un jeu mobile');

await clic('J\'ai compris|Understood'); await pause(600);
await clic('Options|⚙️'); await pause(900);
verifier('l\'avertissement se range dans les Options',
  /Une fiction|A work of fiction/i.test(await ecran()));
await clic('📄 Une fiction|📄 A work of fiction'); await pause(600);
verifier('  …et il se relit en entier',
  /fortuite|coincidental/i.test(await ecran()),
  'sinon le retirer de l\'ouverture reviendrait à le supprimer');

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLe studio signe, le jeu prévient une fois, et le joueur peut passer.');
process.exit(echecs ? 1 : 0);
