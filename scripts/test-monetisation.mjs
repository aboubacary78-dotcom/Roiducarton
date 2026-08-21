/*
 * LES RÈGLES DE MONÉTISATION, ÉPROUVÉES SANS RÉSEAU PUBLICITAIRE.
 *
 * Deux choses se vérifient ici, et ce sont les deux seules du plan qui
 * décident quelque chose toutes seules :
 *
 *   · `verdictInterstitiel()` — qui a le droit de prendre un plein écran, et
 *     surtout qui ne l'a pas : le nouveau venu, celui qui vient de mourir pour
 *     la première fois de la session, et celui qui en a déjà eu un il y a
 *     moins de quatre-vingt-dix secondes. Ces trois refus protègent la
 *     rétention à sept jours, c'est-à-dire le revenu ; un test qui les laisse
 *     filer coûte de l'argent, pas de la vertu.
 *
 *   · `RECOVER_NIGHT` — l'offre du bilan de nuit. Elle rend la moitié de ce
 *     que la nuit a pris. La moitié, pas plus, jamais au-delà de cent, et une
 *     seule fois. Une pub qui rend trop casse l'équilibre du jeu ; une pub
 *     qu'on peut regarder deux fois n'est plus une limite.
 *
 * Le prédicat a été écrit sans effet de bord exprès : il s'interroge, il ne
 * déclenche rien. C'est ce qui rend ce fichier possible.
 */
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'monet-'));
const shim = join(dir, 'cap.js');
writeFileSync(shim, 'export const Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };\nexport const registerPlugin = () => ({});\n');
const entry = join(dir, 'entry.ts');
writeFileSync(entry, [
  "export { gameReducer, CONTRACTS, getContract, paquetDuPremierMatin } from '@/contexts/GameContext';",
  "export { verdictInterstitiel, reinitialiserInterstitiel, partieTerminee, showInterstitial, setAdsRemoved } from '@/lib/ads';",
].join('\n'));

const out = join(process.cwd(), '.bundle-test-monetisation.mjs');
const memoire = new Map();
globalThis.localStorage = {
  getItem: k => (memoire.has(k) ? memoire.get(k) : null),
  setItem: (k, v) => memoire.set(k, String(v)),
  removeItem: k => memoire.delete(k),
  clear: () => memoire.clear(),
};
globalThis.window = { localStorage: globalThis.localStorage, addEventListener() {}, dispatchEvent() {} };
globalThis.document = { documentElement: { lang: 'fr' } };
Object.defineProperty(globalThis.navigator, 'language', { value: 'fr-FR', configurable: true });

await build({
  entryPoints: [entry], bundle: true, format: 'esm', outfile: out,
  platform: 'neutral', target: 'es2022', logLevel: 'error',
  alias: { '@': join(process.cwd(), 'client/src'), '@capacitor/core': shim },
  external: ['react', 'react-dom', 'framer-motion', 'wouter', '@capacitor/*'],
});

const {
  gameReducer, CONTRACTS, getContract, paquetDuPremierMatin, verdictInterstitiel, reinitialiserInterstitiel,
  partieTerminee, showInterstitial, setAdsRemoved,
} = await import(out);

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. L'interstitiel
// ═══════════════════════════════════════════════════════════════════════════
console.log("\nL'interstitiel — trois refus, dans l'ordre\n");

const CLE_PARTIES = 'roi-du-carton-parties-finies';
const parties = (n) => memoire.set(CLE_PARTIES, String(n));

memoire.clear();
reinitialiserInterstitiel();

let v = verdictInterstitiel();
verifier('un joueur qui découvre le jeu ne prend rien', !v.montrer && /grâce/.test(v.raison), v.raison);

/*
 * Le compteur de parties survit aux sessions : il est en stockage local. On
 * l'incrémente par la porte officielle, celle que l'écran de mort appelle.
 */
for (let i = 0; i < 4; i++) partieTerminee();
verifier('quatre parties terminées sortent de la période de grâce',
  Number(memoire.get(CLE_PARTIES)) === 4);

v = verdictInterstitiel();
verifier('la première mort de la session reste offerte',
  !v.montrer && /première mort/.test(v.raison), v.raison);

/*
 * `showInterstitial` fait tomber le drapeau de première mort même quand rien
 * ne part — sinon un joueur en période de grâce garderait son laissez-passer
 * pour toujours. Sur le web aucune publicité n'existe : c'est exactement ce
 * qu'on veut éprouver ici, l'effet de bord seul.
 */
