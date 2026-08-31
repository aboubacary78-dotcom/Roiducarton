/*
 * LA CAISSE EST-ELLE VRAIMENT FERMÉE ?
 *
 * Pendant toute la construction du jeu, « Acheter » voulait dire
 * `setAdsRemoved(true); return true`, les trois produits s'ouvraient
 * gratuitement à qui appuyait sur le bouton. C'était assumé tant qu'aucun
 * magasin n'existait. Ça ne l'est plus.
 *
 * Ce défaut-là a une propriété désagréable : il ne se voit pas. L'écran est
 * identique, le bouton répond, le produit s'ouvre, tout marche, simplement
 * personne ne paie. Aucune erreur, aucun avertissement, rien à lire dans un
 * journal. On ne s'en apercevrait qu'au relevé de compte.
 *
 * D'où quatre contrôles, dont trois portent sur le PAQUET LIVRÉ et non sur le
 * code source : c'est le paquet qui part sur les téléphones.
 *
 *   ① LE CHEMIN GRATUIT A DISPARU DU BUILD. La porte de développement est
 *     gardée par `import.meta.env.DEV`, que Vite remplace par `false` à la
 *     compilation. Si la garde saute, ou si quelqu'un la remplace un jour par
 *     un booléen ordinaire, la chaîne réapparaît dans le paquet.
 *
 *   ② ET ELLE NE MARCHE PAS. Contrôle de comportement, pas de texte : on
 *     ouvre le vrai jeu construit, on appuie sur les trois boutons d'achat, et
 *     on vérifie que RIEN ne s'est ouvert.
 *
 *   ③ LES IDENTIFIANTS DE PRODUITS SONT LES BONS. Une faute de frappe dans
 *     « pack_complet » ne casse rien : le magasin répond « produit inconnu »,
 *     le bouton échoue poliment, et on cherche pendant des heures. On compare
 *     donc le code au tarif écrit dans docs/design/prix.md.
 *
 *   ④ LE SOCLE ANDROID SUIT. La Billing Library 9 exige minSdkVersion 23 ;
 *     laissé à 22, le projet ne compile plus, mais seulement sur la machine
 *     de quelqu'un qui a Android Studio, c'est-à-dire tard.
 *
 *     node scripts/test-facturation.mjs
 */
import puppeteer from 'puppeteer-core';
import { readFileSync, readdirSync } from 'node:fs';

let echecs = 0;
const verifier = (nom, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

// ── ① Le chemin gratuit n'est pas dans le paquet livré ────────────────────
const dossier = 'dist/public/assets';
const paquets = readdirSync(dossier).filter(f => f.endsWith('.js'));
const tout = paquets.map(f => readFileSync(`${dossier}/${f}`, 'utf8')).join('\n');
verifier(`${paquets.length} paquet(s) JavaScript lus`, tout.length > 100_000, `${Math.round(tout.length / 1024)} ko`);
verifier('le raccourci de développement a disparu du build',
  !tout.includes('achat simulé'),
  tout.includes('achat simulé') ? 'la garde import.meta.env.DEV ne tient plus' : '');

/*
 * Et le greffon de facturation, lui, doit BIEN y être : un paquet d'où il
 * aurait disparu donnerait exactement le même écran, avec des boutons qui
 * n'ouvrent jamais rien. Les deux défauts sont symétriques et se ressemblent.
 */
verifier('la couche de facturation est bien dans le paquet',
  tout.includes('pack_complet') && tout.includes('facturation'),
  tout.includes('pack_complet') ? '' : 'les identifiants de produits sont absents');

// ── ③ Les identifiants collent au tarif écrit ─────────────────────────────
const source = readFileSync('client/src/lib/facturation.ts', 'utf8');
const declares = (source.match(/export const PRODUITS: Produit\[\] = \[([^\]]+)\]/) ?? ['', ''])[1]
  .match(/'([a-z_]+)'/g)?.map(s => s.replace(/'/g, '')) ?? [];
const tarif = readFileSync('docs/design/prix.md', 'utf8');
const attendus = [...tarif.matchAll(/\|\s*`([a-z_]+)`\s*\|/g)].map(m => m[1]);
verifier('les identifiants du code sont ceux du tarif',
  declares.length === 3 && attendus.length === 3 && declares.every(d => attendus.includes(d)),
  `code : ${declares.join(', ')} · tarif : ${attendus.join(', ')}`);

/*
 * Les prix de secours aussi : ils s'affichent tant que le magasin n'a pas
 * répondu, et sur toute la première seconde de l'écran. Un écart avec le
 * tarif ferait mentir la boutique pendant une seconde à chaque ouverture.
 */
const secours = [...source.matchAll(/(noads|atelier|pack_complet): '([^']+)'/g)].map(m => `${m[1]}=${m[2]}`);
const prixTarif = [...tarif.matchAll(/\|\s*`([a-z_]+)`\s*\|\s*\*\*([^*]+)\*\*/g)].map(m => `${m[1]}=${m[2].trim()}`);
verifier('  …et les prix de secours aussi',
  secours.length === 3 && secours.every(s => prixTarif.includes(s)),
  `code : ${secours.join(' ')} · tarif : ${prixTarif.join(' ')}`);

// ── ④ Le socle Android suit la Billing Library ────────────────────────────
const gradle = readFileSync('android/variables.gradle', 'utf8');
const minSdk = Number((gradle.match(/minSdkVersion\s*=\s*(\d+)/) ?? [])[1] ?? 0);
verifier('minSdkVersion ≥ 23, comme l\'exige la Billing Library 9', minSdk >= 23, `minSdk ${minSdk}`);
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
verifier('le greffon de facturation est déclaré',
  !!pkg.dependencies['cordova-plugin-purchase'], pkg.dependencies['cordova-plugin-purchase'] ?? 'absent');

// ── ② Le contrôle qui compte : on appuie, et rien ne s'ouvre ──────────────
const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 160)));
const pause = ms => new Promise(r => setTimeout(r, ms));
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(800);