await showInterstitial();

v = verdictInterstitiel(1_000);
verifier('une seconde mort trop rapprochée est refusée',
  !v.montrer && /trop tôt/.test(v.raison), v.raison);

v = verdictInterstitiel(89_999);
verifier('à 89,999 s le plancher tient encore', !v.montrer && /trop tôt/.test(v.raison), v.raison);

v = verdictInterstitiel(90_000);
verifier('à 90,000 s la publicité peut partir', v.montrer, v.raison);

setAdsRemoved(true);
v = verdictInterstitiel(90_000);
verifier('« sans publicité » acheté coupe tout', !v.montrer && /sans-pub/.test(v.raison), v.raison);
setAdsRemoved(false);

reinitialiserInterstitiel();
v = verdictInterstitiel(90_000);
verifier('un nouveau lancement rend sa mort offerte au joueur',
  !v.montrer && /première mort/.test(v.raison), v.raison);

// ═══════════════════════════════════════════════════════════════════════════
// 2. « Dormir une heure de plus »
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLe bilan de nuit — la moitié rendue, et rien de plus\n');

const JAUGES = { health: 60, mental: 60, hunger: 6, thirst: 4, sleep: 10, dignity: 50 };
const etat = (stats, deltas, recovered) => ({
  character: { stats: { ...JAUGES, ...stats } },
  daySummary: { day: 4, weather: 'rainy', deltas, moneyChange: 0, notes: [], notesEn: [], recovered },
});

let apres = gameReducer(etat({}, { sleep: -15, hunger: -18, thirst: -22, dignity: -4 }), { type: 'RECOVER_NIGHT' });
verifier('la moitié du sommeil perdu revient, arrondie au supérieur',
  apres.character.stats.sleep === 18, `10 → ${apres.character.stats.sleep} (attendu 18)`);
verifier('la faim aussi', apres.character.stats.hunger === 15, `6 → ${apres.character.stats.hunger}`);
verifier('la soif aussi', apres.character.stats.thirst === 15, `4 → ${apres.character.stats.thirst}`);
verifier('la dignité aussi', apres.character.stats.dignity === 52, `50 → ${apres.character.stats.dignity}`);
/*
 * On compare sans tenir compte de l'ordre des clés : il suit l'ordre du bilan,
 * pas celui des jauges, et ce détail n'engage rien — l'affichage lit ce qu'on
 * lui donne.
 */
const memeContenu = (a, b) => {
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  return ka.join() === kb.join() && ka.every(k => a[k] === b[k]);
};
verifier('la moitié rendue est consignée pour l’affichage',
  memeContenu(apres.daySummary.recovered, { hunger: 9, thirst: 11, sleep: 8, dignity: 2 }),
  JSON.stringify(apres.daySummary.recovered));

const deuxieme = gameReducer(apres, { type: 'RECOVER_NIGHT' });
verifier('une seconde vidéo ne rend rien de plus', deuxieme === apres);

apres = gameReducer(etat({ mental: 40 }, { mental: 10, sleep: -6 }), { type: 'RECOVER_NIGHT' });
verifier('ce que la nuit a DONNÉ n’est pas redonné une fois de plus',
  apres.character.stats.mental === 40, `${apres.character.stats.mental} (attendu 40)`);
verifier('seule la perte est rendue', apres.character.stats.sleep === 13, `10 → ${apres.character.stats.sleep}`);

apres = gameReducer(etat({ health: 98 }, { health: -10 }), { type: 'RECOVER_NIGHT' });
verifier('aucune jauge ne dépasse cent', apres.character.stats.health === 100, `${apres.character.stats.health}`);

const rienARendre = etat({ health: 100 }, { health: -10 });
verifier('une nuit sans rien à rendre ne consomme pas l’offre',
  gameReducer(rienARendre, { type: 'RECOVER_NIGHT' }) === rienARendre);

const sansBilan = { character: { stats: { ...JAUGES } }, daySummary: null };
verifier('sans bilan, l’action ne fait rien',
  gameReducer(sansBilan, { type: 'RECOVER_NIGHT' }) === sansBilan);

// ═══════════════════════════════════════════════════════════════════════════
// 3. Le contrat raté de peu
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLe contrat — la récompense du contrat, et pas un centime de plus\n');

/*
 * Le « presque » se mesure : sans `progress`, un contrat ne peut pas être raté
 * de peu, il est raté tout court. « Gagner un combat » est le seul de ce
 * genre-là, et il n'en a donc pas.
 */
const sansProgres = CONTRACTS.filter(c => !c.progress).map(c => c.id);
verifier('les contrats à seuil savent dire à quelle distance on s’est arrêté',
  sansProgres.length === 1 && sansProgres[0] === 'contrat-combatif', sansProgres.join(', ') || 'aucun');

const bilanContrat = (id, valeur, cible, rattrape) => ({
  character: { stats: { ...JAUGES }, money: 10, respect: 0, inventory: [] },
  daySummary: {
    day: 4, weather: 'rainy', deltas: {}, moneyChange: 0, notes: [], notesEn: [],
    contratRate: { id, valeur, cible }, contratRattrape: rattrape,
  },
});

let av = bilanContrat('contrat-pecule', 10, 12);
let ap = gameReducer(av, { type: 'RATTRAPER_CONTRAT' });
verifier('le contrat rattrapé paie son respect', ap.character.respect === 2, `${ap.character.respect}`);
verifier('et rien d’autre', ap.character.money === 10, `${ap.character.money} €`);
verifier('une seconde vidéo ne le repaie pas',
  gameReducer(ap, { type: 'RATTRAPER_CONTRAT' }) === ap);

ap = gameReducer(bilanContrat('contrat-fourmi', 4, 5), { type: 'RATTRAPER_CONTRAT' });
verifier('un contrat qui paie en argent paie en argent', ap.character.money === 13, `${ap.character.money} €`);

ap = gameReducer(bilanContrat('contrat-forme', 28, 31), { type: 'RATTRAPER_CONTRAT' });
verifier('un contrat qui paie en mental paie en mental',
  ap.character.stats.mental === JAUGES.mental + 6, `${ap.character.stats.mental}`);

const inconnu = bilanContrat('contrat-qui-n-existe-pas', 1, 2);
verifier('un contrat inconnu ne paie rien',
  gameReducer(inconnu, { type: 'RATTRAPER_CONTRAT' }) === inconnu);

verifier('la récompense annoncée est celle du contrat',
  getContract('contrat-pecule').reward.respect === 2);

/*
 * Le premier matin d'une première partie n'a pas encore de bouton « Bagarre » —
 * il revient après la première action. Un contrat qui demanderait un combat à
 * cet instant tomberait une fois sur cinq, et donnerait un objectif sans en
 * donner le moyen.
 */
const premierMatin = paquetDuPremierMatin(true).map(c => c.id);
verifier('le premier matin ne tire jamais un contrat de combat',
  !premierMatin.includes('contrat-combatif'), premierMatin.join(', '));
verifier('il reste de quoi tirer', premierMatin.length === CONTRACTS.length - 1,
  `${premierMatin.length} sur ${CONTRACTS.length}`);
verifier('les parties suivantes gardent le paquet entier',
  paquetDuPremierMatin(false).length === CONTRACTS.length);

// ═══════════════════════════════════════════════════════════════════════════
// 4. L'objet que le sac a refusé
// ═══════════════════════════════════════════════════════════════════════════
console.log('\nLe sac plein — l’objet nommé, et lui seul\n');

const chaise = { id: 'chaise', name: 'Chaise', emoji: '🪑', type: 'junk', value: 3 };
const avecRefus = (refusedItem, itemKept) => ({
  character: { stats: { ...JAUGES }, money: 0, respect: 0, inventory: [{ id: 'x' }] },
  eventResult: { text: 'vol', refusedItem, itemKept },
});

let sac = gameReducer(avecRefus(chaise), { type: 'GARDER_OBJET' });
verifier('l’objet laissé sur place rentre dans le sac',
  sac.character.inventory.length === 2 && sac.character.inventory[1].id === 'chaise');
verifier('l’offre est marquée consommée', sac.eventResult.itemKept === true);
verifier('une seconde vidéo ne le donne pas deux fois',
  gameReducer(sac, { type: 'GARDER_OBJET' }) === sac);

const sansRefus = avecRefus(undefined);
verifier('sans objet refusé, l’action ne fait rien',
  gameReducer(sansRefus, { type: 'GARDER_OBJET' }) === sansRefus);

console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLes règles tiennent : rien ne se donne deux fois, et rien ne paie plus que le jeu.');
process.exit(echecs ? 1 : 0);