/*
 * ON PASSE PAR LES OPTIONS DU TITRE, PUIS PAR LA PORTE DU MARCHÉ NOIR.
 *
 * L'écran des Options ne vend plus rien depuis que la boutique a le sien : le
 * test cliquait sur des boutons qui n'existaient plus et se contentait de ne
 * rien trouver, c'est-à-dire qu'il passait au vert pour la mauvaise raison.
 * D'où le contrôle explicite, deux lignes plus bas, que les trois boutons
 * d'achat sont bien LÀ avant de vérifier qu'ils n'ouvrent rien.
 *
 * Le chemin par le titre n'exige aucune partie en cours : rien de ce qui
 * précède l'achat ne peut faire échouer le test pour une autre raison que
 * celle qu'on mesure.
 */
await clic('Options|Settings') || await p.evaluate(() => {
  [...document.querySelectorAll('button')].find(x => /⚙/.test(x.textContent || ''))?.click();
});
await pause(700);
await clic('marché noir|black market');
await pause(1000);

const boutons = await p.evaluate(() =>
  [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean));
/*
 * LES TROIS BOUTONS SONT BIEN LÀ.
 *
 * Sans ce contrôle, tout ce qui suit passerait au vert sur un écran VIDE :
 * « appuyer n'ouvre rien » est trivialement vrai quand il n'y a rien sur quoi
 * appuyer. C'est le piège exact de ce test, et il s'est refermé une fois, au
 * déménagement des cartes vers l'écran du marché noir.
 */
const ATTENDUS = [/JE PRENDS TOUT|TAKE IT ALL/i, /ME FAIRE UNE TÊTE|GIVE ME A FACE/i, /FICHE LA PAIX|LEAVE ME ALONE/i];
const manquants = ATTENDUS.filter(r => !boutons.some(t => r.test(t)));
verifier('le marché noir s\'ouvre et propose les trois achats',
  manquants.length === 0,
  manquants.length ? `absents : ${manquants.join(', ')}` : boutons.slice(0, 4).join(' · '));

/*
 * LE PRIX EST AFFICHÉ SUR LE BOUTON.
 *
 * Il ne l'était pas : les cartes vantaient le produit sans jamais dire
 * combien. Le prix venait de la feuille de paiement de Google, c'est-à-dire
 * APRÈS le clic, on demandait au joueur de s'engager avant de savoir.
 */
verifier('  …avec le prix écrit sur le bouton',
  boutons.some(t => /\d[,.]\d\d\s*€/.test(t)),
  boutons.find(t => /PRENDS|TÊTE|PAIX|TAKE|FACE|ALONE/i.test(t)) ?? '');

/*
 * CE QUE L'ÉCRAN DISAIT AVANT DE CLIQUER.
 *
 * Le contrôle du message d'échec, plus bas, cherche un mot dans la page. Or
 * « indisponible » apparaît déjà ailleurs dans les Options, dans le
 * formulaire de consentement. Chercher le mot seul aurait donné un contrôle
 * VIDE : vert quoi qu'il arrive, y compris si le message d'échec n'existait
 * pas. On garde donc l'état d'avant, et on exige que le message soit NOUVEAU.
 */
const avantClic = await p.evaluate(() => document.body.innerText);

for (const [nom, motif, cle] of [
  ['La paix', 'FICHE LA PAIX|LEAVE ME ALONE', 'roi-du-carton-noads'],
  ['l\'Atelier', 'ME FAIRE UNE TÊTE|GIVE ME A FACE', 'roi-du-carton-atelier'],
  ['Tout le carton', 'JE PRENDS TOUT|TAKE IT ALL', null],
]) {
  const trouve = await clic(motif);
  await pause(700);
  const etat = await p.evaluate(() => ({
    noads: localStorage.getItem('roi-du-carton-noads'),
    atelier: localStorage.getItem('roi-du-carton-atelier'),
    pub: window.__pub ? { sansPub: window.__pub.isAdsRemoved(), atelier: window.__pub.isAtelierOwned() } : null,
  }), cle);
  verifier(`appuyer sur « ${nom} » n'ouvre RIEN sans paiement`,
    trouve && etat.noads !== '1' && etat.atelier !== '1'
      && !etat.pub?.sansPub && !etat.pub?.atelier,
    trouve ? `noads=${etat.noads} atelier=${etat.atelier}` : 'bouton introuvable');
}

/*
 * Et le joueur doit l'APPRENDRE. Un bouton qui cesse de tourner sans un mot
 * laisse croire à un plantage ; c'est le cas que l'ancien code ne pouvait pas
 * avoir, puisqu'il ne pouvait pas échouer.
 */
const dit = await p.evaluate(() => document.body.innerText);
const MESSAGE = /pas à son carton|Nobody at the stall|fait la sourde|isn't listening/i;
verifier('  …et le dit au joueur',
  MESSAGE.test(dit) && !MESSAGE.test(avantClic),
  MESSAGE.test(avantClic) ? 'le message était déjà là : contrôle vide'
    : (dit.match(MESSAGE) ?? ['aucun message'])[0]);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nPlus rien ne s\'ouvre sans passer par la caisse.');
process.exit(echecs ? 1 : 0);
